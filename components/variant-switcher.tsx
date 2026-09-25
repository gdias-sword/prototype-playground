'use client';

import { cn } from '@/design/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

export interface VariantOption {
  id: string;
  label: string;
}

interface VariantSwitcherProps {
  variants: VariantOption[];
  children: (variant: string) => ReactNode;
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest('input, textarea, select, [contenteditable="true"]'),
    )
  );
}

function VariantSwitcherInner({ variants, children }: VariantSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const active = useMemo(() => {
    const requested = searchParams.get('variant');
    if (requested && variants.some((variant) => variant.id === requested)) {
      return requested;
    }
    return variants[0]?.id ?? '';
  }, [searchParams, variants]);

  const activeOption = useMemo(
    () => variants.find((variant) => variant.id === active) ?? variants[0],
    [active, variants],
  );

  const setVariant = useCallback(
    (id: string) => {
      if (!id || id === active) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('variant', id);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [active, pathname, router, searchParams],
  );

  const cycle = useCallback(
    (direction: -1 | 1) => {
      if (variants.length === 0) return;
      const index = variants.findIndex((variant) => variant.id === active);
      const current = index === -1 ? 0 : index;
      const next =
        (current + direction + variants.length) % variants.length;
      setVariant(variants[next].id);
    },
    [active, setVariant, variants],
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        cycle(-1);
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        cycle(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cycle]);

  if (variants.length === 0 || !activeOption) {
    return null;
  }

  return (
    <>
      {children(active)}
      <div
        role="navigation"
        aria-label="Design variants"
        className={cn(
          'bg-background-neutral-inverse/90 text-foreground-neutral-inverse',
          'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1',
          'rounded-2xl border border-white/12 px-1.5 py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.22)]',
          'backdrop-blur-xl',
        )}
      >
        <button
          type="button"
          aria-label="Previous variant"
          onClick={() => cycle(-1)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p
          className="text-body-small-strong min-w-40 px-2 text-center tabular-nums"
          aria-live="polite"
        >
          {activeOption.id}
          <span className="text-white/50"> — </span>
          {activeOption.label}
        </p>
        <button
          type="button"
          aria-label="Next variant"
          onClick={() => cycle(1)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </>
  );
}

export function VariantSwitcher(props: VariantSwitcherProps) {
  return (
    <Suspense fallback={null}>
      <VariantSwitcherInner {...props} />
    </Suspense>
  );
}
