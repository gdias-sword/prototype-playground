import type { Prototype } from '@/playground/prototypes';
import { Avatar, AvatarFallback } from '@/design/components/avatar';
import Link from 'next/link';

interface PlaygroundItemProps {
  prototype: Prototype;
}

function formatCreatedDate(created: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${created}T00:00:00`));
}

export function PlaygroundItem({ prototype }: PlaygroundItemProps) {
  const initials = prototype.author.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <li>
      <Link
        href={`/${prototype.username}/${prototype.slug}`}
        className="border-border-neutral-subtle bg-background-neutral-default group flex min-h-56 flex-col gap-5 rounded-2xl border p-5 transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="text-body-medium-subtle text-foreground-neutral-faded truncate">
              {prototype.author.name}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <h2 className="text-title-small-strong text-foreground-neutral-default">
            {prototype.title}
          </h2>
          <p className="text-body-medium-default text-foreground-neutral-faded line-clamp-3">
            {prototype.description || 'No description added yet.'}
          </p>
        </div>
        <div className="text-body-small-default text-foreground-neutral-faded flex items-center gap-3">
          <span>{formatCreatedDate(prototype.created)}</span>
        </div>
      </Link>
    </li>
  );
}
