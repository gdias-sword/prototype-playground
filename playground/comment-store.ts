import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  BlobAccessError,
  BlobNotFoundError,
  BlobPreconditionFailedError,
  BlobError,
  get,
  put,
} from '@vercel/blob';

import {
  emptyCommentFile,
  parseCommentFile,
  type CommentFile,
  type MutationResult,
} from '@/playground/comment-model';

export function hashCommentToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isCommentToken(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export function prototypeBlobPath(pathname: string): string | null {
  const match = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (!match || match[1] === 'api') return null;
  const username = match[1];
  const slug = match[2];
  const metaPath = path.join(process.cwd(), 'app', username, slug, 'meta.json');
  if (!fs.existsSync(metaPath)) return null;
  return `comments/${username}/${slug}.json`;
}

export function commentsConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID,
  );
}

export async function readComments(blobPath: string): Promise<CommentFile> {
  const loaded = await loadBlob(blobPath);
  return loaded.file;
}

export async function updateComments(
  blobPath: string,
  mutate: (file: CommentFile) => MutationResult,
): Promise<MutationResult> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const loaded = await loadBlob(blobPath);
    const result = mutate(loaded.file);
    if (!result.ok || result.file.version === loaded.file.version) {
      return result;
    }
    try {
      await put(blobPath, JSON.stringify(result.file), {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
        ...(loaded.etag ? { ifMatch: loaded.etag } : { allowOverwrite: false }),
      });
      return result;
    } catch (error) {
      if (!isWriteConflict(error)) throw error;
    }
  }
  return {
    ok: false,
    status: 409,
    error: 'Could not save the comment. Try again.',
  };
}

async function loadBlob(
  blobPath: string,
): Promise<{ file: CommentFile; etag: string | null }> {
  try {
    const result = await get(blobPath, { access: 'private', useCache: false });
    if (result == null) {
      return { file: emptyCommentFile(), etag: null };
    }
    if (result.statusCode !== 200 || result.stream == null) {
      throw new Error('Unexpected comment file response');
    }
    const text = await new Response(result.stream).text();
    return {
      file: parseCommentFile(JSON.parse(text) as unknown),
      etag: result.blob.etag,
    };
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return { file: emptyCommentFile(), etag: null };
    }
    throw error;
  }
}

export function isCommentConfigError(error: unknown): boolean {
  return (
    error instanceof BlobError &&
    /credentials|read-write token/i.test(error.message)
  );
}

function isWriteConflict(error: unknown): boolean {
  if (error instanceof BlobPreconditionFailedError) return true;
  if (error instanceof BlobNotFoundError) return true;
  if (error instanceof BlobAccessError) return false;
  return error instanceof BlobError && /exist/i.test(error.message);
}
