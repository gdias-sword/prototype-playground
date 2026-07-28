import { CreatePrototypeDialog } from '@/components/create-prototype-dialog';
import { PlaygroundContainer } from '@/components/playground-container';
import { PlaygroundItem } from '@/components/playground-item';
import { getPrototypes } from '@/config/registry';
import { readPlaygroundUsername } from '@/config/user';
import { SwordLogo } from '@/design/assets/logos/sword';

export default function Gallery() {
  const prototypes = getPrototypes();
  const playgroundUsername = readPlaygroundUsername();

  return (
    <PlaygroundContainer>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-5">
          <SwordLogo variant="primary" className="w-24" />
          <h1 className="text-title-large-strong text-foreground-neutral-default">
            Prototype Playground
          </h1>
        </div>
        {process.env.NODE_ENV !== 'production' ? (
          <CreatePrototypeDialog playgroundUsername={playgroundUsername} />
        ) : null}
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
    </PlaygroundContainer>
  );
}
