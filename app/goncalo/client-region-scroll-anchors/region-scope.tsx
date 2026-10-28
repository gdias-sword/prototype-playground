'use client';

import { ClientRow, FinderHeader, FinderScreen, SearchDock } from './chrome';
import { REGIONS, clientsInRegion, type RegionId } from './clients';
import { cn } from '@/design/utils';
import { useLayoutEffect, useRef, useState } from 'react';

export function RegionScope() {
  const [region, setRegion] = useState<RegionId>('united-states');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrolls = useRef<Record<RegionId, number>>({
    'united-states': 0,
    canada: 0,
    europe: 0,
  });

  const clients = clientsInRegion(region, query);
  const elsewhere = REGIONS.filter(
    (item) => item.id !== region && clientsInRegion(item.id, query).length > 0,
  );

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTop = query.trim() ? 0 : scrolls.current[region];
  }, [region, query]);

  function selectRegion(next: RegionId) {
    if (next === region) return;
    const scroller = scrollerRef.current;
    if (scroller && query.trim() === '') {
      scrolls.current[region] = scroller.scrollTop;
    }
    setRegion(next);
  }

  function handleQuery(value: string) {
    const scroller = scrollerRef.current;
    if (scroller && query.trim() === '' && value.trim() !== '') {
      scrolls.current[region] = scroller.scrollTop;
    }
    setQuery(value);
  }

  return (
    <FinderScreen>
      <FinderHeader>
        <div className="flex gap-1 rounded-full bg-white/50 p-1">
          {REGIONS.map((item) => {
            const isSelected = item.id === region;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectRegion(item.id)}
                className={cn(
                  'text-body-small-strong flex-1 rounded-full px-2 py-2 whitespace-nowrap',
                  isSelected
                    ? 'bg-background-neutral-default text-blue-900 shadow-sm'
                    : 'text-foreground-neutral-subtle',
                )}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </FinderHeader>
      <div
        ref={scrollerRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {clients.length === 0 ? (
          <div className="flex flex-col gap-4 px-4 py-8">
            <p className="font-serif text-[24px] leading-8 tracking-[-0.24px]">
              {query.trim()
                ? `Nothing in ${REGIONS.find((item) => item.id === region)?.name}`
                : 'No organizations'}
            </p>
            {elsewhere.length > 0 ? (
              <div className="flex flex-col gap-2">
                {elsewhere.map((item) => {
                  const count = clientsInRegion(item.id, query).length;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectRegion(item.id)}
                      className="flex items-center justify-between rounded-2xl bg-background-neutral-default px-4 py-3 text-left"
                    >
                      <span className="text-body-large-strong">{item.name}</span>
                      <span className="text-body-medium-default text-foreground-neutral-faded">
                        {count} {count === 1 ? 'match' : 'matches'}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-body-medium-default text-foreground-neutral-faded">
                Try another spelling.
              </p>
            )}
          </div>
        ) : (
          <ul>
            {clients.map((item) => (
              <ClientRow
                key={item.id}
                client={item}
                query={query}
                isSelected={selectedId === item.id}
                onSelect={setSelectedId}
              />
            ))}
          </ul>
        )}
        <div className="h-40" />
      </div>
      <SearchDock value={query} onValueChange={handleQuery} />
    </FinderScreen>
  );
}
