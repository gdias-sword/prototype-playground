'use client';

// Variants:
// A — illustrated five-region cards, then specific multi-select
// B — 3D skeleton body canvas
// C — slot-first composer: empty pills before typing
// E — wrap-after composer: words become pills as you type

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import armsImage from './assets/arms.webp';
import backTorsoImage from './assets/back-torso.webp';
import headNeckImage from './assets/head-neck.webp';
import hipsImage from './assets/hips-and-pelvis.webp';
import legsImage from './assets/legs.webp';
import { GlassChip } from './glass';
import { clampAreas, toggleArea } from './body-map';

export type BodyAreaVariantKey = 'A' | 'B' | 'C' | 'E';

export function usesBodyCanvas(variant: BodyAreaVariantKey) {
  return variant === 'B';
}

export function usesIntakeComposer(variant: BodyAreaVariantKey) {
  return variant === 'C' || variant === 'E';
}

export type BodyAreaPickerProps = {
  variant: BodyAreaVariantKey;
  maxAreas: number;
  selectedAreas: string[];
  onCommit: (areas: string[]) => void;
};

type RegionId = 'head_neck' | 'back_torso' | 'arms' | 'hips' | 'legs';

type RegionMedia = string | { src: string };

interface Region {
  id: RegionId;
  label: string;
  areas: string[];
  image: RegionMedia;
  objectPosition: string;
}

const REGIONS: Region[] = [
  {
    id: 'head_neck',
    label: 'Head & neck',
    areas: ['Neck', 'Shoulder'],
    image: headNeckImage,
    objectPosition: '50% 18%',
  },
  {
    id: 'back_torso',
    label: 'Back & torso',
    areas: ['Back'],
    image: backTorsoImage,
    objectPosition: '50% 42%',
  },
  {
    id: 'arms',
    label: 'Arms & hands',
    areas: ['Elbow', 'Wrist'],
    image: armsImage,
    objectPosition: '72% 50%',
  },
  {
    id: 'hips',
    label: 'Hips & pelvis',
    areas: ['Hip'],
    image: hipsImage,
    objectPosition: '42% 55%',
  },
  {
    id: 'legs',
    label: 'Legs & feet',
    areas: ['Knee', 'Ankle / Foot'],
    image: legsImage,
    objectPosition: '50% 42%',
  },
];

function mediaSrc(image: RegionMedia) {
  return typeof image === 'string' ? image : image.src;
}

function ContinueButton({
  enabled,
  label,
  onClick,
}: {
  enabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <GlassChip
      className={cn(
        'text-center',
        enabled ? '' : 'opacity-40 cursor-not-allowed active:scale-100',
      )}
      onClick={() => {
        if (!enabled) return;
        onClick();
      }}
    >
      {label}
    </GlassChip>
  );
}

function RegionCard({
  region,
  isOpen,
  selectedAreas,
  maxAreas,
  onToggle,
  onChange,
}: {
  region: Region;
  isOpen: boolean;
  selectedAreas: string[];
  maxAreas: number;
  onToggle: () => void;
  onChange: (next: string[]) => void;
}) {
  const picked = region.areas.filter((area) => selectedAreas.includes(area));
  const isAtMax = selectedAreas.length >= maxAreas;
  const cardRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(isOpen);
  const panelId = `${region.id}-areas`;

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;
    cardRef.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [isOpen]);

  return (
    <article
      ref={cardRef}
      className={cn(
        'relative flex gap-3 overflow-hidden rounded-3xl border p-1.5',
        'border-white/70 bg-white/55 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl',
        'transition-[background-color,border-color,box-shadow] duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        isOpen && 'border-white bg-white/72 shadow-[0_8px_28px_rgba(90,80,180,0.08)]',
      )}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={region.label}
        onClick={onToggle}
        className="absolute inset-0 z-0 cursor-pointer rounded-3xl"
      />

      <div className="pointer-events-none relative min-h-18 w-18 shrink-0 self-stretch overflow-hidden rounded-2xl bg-white/40">
        <img
          alt=""
          aria-hidden
          src={mediaSrc(region.image)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            objectPosition: region.objectPosition,
            transform: isOpen ? 'scale(1.03)' : 'scale(1)',
          }}
        />
        {picked.length > 0 ? (
          <span className="text-body-small-subtle text-foreground-neutral-default absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-white/90 font-semibold">
            {picked.length}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none relative flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
        <p className="text-body-medium-strong text-foreground-neutral-default">
          {region.label}
        </p>

        <div
          id={panelId}
          className="phoenix-region-panel"
          data-open={isOpen || undefined}
        >
          <div className="phoenix-region-panel-inner">
            <div className="flex flex-wrap gap-1.5 pt-2">
              {region.areas.map((area, index) => {
                const selected = selectedAreas.includes(area);
                const blocked = !selected && isAtMax;

                return (
                  <button
                    key={area}
                    type="button"
                    disabled={blocked}
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange(toggleArea(selectedAreas, area, maxAreas));
                    }}
                    className={cn(
                      'phoenix-subarea-in pointer-events-auto text-body-small-subtle rounded-full border px-3.5 py-2',
                      'border-white/80 bg-white/70 backdrop-blur-xl',
                      'transition-[background-color,box-shadow,opacity] duration-[160ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                      'hover:bg-white active:scale-[0.98]',
                      selected &&
                        'border-white bg-white/90 shadow-[0_8px_24px_rgba(90,80,180,0.1)]',
                      blocked && 'cursor-not-allowed opacity-40 hover:bg-white/70',
                    )}
                    style={{ animationDelay: `${80 + index * 16}ms` }}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function RegionPicker({
  selectedAreas,
  maxAreas,
  onChange,
  onCommit,
}: {
  selectedAreas: string[];
  maxAreas: number;
  onChange: (next: string[]) => void;
  onCommit: () => void;
}) {
  const [activeRegionId, setActiveRegionId] = useState<RegionId | null>(
    'head_neck',
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    function updateFades() {
      const node = scrollerRef.current;
      if (!node) return;

      const { scrollTop, scrollHeight, clientHeight } = node;
      const overflow = scrollHeight - clientHeight > 4;

      setFadeTop(overflow && scrollTop > 4);
      setFadeBottom(
        overflow && scrollTop + clientHeight < scrollHeight - 4,
      );
    }

    updateFades();
    scroller.addEventListener('scroll', updateFades, { passive: true });
    const observer = new ResizeObserver(updateFades);
    observer.observe(scroller);
    return () => {
      scroller.removeEventListener('scroll', updateFades);
      observer.disconnect();
    };
  }, [activeRegionId, selectedAreas]);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div
        ref={scrollerRef}
        className="phoenix-chip-scroller -mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1"
        data-fade-top={fadeTop || undefined}
        data-fade-bottom={fadeBottom || undefined}
      >
        {REGIONS.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            isOpen={region.id === activeRegionId}
            selectedAreas={selectedAreas}
            maxAreas={maxAreas}
            onToggle={() =>
              setActiveRegionId((current) =>
                current === region.id ? null : region.id,
              )
            }
            onChange={onChange}
          />
        ))}
      </div>

      <div className="shrink-0">
        <ContinueButton
          enabled={selectedAreas.length > 0}
          label="Continue"
          onClick={onCommit}
        />
      </div>
    </div>
  );
}

export function BodyAreaPickerVariant({
  variant,
  maxAreas,
  selectedAreas,
  onCommit,
}: BodyAreaPickerProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedAreas);

  useEffect(() => {
    setLocalSelected(selectedAreas);
  }, [selectedAreas]);

  const onChange = (next: string[]) => {
    setLocalSelected(next);
  };

  function commit() {
    onCommit(clampAreas(localSelected, maxAreas));
  }

  if (usesBodyCanvas(variant) || usesIntakeComposer(variant)) return null;

  return (
    <RegionPicker
      selectedAreas={localSelected}
      maxAreas={maxAreas}
      onChange={onChange}
      onCommit={commit}
    />
  );
}

