import path from 'node:path';

import { isSafePathSegment, toPascal, toSlug } from '@/utils/identifiers';

export interface Meta {
  title: string;
  createdAt: string;
  description?: string;
}

function buildPrototypeSource(input: {
  component: string;
  title: string;
  description?: string;
  pathAbsolute: string;
  pathRelative: string;
}): string {
  return `'use client';

import { PrototypeStarter } from '@/components/prototype-starter';

export default function ${input.component}() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <PrototypeStarter
        title={${JSON.stringify(input.title)}}
        description={${JSON.stringify(input.description)}}
        pathAbsolute={${JSON.stringify(input.pathAbsolute)}}
        pathRelative={${JSON.stringify(input.pathRelative)}}
      />
      <div>{/* Your prototype here */}</div>
    </div>
  );
}
`;
}

export type PlanPrototypeScaffoldResult =
  | {
      ok: true;
      username: string;
      slug: string;
      resolvedTarget: string;
      pagePath: string;
      metaPath: string;
      meta: Meta;
      pageSource: string;
    }
  | { ok: false; error: string };

const PLAYGROUND_USERNAME_ERROR =
  'Add a repo-root `.playground` file with a line like USERNAME=your-name (lowercase letters, numbers, hyphens only).';

export function planPrototypeScaffold(input: {
  title: string;
  description?: string;
  createdAt: string;
  appRoot: string;
  username: string | null;
}): PlanPrototypeScaffoldResult {
  if (!input.username || !isSafePathSegment(input.username)) {
    return { ok: false, error: PLAYGROUND_USERNAME_ERROR };
  }

  const username = input.username;
  const slug = toSlug(input.title) || 'prototype';
  if (!isSafePathSegment(slug)) {
    return {
      ok: false,
      error:
        'Could not derive a valid URL slug from that title. Try different wording.',
    };
  }

  const targetDir = path.join(input.appRoot, username, slug);
  const resolvedTarget = path.resolve(targetDir);
  const resolvedAppRoot = path.resolve(input.appRoot);

  if (
    !resolvedTarget.startsWith(resolvedAppRoot + path.sep) &&
    resolvedTarget !== resolvedAppRoot
  ) {
    return { ok: false, error: 'Invalid path.' };
  }

  const pascal = toPascal(input.title);
  const component = pascal && !/^[0-9]/.test(pascal) ? pascal : 'Prototype';
  const pagePath = path.join(resolvedTarget, 'page.tsx');
  const metaPath = path.join(resolvedTarget, 'meta.json');
  const pathAbsolute = path.resolve(pagePath);
  const pathRelative = path
    .join('app', username, slug, 'page.tsx')
    .split(path.sep)
    .join('/');

  const meta: Meta = {
    title: input.title,
    createdAt: input.createdAt,
  };
  if (input.description) {
    meta.description = input.description;
  }

  const pageSource = buildPrototypeSource({
    component,
    title: input.title,
    description: input.description,
    pathAbsolute,
    pathRelative,
  });

  return {
    ok: true,
    username,
    slug,
    resolvedTarget,
    pagePath,
    metaPath,
    meta,
    pageSource,
  };
}
