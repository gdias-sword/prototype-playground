import { getPrototypes } from '@/config/registry';
import { readPlaygroundUsername } from '@/config/user';

export default function Gallery() {
  const prototypes = getPrototypes();
  const playgroundUsername = readPlaygroundUsername();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-title-large-strong text-foreground-neutral-default">
          Playground
        </h1>
      </header>

      {prototypes.length === 0 ? (
        <p className="text-body-medium-default text-foreground-neutral-faded">
          No prototypes yet. Create a folder at{' '}
          <code className="font-mono">app/[your-name]/[slug]/</code> with a{' '}
          <code className="font-mono">page.tsx</code> and{' '}
          <code className="font-mono">meta.json</code> to get started.
        </p>
      ) : (
        <ul className="divide-border-neutral-faded divide-y">
          {prototypes.map((prototype) => (
            <PlaygroundItem
              key={`${prototype.username}/${prototype.slug}`}
              prototype={prototype}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
