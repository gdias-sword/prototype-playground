'use client';

import { teams } from '@/playground/teams';
import type { Prototype } from '@/playground/prototypes';
import { Input } from '@/design/components/input';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PlaygroundItem } from '@/components/playground-item';

interface GalleryProps {
  prototypes: Prototype[];
  author?: string;
}

const categories = ['All', ...teams] as const;

type CategoryFilter = (typeof categories)[number];

export function Gallery({ prototypes, author }: GalleryProps) {
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [query, setQuery] = useState('');

  const filteredPrototypes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return prototypes.filter((prototype) => {
      const matchesAuthor = !author || prototype.username === author;
      const matchesCategory =
        category === 'All' || prototype.author.team === category;
      const matchesQuery =
        !normalizedQuery ||
        [
          prototype.title,
          prototype.description,
          prototype.author.name,
          prototype.username,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery));

      return matchesAuthor && matchesCategory && matchesQuery;
    });
  }, [author, category, prototypes, query]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="bg-background-neutral-subtle flex w-fit flex-wrap gap-1 rounded-xl p-1"
          role="group"
          aria-label="Filter prototypes by team"
        >
          {categories.map((item) => {
            const isActive = category === item;

            return (
              <button
                key={item}
                type="button"
                aria-pressed={isActive}
                onClick={() => setCategory(item)}
                className={`text-body-medium-strong rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-background-neutral-default text-foreground-neutral-default shadow-sm'
                    : 'text-foreground-neutral-faded hover:text-foreground-neutral-default'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search
            className="text-foreground-neutral-faded pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            aria-label="Search prototypes"
            placeholder="Search prototypes..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="py-2.5 pl-10"
          />
        </div>
      </div>

      {filteredPrototypes.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrototypes.map((prototype) => (
            <PlaygroundItem
              key={`${prototype.username}/${prototype.slug}`}
              prototype={prototype}
            />
          ))}
        </ul>
      ) : (
        <div className="border-border-neutral-faded text-body-medium-default text-foreground-neutral-faded rounded-2xl border border-dashed px-6 py-16 text-center">
          No prototypes match your filters.
        </div>
      )}
    </div>
  );
}
