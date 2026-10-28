'use client';

import { ClientRow, FinderHeader, FinderScreen, scrollBehavior, scrollToChild, SearchDock } from './chrome';
import {
  CLIENTS,
  REGIONS,
  clientsInRegion,
  matchesQuery,
  type RegionId,
} from './clients';
import { cn } from '@/design/utils';
import { useLayoutEffect, useRef, useState } from 'react';

export function SectionIndex() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [active, setActive] = useState<RegionId>('united-states');
  const [preview, setPreview] = useState<RegionId | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<RegionId, HTMLElement>());
  const savedScroll = useRef(0);
  const wasSearching = useRef(false);

  const groups = REGIONS.map((region) => ({
    ...region,
    clients: clientsInRegion(region.id, query),
  })).filter((group) => group.clients.length > 0);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const searching = query.trim().length > 0;
    if (searching) scroller.scrollTop = 0;
    else if (wasSearching.current) scroller.scrollTop = savedScroll.current;
    wasSearching.current = searching;
    if (!searching) return;
    const first = REGIONS.find(
      (region) => clientsInRegion(region.id, query).length > 0,
    );
    if (first) setActive(first.id);
  }, [query]);

  function syncActive() {
    const scroller = scrollerRef.current;
    if (!scroller || groups.length === 0) return;
    const line = scroller.scrollTop + 8;
    let current = groups[0].id;
    for (const group of groups) {
      const section = sectionRefs.current.get(group.id);
      if (!section) continue;
      const top =
        section.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      if (top <= line) current = group.id;
    }
    setActive(current);
  }

  function jump(id: RegionId, behavior: ScrollBehavior) {
    const scroller = scrollerRef.current;
    const section = sectionRefs.current.get(id);
    if (!scroller || !section) return;
    setActive(id);
    scrollToChild(scroller, section, behavior);
  }

  function scrub(clientY: number, rail: HTMLElement) {
    const buttons = [...rail.querySelectorAll<HTMLButtonElement>('button')];
    const hit = buttons.find((button) => {
      if (button.disabled) return false;
      const rect = button.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    });
    const id = hit?.dataset.region as RegionId | undefined;
    if (!id) return;
    setPreview(id);
    jump(id, 'auto');
  }

  return (
    <FinderScreen>
      <FinderHeader />
      <div className="relative z-10 min-h-0 flex-1">
        <div
          ref={scrollerRef}
          onScroll={syncActive}
          className="h-full overflow-y-auto overscroll-contain [overflow-anchor:none]"
        >
          {groups.length === 0 ? (
            <p className="text-body-large-strong px-4 py-8">
              No organizations match
            </p>
          ) : (
            groups.map((group) => (
              <section
                key={group.id}
                ref={(node) => {
                  if (node) sectionRefs.current.set(group.id, node);
                  else sectionRefs.current.delete(group.id);
                }}
              >
                <h2 className="text-body-large-strong sticky top-0 z-10 flex items-center justify-between border-b border-blue-200 bg-background-neutral-default/90 px-4 py-2 pr-10 text-blue-900 backdrop-blur-md">
                  {group.name}
                  {query.trim() ? (
                    <span className="text-body-medium-default text-foreground-neutral-faded">
                      {group.clients.length}
                    </span>
                  ) : null}
                </h2>
                <ul>
                  {group.clients.map((item) => (
                    <ClientRow
                      key={item.id}
                      client={item}
                      query={query}
                      isSelected={selectedId === item.id}
                      onSelect={setSelectedId}
                      className="pr-10"
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
          <div className="h-40" />
        </div>
        <div
          className="absolute top-1/2 right-1 z-20 flex -translate-y-1/2 touch-none flex-col rounded-full bg-background-neutral-default/80 py-1 shadow-sm backdrop-blur-md select-none"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            scrub(event.clientY, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            scrub(event.clientY, event.currentTarget);
          }}
          onPointerUp={() => setPreview(null)}
          onPointerCancel={() => setPreview(null)}
        >
          {REGIONS.map((region) => {
            const enabled = CLIENTS.some(
              (item) => item.region === region.id && matchesQuery(item.name, query),
            );
            return (
              <button
                key={region.id}
                type="button"
                data-region={region.id}
                disabled={!enabled}
                aria-label={region.name}
                aria-current={active === region.id ? 'location' : undefined}
                onPointerEnter={() => setPreview(region.id)}
                onPointerLeave={() => setPreview(null)}
                onClick={() => jump(region.id, scrollBehavior())}
                className={cn(
                  'relative px-2 py-2 text-[11px] leading-none font-semibold whitespace-nowrap',
                  active === region.id
                    ? 'text-blue-900'
                    : 'text-foreground-neutral-faded',
                  !enabled && 'opacity-30',
                )}
              >
                {region.short}
                {preview === region.id ? (
                  <span className="text-body-medium-strong absolute top-1/2 right-10 -translate-y-1/2 rounded-xl bg-blue-900 px-3 py-2 whitespace-nowrap text-white">
                    {region.name}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <SearchDock
        value={query}
        onValueChange={setQuery}
        onBeforeChange={() => {
          const scroller = scrollerRef.current;
          if (!scroller || query.trim()) return;
          savedScroll.current = scroller.scrollTop;
        }}
      />
    </FinderScreen>
  );
}
