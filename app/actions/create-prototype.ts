'use server';

import { readPlaygroundUsername } from '@/config/user';
import { planPrototypeScaffold } from '@/utils/scaffold';
import { redirect } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';

export interface CreatePrototypeState {
  error?: string;
}

export async function createPrototype(
  _prev: CreatePrototypeState,
  formData: FormData,
): Promise<CreatePrototypeState> {
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Creating prototypes only works in local development.' };
  }

  const title = String(formData.get('title') ?? '').trim();
  const descriptionRaw = String(formData.get('description') ?? '').trim();
  const description = descriptionRaw || undefined;

  if (!title) {
    return { error: 'Enter a title.' };
  }

  const appRoot = path.join(/* turbopackIgnore: true */ process.cwd(), 'app');
  const created = new Date().toISOString().slice(0, 10);
  const planned = planPrototypeScaffold({
    title,
    description,
    created,
    appRoot,
    username: readPlaygroundUsername(),
  });

  if (!planned.ok) {
    return { error: planned.error };
  }

  const {
    username,
    slug,
    resolvedTarget,
    pagePath,
    metaPath,
    meta,
    pageSource,
  } = planned;

  if (fs.existsSync(/* turbopackIgnore: true */ resolvedTarget)) {
    return {
      error: `That title is already taken (app/${username}/${slug}/ exists). Change the title.`,
    };
  }

  fs.mkdirSync(/* turbopackIgnore: true */ resolvedTarget, { recursive: true });

  fs.writeFileSync(
    /* turbopackIgnore: true */ metaPath,
    `${JSON.stringify(meta, null, 2)}\n`,
    'utf-8',
  );
  fs.writeFileSync(/* turbopackIgnore: true */ pagePath, pageSource, 'utf-8');

  redirect(`/${username}/${slug}`);
}
