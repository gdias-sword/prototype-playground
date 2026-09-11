import type { Prototype } from '@/playground/prototypes';
import Link from 'next/link';

interface PlaygroundItemProps {
  prototype: Prototype;
}

export function PlaygroundItem({ prototype }: PlaygroundItemProps) {
  return (
    <li>
      <Link
        href={`/${prototype.username}/${prototype.slug}`}
        className="group hover:bg-background-neutral-subtle flex items-baseline justify-between gap-4 bg-transparent py-4 transition-colors"
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
        <span className="text-body-medium-default text-foreground-neutral-faded shrink-0">
          {prototype.username}
        </span>
      </Link>
    </li>
  );
}
