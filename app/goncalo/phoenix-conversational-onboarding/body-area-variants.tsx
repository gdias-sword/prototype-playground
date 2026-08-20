'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import armsImage from './assets/arms.webp';
import backTorsoImage from './assets/back-torso.webp';
import headNeckImage from './assets/head-neck.webp';
import hipsImage from './assets/hips-and-pelvis.webp';
import legsImage from './assets/legs.webp';
import { GlassChip, GlassField } from './glass';
import { BODY_AREAS } from './script';

export type BodyAreaVariantKey = 'A' | 'B' | 'C';

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
    areas: ['Head', 'Neck', 'Shoulder'],
    image: headNeckImage,
    objectPosition: '50% 18%',
  },
  {
    id: 'back_torso',
    label: 'Back & torso',
    areas: ['Upper back', 'Lower back'],
    image: backTorsoImage,
    objectPosition: '50% 42%',
  },
  {
    id: 'arms',
    label: 'Arms & hands',
    areas: ['Wrist', 'Elbow'],
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
    areas: ['Knee', 'Ankle'],
    image: legsImage,
    objectPosition: '50% 42%',
  },
];

function mediaSrc(image: RegionMedia) {
  return typeof image === 'string' ? image : image.src;
}

function clampAreas(selected: string[], maxAreas: number) {
  const uniq: string[] = [];
  for (const a of selected) {
    if (!uniq.includes(a)) uniq.push(a);
    if (uniq.length >= maxAreas) break;
  }
  return uniq;
}

function toggleArea(selected: string[], area: string, maxAreas: number) {
  if (selected.includes(area)) return selected.filter((a) => a !== area);
  return clampAreas([...selected, area], maxAreas);
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

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isOpen]);

  return (
    <article
      ref={cardRef}
      className={cn(
        'flex gap-3 overflow-hidden rounded-3xl border p-1.5',
        'border-white/70 bg-white/55 shadow-[0_8px_32px_rgba(80,70,140,0.08)] backdrop-blur-xl',
        'transition-[background-color,border-color,box-shadow] duration-200',
        isOpen &&
          'border-white bg-white/75 shadow-[0_10px_40px_rgba(90,80,180,0.12)]',
      )}
    >
      <button
        type="button"
        aria-label={region.label}
        onClick={onToggle}
        className="relative min-h-18 w-18 shrink-0 cursor-pointer self-stretch overflow-hidden rounded-2xl bg-white/40"
      >
        <img
          alt=""
          aria-hidden
          src={mediaSrc(region.image)}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isOpen && 'scale-[1.06]',
          )}
          style={{ objectPosition: region.objectPosition }}
        />
        {picked.length > 0 ? (
          <span className="text-body-small-subtle text-foreground-neutral-default absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-white/90 font-semibold">
            {picked.length}
          </span>
        ) : null}
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-1 pr-1">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={onToggle}
          className="text-body-medium-strong text-foreground-neutral-default cursor-pointer text-left"
        >
          {region.label}
        </button>

        {isOpen ? (
          <div className="flex flex-wrap gap-1.5">
            {region.areas.map((area, index) => {
              const selected = selectedAreas.includes(area);
              const blocked = !selected && isAtMax;

              return (
                <button
                  key={area}
                  type="button"
                  disabled={blocked}
                  onClick={() =>
                    onChange(toggleArea(selectedAreas, area, maxAreas))
                  }
                  className={cn(
                    'phoenix-subarea-in text-body-small-subtle rounded-full border px-3.5 py-2 transition-[transform,background-color,box-shadow,opacity] duration-200',
                    'border-white/80 bg-white/70 backdrop-blur-xl',
                    'hover:bg-white active:scale-[0.98]',
                    selected &&
                      'border-white bg-white/90 shadow-[0_8px_24px_rgba(90,80,180,0.12)]',
                    blocked && 'cursor-not-allowed opacity-40 hover:bg-white/70',
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {area}
                </button>
              );
            })}
          </div>
        ) : null}
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

const HOTSPOT_OFFSETS_FRONT: Record<
  string,
  { x: number; y: number; label: string }
> = {
  Head: { x: 50, y: 10, label: 'Head' },
  Neck: { x: 50, y: 18, label: 'Neck' },
  Shoulder: { x: 50, y: 26, label: 'Shoulder' },
  'Upper back': { x: 50, y: 36, label: 'Upper back' },
  'Lower back': { x: 50, y: 48, label: 'Lower back' },
  Hip: { x: 50, y: 57, label: 'Hip' },
  Elbow: { x: 35, y: 38, label: 'Elbow' },
  Wrist: { x: 25, y: 46, label: 'Wrist' },
  Knee: { x: 50, y: 70, label: 'Knee' },
  Ankle: { x: 50, y: 84, label: 'Ankle' },
};

const HOTSPOT_OFFSETS_BACK: Record<
  string,
  { x: number; y: number; label: string }
> = {
  Head: { x: 50, y: 10, label: 'Head' },
  Neck: { x: 50, y: 18, label: 'Neck' },
  Shoulder: { x: 50, y: 26, label: 'Shoulder' },
  'Upper back': { x: 50, y: 36, label: 'Upper back' },
  'Lower back': { x: 50, y: 48, label: 'Lower back' },
  Hip: { x: 50, y: 57, label: 'Hip' },
  Elbow: { x: 65, y: 38, label: 'Elbow' },
  Wrist: { x: 75, y: 46, label: 'Wrist' },
  Knee: { x: 50, y: 70, label: 'Knee' },
  Ankle: { x: 50, y: 84, label: 'Ankle' },
};

function BodyMapPicker({
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
  const [view, setView] = useState<'front' | 'back'>('front');

  const hotspots = view === 'front' ? HOTSPOT_OFFSETS_FRONT : HOTSPOT_OFFSETS_BACK;

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex flex-wrap gap-2 px-1">
        {selectedAreas.length === 0 ? (
          <p className="text-body-small-subtle text-foreground-neutral-faded">
            Tap on the body to select up to {maxAreas} areas.
          </p>
        ) : (
          selectedAreas.map((area) => (
            <GlassChip
              key={area}
              selected
              className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
              onClick={() => onChange(toggleArea(selectedAreas, area, maxAreas))}
            >
              {area}
            </GlassChip>
          ))
        )}
      </div>

      <div className="flex gap-2 px-1">
        <GlassChip
          selected={view === 'front'}
          className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
          onClick={() => setView('front')}
        >
          Front
        </GlassChip>
        <GlassChip
          selected={view === 'back'}
          className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
          onClick={() => setView('back')}
        >
          Back
        </GlassChip>
      </div>

      <div className="relative mx-1 aspect-square min-h-0">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M48 4 Q50 4 52 4 Q58 8 60 14 Q62 22 55 28 Q50 33 45 28 Q38 22 40 14 Q42 8 48 4 Z"
            fill="rgba(255,255,255,0.55)"
          />
          <path
            d="M40 28 Q50 22 60 28 Q66 35 66 45 Q66 56 59 62 Q50 70 41 62 Q34 56 34 45 Q34 35 40 28 Z"
            fill="rgba(255,255,255,0.55)"
          />
          <path
            d="M34 45 Q18 50 22 63 Q27 79 38 75"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M66 45 Q82 50 78 63 Q73 79 62 75"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M41 62 Q38 70 42 80 Q45 88 50 88 Q55 88 58 80 Q62 70 59 62"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {Object.entries(hotspots).map(([area, pos]) => {
          const selected = selectedAreas.includes(area);
          return (
            <button
              key={area}
              type="button"
              aria-label={area}
              onClick={() => onChange(toggleArea(selectedAreas, area, maxAreas))}
              className={cn(
                'absolute grid place-items-center rounded-full border text-body-small-subtle transition-colors',
                'border-border-neutral-faded bg-white/60',
                selected
                  ? 'border-transparent bg-background-brand-default text-foreground-neutral-inverse'
                  : 'hover:bg-white/80',
              )}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: 24,
                height: 24,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="text-[11px] font-semibold">{pos.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto mx-1">
        <ContinueButton
          enabled={selectedAreas.length > 0}
          label="Continue"
          onClick={onCommit}
        />
      </div>
    </div>
  );
}

function parseAreasFromText(input: string): string[] {
  const text = input.toLowerCase();

  const words = text.replace(/[^a-z0-9\\s-]/g, ' ').split(/\\s+/).filter(Boolean);
  const joined = ` ${words.join(' ')} `;

  const matches: { area: string; order: number }[] = [];
  const add = (area: string) => {
    const existing = matches.find((m) => m.area === area);
    if (!existing) matches.push({ area, order: matches.length });
  };

  if (/(head|skull|temple)/.test(text)) add('Head');
  if (/(neck|cervical)/.test(text)) add('Neck');
  if (/(shoulder|shoulders)/.test(text)) add('Shoulder');
  if (/(upper back|mid back|thoracic|between shoulder blades)/.test(text))
    add('Upper back');
  if (/(lower back|lumbar|small of back)/.test(text)) add('Lower back');
  if (/(hip|pelvis)/.test(text)) add('Hip');
  if (/(knee|knees|patella)/.test(text)) add('Knee');
  if (/(ankle|ankles)/.test(text)) add('Ankle');
  if (/(wrist)/.test(text)) add('Wrist');
  if (/(elbow)/.test(text)) add('Elbow');

  // A few forgiving shorthands
  if (/(hand)/.test(text) || joined.includes(' hand ')) add('Wrist');
  if (/(arm)/.test(text) || joined.includes(' arm ')) add('Elbow');

  return matches.map((m) => m.area);
}

function VoiceTextPicker({
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
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        // ignore
      }
    };
  }, []);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript ?? '';
      setText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function applyParse() {
    const parsed = parseAreasFromText(text);
    if (parsed.length === 0) return;
    onChange(clampAreas(parsed, maxAreas));
  }

  const hasSpeech = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition,
    );
  }, []);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="px-1">
        <p className="text-body-medium-subtle text-foreground-neutral-faded">
          Tell Phoenix where it hurts.
        </p>
      </div>

      <div className="flex flex-col gap-2 px-1">
        <div className="flex gap-2">
          <GlassChip
            className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
            selected={isListening}
            onClick={() => {
              if (!hasSpeech) return;
              if (isListening) return;
              startListening();
            }}
          >
            {hasSpeech ? 'Mic' : 'Mic (unavailable)'}
          </GlassChip>
          <div className="flex-1 min-w-0">
            <GlassField
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. neck and lower back"
            />
          </div>
        </div>

        <GlassChip
          className="w-full text-center"
          onClick={applyParse}
        >
          Add from speech/text
        </GlassChip>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {selectedAreas.length === 0 ? (
          <p className="text-body-small-subtle text-foreground-neutral-faded">
            No areas yet. Add from speech, or browse below.
          </p>
        ) : (
          selectedAreas.map((area) => (
            <GlassChip
              key={area}
              selected
              className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
              onClick={() => onChange(toggleArea(selectedAreas, area, maxAreas))}
            >
              {area}
            </GlassChip>
          ))
        )}
      </div>

      {/* Manual browse fallback */}
      <div className="flex min-h-0 flex-col gap-2 px-1">
        <p className="text-body-small-subtle text-foreground-neutral-faded">
          Browse body areas
        </p>
        <div className="flex flex-wrap gap-2">
          {BODY_AREAS.map((area) => (
            <GlassChip
              key={area}
              selected={selectedAreas.includes(area)}
              className="w-auto shrink-0 px-4 py-2 text-body-small-subtle"
              onClick={() =>
                onChange(toggleArea(selectedAreas, area, maxAreas))
              }
            >
              {area}
            </GlassChip>
          ))}
        </div>
      </div>

      <div className="mt-auto mx-1">
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

  if (variant === 'A') {
    return (
      <RegionPicker
        selectedAreas={localSelected}
        maxAreas={maxAreas}
        onChange={onChange}
        onCommit={commit}
      />
    );
  }

  if (variant === 'B') {
    return (
      <BodyMapPicker
        selectedAreas={localSelected}
        maxAreas={maxAreas}
        onChange={onChange}
        onCommit={commit}
      />
    );
  }

  return (
    <VoiceTextPicker
      selectedAreas={localSelected}
      maxAreas={maxAreas}
      onChange={onChange}
      onCommit={commit}
    />
  );
}

