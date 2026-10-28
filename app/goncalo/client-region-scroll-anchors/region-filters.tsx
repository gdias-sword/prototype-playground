'use client';

import { ClientRow, FinderHeader, FinderScreen, SearchDock } from './chrome';
import {
  CLIENTS_ALPHA,
  REGIONS,
  matchesQuery,
  regionName,
  type RegionId,
} from './clients';
import { cn } from '@/design/utils';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

interface Anchor {
  id: string;
  offset: number;
}

export function RegionFilters() {
  const [query, setQuery] = useState('');
  const [enabled, setEnabled] = useState<RegionId[]>(REGIONS.map((region) => region.id));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<Anchor | null>(null);

  const visible = useMemo(
    () =>
      CLIENTS_ALPHA.filter(
        (client) => enabled.includes(client.region) && matchesQuery(client.name, query),
      ),
    [enabled, query],
  );
  const visibleKey = visible.map((client) => client.id).join('|');

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const anchor = anchorRef.current;
    if (!scroller || !anchor) return;
    const row = scroller.querySelector<HTMLElement>(
      `[data-client-id="${CSS.escape(anchor.id)}"]`,
    );
    if (!row) {
      scroller.scrollTop = 0;
      anchorRef.current = null;
      return;
    }
    const delta =
      row.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTop += delta - anchor.offset;
  }, [visibleKey]);

  function captureAnchor() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerTop = scroller.getBoundingClientRect().top;
    const rows = scroller.querySelectorAll<HTMLElement>('[data-client-id]');
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (rect.bottom > scrollerTop + 4 && row.dataset.clientId) {
        anchorRef.current = {
          id: row.dataset.clientId,
          offset: rect.top - scrollerTop,
        };
        return;
      }
    }
    anchorRef.current = null;
  }

  function toggle(id: RegionId) {
    captureAnchor();
    setEnabled((current) =>
      current.includes(id)
        ? current.filter((region) => region !== id)
        : [...current, id],
    );
  }

  return (
    <FinderScreen>
      <FinderHeader />
      <div
        ref={scrollerRef}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none]"
      >
        {visible.length === 0 ? (
          <div className="flex flex-col items-start gap-4 px-4 py-8">
            <p className="text-body-large-strong">
              {enabled.length === 0 ? 'No region selected' : 'No organizations match'}
            </p>
            {enabled.length === 0 ? (
              <button
                type="button"
                onClick={() => setEnabled(REGIONS.map((region) => region.id))}
                className="text-body-large-strong rounded-2xl bg-background-neutral-default px-4 py-3 text-blue-900"
              >
                Show every region
              </button>
            ) : null}
          </div>
        ) : (
          <ul>
            {visible.map((client) => (
              <ClientRow
                key={client.id}
                client={client}
                query={query}
                subtitle={regionName(client.region)}
                isSelected={selectedId === client.id}
                onSelect={setSelectedId}
                clientKey={client.id}
              />
            ))}
          </ul>
        )}
        <div className="h-48" />
      </div>
      <SearchDock
        value={query}
        onValueChange={setQuery}
        onBeforeChange={captureAnchor}
      >
        <div className="flex gap-2">
          {REGIONS.map((region) => {
            const isOn = enabled.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(region.id)}
                className={cn(
                  'text-body-small-strong flex-1 rounded-full px-2 py-2 whitespace-nowrap',
                  isOn
                    ? 'bg-blue-900 text-white'
                    : 'border border-blue-200 bg-background-neutral-default text-blue-900',
                )}
              >
                {region.name}
              </button>
            );
          })}
        </div>
      </SearchDock>
    </FinderScreen>
  );
}
