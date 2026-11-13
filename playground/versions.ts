import fs from 'node:fs';
import path from 'node:path';

import {
  BlobError,
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  put,
} from '@vercel/blob';

export interface Version {
  sha: string;
  url: string;
  createdAt: string;
}

interface VersionFile {
  synced: boolean;
  versions: Version[];
}

interface PrototypeRef {
  username: string;
  slug: string;
  blobPath: string;
}

export class VersionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const MAX_VERSIONS = 100;

export function versionsConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

export async function loadVersions(
  pathname: string,
): Promise<{ currentSha: string | null; versions: Version[] }> {
  const ref = prototypeRef(pathname);
  if (!ref) throw new VersionError('Prototype not found.', 404);
  if (!versionsConfigured()) {
    return {
      currentSha: deploymentSha(),
      versions: await collectVersions(ref),
    };
  }
  const file = await ensureVersions(ref);
  return { currentSha: deploymentSha(), versions: file.versions };
}

export async function recordVersion(
  pathname: string,
  sha: string,
): Promise<Version[]> {
  if (!/^[0-9a-f]{7,40}$/i.test(sha)) {
    throw new VersionError('Unknown commit.', 400);
  }
  const ref = prototypeRef(pathname);
  if (!ref) throw new VersionError('Prototype not found.', 404);
  if (!versionsConfigured()) {
    throw new VersionError('Version storage is not configured.', 503);
  }
  const file = await ensureVersions(ref);
  if (file.versions.some((version) => version.sha.startsWith(sha))) {
    return file.versions;
  }
  const version = await lookupVersion(ref, sha);
  const saved = await updateVersions(ref.blobPath, (current) => ({
    synced: true,
    versions: mergeVersions(current.versions, version),
  }));
  return saved.versions;
}

function deploymentSha(): string | null {
  return process.env.VERCEL_GIT_COMMIT_SHA ?? null;
}

function prototypeRef(pathname: string): PrototypeRef | null {
  const match = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (!match || match[1] === 'api') return null;
  const username = match[1];
  const slug = match[2];
  const metaPath = path.join(process.cwd(), 'app', username, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  return {
    username,
    slug,
    blobPath: `versions/${username}/${slug}.json`,
  };
}

function emptyFile(): VersionFile {
  return { synced: false, versions: [] };
}

async function ensureVersions(ref: PrototypeRef): Promise<VersionFile> {
  const loaded = await loadBlob(ref.blobPath);
  if (loaded.file.synced) return loaded.file;
  const versions = await collectVersions(ref);
  return updateVersions(ref.blobPath, (current) =>
    current.synced ? null : { synced: true, versions },
  );
}

async function collectVersions(ref: PrototypeRef): Promise<Version[]> {
  const commits = await github<
    { sha: string; commit: { committer: { date: string } } }[]
  >(
    `/repos/${repository()}/commits?sha=main&path=${encodeURIComponent(`app/${ref.username}/${ref.slug}`)}&per_page=30`,
  );
  const found = await mapPool(commits, 4, async (commit) => {
    try {
      return await lookupVersion(ref, commit.sha);
    } catch (error) {
      if (error instanceof VersionError && error.status < 500) return null;
      throw error;
    }
  });
  return found
    .filter((version): version is Version => version !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await run(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

async function lookupVersion(ref: PrototypeRef, sha: string): Promise<Version> {
  const commit = await github<{
    sha: string;
    commit: { committer: { date: string } };
    files?: { filename: string }[];
  }>(`/repos/${repository()}/commits/${sha}`);
  const prefix = `app/${ref.username}/${ref.slug}/`;
  const files = commit.files ?? [];
  if (
    files.length === 0 ||
    files.some((file) => !file.filename.startsWith(prefix))
  ) {
    throw new VersionError('This commit is not a prototype share.', 422);
  }
  const url = await deploymentOrigin(commit.sha);
  if (!url) {
    throw new VersionError('This share has no deployment yet.', 422);
  }
  return {
    sha: commit.sha,
    url,
    createdAt: commit.commit.committer.date,
  };
}

async function deploymentOrigin(sha: string): Promise<string | null> {
  const deployments = await github<
    { id: number; environment: string; created_at: string }[]
  >(`/repos/${repository()}/deployments?sha=${sha}&per_page=10`);
  const ordered = [...deployments].sort((a, b) => {
    if (a.environment === b.environment) {
      return b.created_at.localeCompare(a.created_at);
    }
    return a.environment === 'Production' ? -1 : 1;
  });
  for (const deployment of ordered) {
    const statuses = await github<
      { state: string; environment_url?: string | null }[]
    >(`/repos/${repository()}/deployments/${deployment.id}/statuses`);
    const success = statuses.find(
      (status) => status.state === 'success' && status.environment_url,
    );
    if (!success?.environment_url) continue;
    return new URL(success.environment_url).origin;
  }
  return null;
}

function mergeVersions(versions: Version[], version: Version): Version[] {
  return [...versions.filter((item) => item.sha !== version.sha), version]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_VERSIONS);
}

function repository(): string {
  const owner = process.env.VERCEL_GIT_REPO_OWNER ?? 'gdias-sword';
  const name = process.env.VERCEL_GIT_REPO_SLUG ?? 'prototype-playground';
  return `${owner}/${name}`;
}

async function github<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'prototype-playground',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    cache: 'no-store',
  });
  if (response.status === 404) {
    throw new VersionError('Unknown commit.', 404);
  }
  if (!response.ok) {
    throw new VersionError('Could not read version history.', 502);
  }
  return (await response.json()) as T;
}

async function updateVersions(
  blobPath: string,
  mutate: (file: VersionFile) => VersionFile | null,
): Promise<VersionFile> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const loaded = await loadBlob(blobPath);
    const next = mutate(loaded.file);
    if (!next) return loaded.file;
    try {
      await put(blobPath, JSON.stringify(next), {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
        ...(loaded.etag ? { ifMatch: loaded.etag } : { allowOverwrite: false }),
      });
      return next;
    } catch (error) {
      if (!isWriteConflict(error)) throw error;
    }
  }
  throw new VersionError('Could not save versions.', 409);
}

async function loadBlob(
  blobPath: string,
): Promise<{ file: VersionFile; etag: string | null }> {
  try {
    const result = await get(blobPath, { access: 'private', useCache: false });
    if (result == null || result.statusCode !== 200 || result.stream == null) {
      return { file: emptyFile(), etag: null };
    }
    const text = await new Response(result.stream).text();
    return {
      file: parseVersionFile(JSON.parse(text) as unknown),
      etag: result.blob.etag,
    };
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return { file: emptyFile(), etag: null };
    }
    if (
      error instanceof BlobError &&
      /credentials|read-write token/i.test(error.message)
    ) {
      throw new VersionError('Version storage is not configured.', 503);
    }
    throw error;
  }
}

function parseVersionFile(value: unknown): VersionFile {
  if (!value || typeof value !== 'object') return emptyFile();
  const file = value as { synced?: unknown; versions?: unknown };
  if (!Array.isArray(file.versions)) return emptyFile();
  const versions = file.versions.filter(isVersion);
  return { synced: file.synced === true, versions };
}

function isVersion(value: unknown): value is Version {
  if (!value || typeof value !== 'object') return false;
  const version = value as Version;
  return (
    typeof version.sha === 'string' &&
    /^[0-9a-f]{40}$/i.test(version.sha) &&
    typeof version.url === 'string' &&
    /^https:\/\/[a-z0-9.-]+$/i.test(version.url) &&
    typeof version.createdAt === 'string' &&
    !Number.isNaN(Date.parse(version.createdAt))
  );
}

function isWriteConflict(error: unknown): boolean {
  if (error instanceof BlobPreconditionFailedError) return true;
  if (error instanceof BlobNotFoundError) return true;
  return error instanceof BlobError && /exist/i.test(error.message);
}
