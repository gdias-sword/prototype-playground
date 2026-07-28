import fs from 'node:fs';
import path from 'node:path';

export type Prototype = {
  username: string;
  slug: string;
  title: string;
  description?: string;
  createdAt: string;
};

export function getPrototypes(): Prototype[] {
  const app = path.join(process.cwd(), 'app');
  const prototypes: Prototype[] = [];

  for (const username of fs.readdirSync(app)) {
    const user = path.join(app, username);
    if (!fs.statSync(user).isDirectory()) continue;

    for (const slug of fs.readdirSync(user)) {
      const metaPath = path.join(user, slug, 'meta.json');
      if (!fs.existsSync(metaPath)) continue;

      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      prototypes.push({ username, slug, ...meta });
    }
  }

  return prototypes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
