import { CreatePrototypeDialog } from '@/components/create-prototype-dialog';
import { Gallery } from '@/components/gallery';
import { readPlaygroundUsername } from '@/playground/identity';
import { getPrototypes } from '@/playground/prototypes';

export default async function Playground({
  searchParams,
}: {
  searchParams: Promise<{ author?: string | string[] }>;
}) {
  const prototypes = getPrototypes();
  const playgroundUsername = readPlaygroundUsername();
  const { author } = await searchParams;

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-title-large-strong text-foreground-neutral-default">
            Prototypes
          </h1>
          <p className="text-body-large-default text-foreground-neutral-faded">
            Every prototype in the gallery, newest first.
          </p>
        </div>
        {playgroundUsername ? (
          <CreatePrototypeDialog playgroundUsername={playgroundUsername} />
        ) : null}
      </header>
      <Gallery
        prototypes={prototypes}
        author={typeof author === 'string' ? author : undefined}
      />
    </>
  );
}
