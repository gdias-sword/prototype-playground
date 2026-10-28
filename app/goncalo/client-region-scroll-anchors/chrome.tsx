import background from './assets/thrive-background.jpg';
import { assetSrc, type Client } from './clients';
import { cn } from '@/design/utils';
import { ArrowLeft, Menu, Search, X } from 'lucide-react';
import type { ReactNode } from 'react';

export function scrollBehavior(): ScrollBehavior {
  if (typeof window === 'undefined') return 'auto';
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

export function scrollToChild(
  scroller: HTMLElement,
  child: HTMLElement,
  behavior: ScrollBehavior,
) {
  const top =
    child.getBoundingClientRect().top -
    scroller.getBoundingClientRect().top +
    scroller.scrollTop;
  scroller.scrollTo({ top, behavior });
}

function StatusBar() {
  return (
    <div className="flex h-12 items-end justify-between px-7 pb-1.5 text-foreground-neutral-default">
      <span className="text-[15px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
        8:34
      </span>
      <span className="flex items-center gap-1.5 pb-px" aria-hidden>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="4.5" rx="0.6" />
          <rect x="4.5" y="5.2" width="3" height="6.8" rx="0.6" />
          <rect x="9" y="2.6" width="3" height="9.4" rx="0.6" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.6" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M1.2 3.95a9.1 9.1 0 0 1 13.6 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3.4 6.4a5.8 5.8 0 0 1 9.2 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M5.6 8.8a2.65 2.65 0 0 1 4.8 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.05" r="1.05" fill="currentColor" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="2.5"
            stroke="currentColor"
            strokeOpacity="0.36"
          />
          <rect x="2" y="2" width="18" height="8" rx="1.35" fill="currentColor" />
          <rect
            x="23"
            y="3.8"
            width="1.6"
            height="4.4"
            rx="0.8"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}

export function FinderScreen({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col bg-background-neutral-default text-foreground-neutral-default">
      <img
        src={assetSrc(background)}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      {children}
    </div>
  );
}

export function FinderHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="relative z-20 flex flex-col gap-3">
      <StatusBar />
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          aria-label="Back"
          className="flex size-10 items-center justify-center"
        >
          <ArrowLeft className="size-6" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-label="Menu"
          className="flex size-10 items-center justify-center"
        >
          <Menu className="size-6" strokeWidth={1.5} />
        </button>
      </div>
      <div className="flex flex-col gap-3 px-4">
        <h1 className="font-serif text-[28px] leading-[34px] font-normal tracking-[-0.56px]">
          Find your organization
        </h1>
        {children}
      </div>
    </header>
  );
}

export function Highlight({ text, query }: { text: string; query: string }) {
  const needle = query.trim();
  const index = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-blue-100 text-inherit">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  );
}

function initials(name: string) {
  const words = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ''))
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ClientMark({ name }: { name: string }) {
  return (
    <span className="flex size-[52px] shrink-0 items-center justify-center rounded-xl bg-background-neutral-default">
      <span className="text-body-medium-strong text-foreground-neutral-subtle">
        {initials(name)}
      </span>
    </span>
  );
}

export function ClientRow({
  client,
  query,
  subtitle,
  isSelected,
  onSelect,
  className,
  clientKey,
}: {
  client: Client;
  query: string;
  subtitle?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  className?: string;
  clientKey?: string;
}) {
  return (
    <li>
      <button
        type="button"
        data-client-id={clientKey ?? client.id}
        onClick={() => onSelect(client.id)}
        className={cn(
          'flex w-full items-center gap-4 border-b border-border-neutral-subtle p-4 text-left',
          isSelected ? 'bg-background-neutral-default' : 'hover:bg-white/50',
          className,
        )}
      >
        <ClientMark name={client.name} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body-large-strong">
            <Highlight text={client.name} query={query} />
          </span>
          {subtitle ? (
            <span className="text-body-medium-default text-foreground-neutral-faded">
              {subtitle}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

export function SearchDock({
  value,
  onValueChange,
  onBeforeChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onBeforeChange?: () => void;
  children?: ReactNode;
}) {
  return (
    <div data-search-dock className="absolute inset-x-0 bottom-0 z-30">
      <div className="flex flex-col gap-2 bg-gradient-to-b from-white/0 to-white/40 px-4 pt-6 pb-10 backdrop-blur-[5px]">
        {children}
        <div className="flex items-center gap-2 rounded-2xl border border-border-neutral-default bg-background-neutral-default px-4 py-3 focus-within:ring-2 focus-within:ring-background-brand-default">
          <Search
            className="size-6 shrink-0 text-foreground-neutral-subtle"
            strokeWidth={1.5}
            aria-hidden
          />
          <input
            type="search"
            value={value}
            onChange={(event) => {
              onBeforeChange?.();
              onValueChange(event.target.value);
            }}
            placeholder="Search your employer or health plan"
            aria-label="Search your employer or health plan"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="text-body-large-subtle w-full min-w-0 bg-transparent text-foreground-neutral-default outline-none placeholder:text-foreground-neutral-subtle [&::-webkit-search-cancel-button]:appearance-none"
          />
          {value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onBeforeChange?.();
                onValueChange('');
              }}
              className="flex size-6 shrink-0 items-center justify-center text-foreground-neutral-subtle"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
        <span className="h-[5px] w-[134px] rounded-full bg-foreground-neutral-default" />
      </div>
    </div>
  );
}
