import fs from 'node:fs';
import path from 'node:path';

import { getContributors, type Contributor } from '@/playground/prototypes';

export function readPlaygroundUsername(): string | null {
  const file = path.join(process.cwd(), '.playground');
  if (!fs.existsSync(file)) {
    return null;
  }

  const text = fs.readFileSync(file, 'utf-8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key === 'USERNAME' && value) {
      return value;
    }
  }
  return null;
}

export function getCurrentContributor(): Contributor | null {
  const username = readPlaygroundUsername();
  if (!username) return null;
  return (
    getContributors().find(
      (contributor) => contributor.username === username,
    ) ?? null
  );
}
