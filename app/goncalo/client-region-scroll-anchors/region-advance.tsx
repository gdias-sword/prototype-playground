'use client';

import { ClientRow, FinderHeader, FinderScreen, scrollBehavior, scrollToChild, SearchDock } from './chrome';
import { REGIONS, clientsInRegion, type RegionId } from './clients';
import { cn } from '@/design/utils';
import { ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

export function RegionAdvance({
  progress = false,
  chevron = false,
}: {
  progress?: boolean;
  chevron?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    syncScroll();
  }, [query, progress]);

  function syncScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const scrollerRect = scroller.getBoundingClientRect();
    let edge = scrollerRect.top;
    let nearest = Infinity;
    for (const header of scroller.querySelectorAll('h2')) {
      const rect = header.getBoundingClientRect();
      const delta = scrollerRect.top - rect.top;
      if (delta < -1 || delta >= nearest) continue;
      nearest = delta;
      edge = rect.bottom;
    }
    for (const list of scroller.querySelectorAll('ul')) {
      const cut = edge - list.getBoundingClientRect().top;
      list.style.clipPath = cut > 0.5 ? `inset(${cut}px 0 0 0)` : '';
    }
    if (!progress) return;

    const dock = scroller.parentElement?.parentElement?.querySelector(
      '[data-search-dock]',
    );
    const viewBottom = Math.min(
      scrollerRect.bottom,
      dock?.getBoundingClientRect().top ?? scrollerRect.bottom,
    );
    for (const section of scroller.querySelectorAll('section')) {
      const list = section.querySelector('ul');
      const bar = section.querySelector<HTMLElement>('[data-region-progress]');
      if (!list || !bar) continue;
      const { top, height } = list.getBoundingClientRect();
      const viewed =
        height <= 0 ? 0 : Math.min(1, Math.max(0, (viewBottom - top) / height));
      bar.style.transform = `scaleX(${viewed})`;
    }
  }

  function jump(id: RegionId, behavior: ScrollBehavior) {
    const scroller = scrollerRef.current;
    const section = sectionRefs.current.get(id);
    if (!scroller || !section) return;
    scrollToChild(scroller, section, behavior);
  }

  return (
    <FinderScreen>
      <FinderHeader />
      <div className="relative z-10 min-h-0 flex-1">
        <div
          ref={scrollerRef}
          onScroll={syncScroll}
          className="h-full overflow-y-auto overscroll-contain [overflow-anchor:none]"
        >
          {groups.length === 0 ? (
            <p className="text-body-large-strong px-4 py-8">
              No organizations match
            </p>
          ) : (
            groups.map((group, index) => {
              const next = groups[index + 1];
              return (
                <section
                  key={group.id}
                  ref={(node) => {
                    if (node) sectionRefs.current.set(group.id, node);
                    else sectionRefs.current.delete(group.id);
                  }}
                >
                  <h2
                    className={cn(
                      'text-body-large-strong text-foreground-neutral-default sticky top-0 z-10 flex items-center gap-2 px-4 py-4',
                      !progress && 'border-b border-border-neutral-subtle',
                    )}
                  >
                    <span>{group.name}</span>
                    {query.trim() ? (
                      <span className="text-body-medium-default text-foreground-neutral-faded">
                        {group.clients.length}
                      </span>
                    ) : null}
                    {chevron && next ? (
                      <button
                        type="button"
                        aria-label={`Next region, ${next.name}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          jump(next.id, scrollBehavior());
                        }}
                        className="absolute top-1/2 right-4 flex size-8 -translate-y-1/2 items-center justify-center"
                      >
                        <ChevronDown
                          className="size-5 text-foreground-neutral-subtle"
                          strokeWidth={1.5}
                        />
                      </button>
                    ) : null}
                    {progress ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border-neutral-subtle"
                      >
                        <span
                          data-region-progress
                          className="block h-full origin-left bg-foreground-neutral-subtle"
                        />
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
                      />
                    ))}
                  </ul>
                </section>
              );
            })
          )}
          <div className="h-40" />
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
