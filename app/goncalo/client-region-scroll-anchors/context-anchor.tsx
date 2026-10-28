'use client';

import {
  ClientRow,
  FinderHeader,
  FinderScreen,
  scrollBehavior,
  scrollToChild,
  SearchDock,
} from './chrome';
import { REGIONS, clientsInRegion, type RegionId } from './clients';
import { cn } from '@/design/utils';
import { ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

export function ContextAnchor() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [active, setActive] = useState<RegionId>('united-states');
  const [isOpen, setIsOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<RegionId, HTMLElement>());
  const savedScroll = useRef(0);
  const wasSearching = useRef(false);
  const isJumping = useRef(false);

  const groups = REGIONS.map((region) => ({
    ...region,
    clients: clientsInRegion(region.id, query),
  })).filter((group) => group.clients.length > 0);

  const current = REGIONS.find((region) => region.id === active) ?? REGIONS[0];

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
    if (isJumping.current) return;
    setIsOpen(false);
    const scroller = scrollerRef.current;
    if (!scroller || groups.length === 0) return;
    const line = scroller.scrollTop + 8;
    let next = groups[0].id;
    for (const group of groups) {
      const section = sectionRefs.current.get(group.id);
      if (!section) continue;
      const top =
        section.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      if (top <= line) next = group.id;
    }
    setActive(next);
  }

  function jump(id: RegionId) {
    const scroller = scrollerRef.current;
    const section = sectionRefs.current.get(id);
    setIsOpen(false);
    setActive(id);
    if (!scroller || !section) return;
    const top =
      section.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop;
    if (Math.abs(top - scroller.scrollTop) < 2) return;
    isJumping.current = true;
    scrollToChild(scroller, section, scrollBehavior());
  }

  return (
    <FinderScreen>
      <FinderHeader />
      <div className="relative z-20">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between border-b border-blue-200 bg-background-neutral-default/90 px-4 py-2 text-left backdrop-blur-md"
        >
          <span className="text-body-large-strong text-blue-900">
            {groups.some((group) => group.id === active)
              ? current.name
              : (groups[0]?.name ?? 'No matches')}
          </span>
          <ChevronDown
            className={cn(
              'size-5 text-blue-900 transition-transform',
              isOpen && 'rotate-180',
            )}
            strokeWidth={1.5}
          />
        </button>
        {isOpen ? (
          <div className="absolute inset-x-0 top-full z-30 border-b border-border-neutral-subtle bg-background-neutral-default shadow-lg">
            {REGIONS.map((region) => {
              const count = clientsInRegion(region.id, query).length;
              const isCurrent = region.id === active && count > 0;
              return (
                <button
                  key={region.id}
                  type="button"
                  disabled={count === 0}
                  onClick={() => jump(region.id)}
                  className="flex w-full items-center justify-between border-b border-border-neutral-subtle px-4 py-3 text-left last:border-b-0 disabled:opacity-40"
                >
                  <span
                    className={cn(
                      'text-body-large-strong',
                      isCurrent ? 'text-blue-900' : 'text-foreground-neutral-default',
                    )}
                  >
                    {region.name}
                  </span>
                  <span className="text-body-medium-default text-foreground-neutral-faded">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div
        ref={scrollerRef}
        onScroll={syncActive}
        onScrollEnd={() => {
          isJumping.current = false;
        }}
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {groups.length === 0 ? (
          <p className="text-body-large-strong px-4 py-8">No organizations match</p>
        ) : (
          groups.map((group, index) => (
            <section
              key={group.id}
              ref={(node) => {
                if (node) sectionRefs.current.set(group.id, node);
                else sectionRefs.current.delete(group.id);
              }}
            >
              {index > 0 ? <div className="mx-4 border-t border-blue-200" /> : null}
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
          ))
        )}
        <div className="h-40" />
      </div>
      <SearchDock
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setIsOpen(false);
        }}
        onBeforeChange={() => {
          const scroller = scrollerRef.current;
          if (!scroller || query.trim()) return;
          savedScroll.current = scroller.scrollTop;
        }}
      />
    </FinderScreen>
  );
}
