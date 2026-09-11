'use client';

import { Button } from '@/design/components/button';
import { cn } from '@/design/utils';

interface PrototypeStarterProps {
  title: string;
  description?: string;
  pathAbsolute: string;
  pathRelative: string;
}

export function PrototypeStarter({
  title,
  description,
  pathAbsolute,
  pathRelative: _pathRelative,
}: PrototypeStarterProps) {
  function handleOpenCursor() {
    const normalized = pathAbsolute.replace(/\\/g, '/');
    window.location.href = `cursor://file/${normalized}`;
  }

  return (
    <div
      className={cn(
        'bg-background-neutral-subtle flex max-w-(--breakpoint-sm) flex-col gap-5 rounded-2xl p-6',
      )}
    >
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-title-medium-strong text-foreground-neutral-default">
          {title}
        </h2>
        {description ? (
          <p className="text-body-medium-default text-foreground-neutral-faded">
            {description}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant="solid"
        size="medium"
        onClick={handleOpenCursor}
      >
        Open in Cursor
      </Button>
    </div>
  );
}
