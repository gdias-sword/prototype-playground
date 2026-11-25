import fs from 'node:fs';
import path from 'node:path';

import { isProduct, type Product } from '@/playground/products';

export function readPrototypeProduct(pathname: string): Product | undefined {
  const match = /^\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/.exec(pathname);
  if (!match || match[1] === 'api') return undefined;

  const metaPath = path.join(
    process.cwd(),
    'app',
    match[1],
    match[2],
    'meta.json',
  );
  if (!fs.existsSync(metaPath)) return undefined;

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as {
      product?: unknown;
    };
    return isProduct(meta.product) ? meta.product : undefined;
  } catch {
    return undefined;
  }
}
