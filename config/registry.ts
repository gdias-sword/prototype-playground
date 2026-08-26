import fs from 'node:fs';
import path from 'node:path';

export type Prototype = {
  username: string;
  slug: string;
  title: string;
  description?: string;
  created: string;
};

export function getPrototypes(): Prototype[] {
  const app = path.join(process.cwd(), 'app');
  const prototypes: Prototype[] = [];

  for (const username of fs.readdirSync(/* turbopackIgnore: true */ app)) {
    const user = path.join(/* turbopackIgnore: true */ app, username);
    if (!fs.statSync(/* turbopackIgnore: true */ user).isDirectory()) continue;

    for (const slug of fs.readdirSync(/* turbopackIgnore: true */ user)) {
      const metaPath = path.join(
        /* turbopackIgnore: true */ user,
        slug,
        'meta.json',
      );
      if (!fs.existsSync(/* turbopackIgnore: true */ metaPath)) continue;

      const meta = JSON.parse(
        fs.readFileSync(/* turbopackIgnore: true */ metaPath, 'utf-8'),
      );
      prototypes.push({ username, slug, ...meta });
    }
  }

  return prototypes.sort((a, b) => b.created.localeCompare(a.created));
}
