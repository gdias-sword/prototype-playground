import { getPrototypes } from '@/config/registry';
import Link from 'next/link';

export default function Gallery() {
  const prototypes = getPrototypes();

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
            <li key={`${prototype.username}/${prototype.slug}`}>
              <Link
                href={`/${prototype.username}/${prototype.slug}`}
                className="group flex items-baseline justify-between gap-4 py-4 transition-opacity hover:opacity-80"
              >
                <div className="min-w-0">
                  <span className="text-body-large-strong text-foreground-neutral-default">
                    {prototype.title}
                  </span>
                  {prototype.description && (
                    <p className="text-body-medium-default text-foreground-neutral-faded mt-0.5 truncate">
                      {prototype.description}
                    </p>
                  )}
                </div>
                <span className="text-body-small-default text-foreground-neutral-faded shrink-0">
                  {prototype.username}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
