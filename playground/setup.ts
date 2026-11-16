import fs from 'node:fs';
import path from 'node:path';

export function readSetupPrompt(): string | null {
  const file = path.join(process.cwd(), 'docs/setup.md');
  if (!fs.existsSync(file)) return null;

  const text = fs.readFileSync(file, 'utf-8').replace(/^# .+\n+/, '').trim();

  return text || null;
}
