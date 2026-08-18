'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import securityIcon from './assets/ic-security.svg';
import intensityKnob from './assets/intensity-knob.svg';
import { GlassChip } from './glass';
import {
  BODY_AREAS,
  DISCLAIMER,
  DOORS,
  DURATIONS,
  READY_LABEL,
  THERAPIST_PHRASE,
  type DoorId,
  type StackTurn,
} from './script';

export type PhoenixStep =
  | { kind: 'guide'; index: 0 | 1 | 2 }
  | { kind: 'ready' }
  | { kind: 'know'; index: 0 | 1 | 2 | 3 }
  | { kind: 'doors' };

export function TherapistGuideLine({ line }: { line: string }) {
  const [lead, trail] = line.split(THERAPIST_PHRASE);
  const [isShimmering, setIsShimmering] = useState(true);

  return (
    <>
      {lead}
      <span
        className={isShimmering ? 'phoenix-shimmer' : undefined}
        onAnimationEnd={() => setIsShimmering(false)}
      >
        {THERAPIST_PHRASE}
      </span>
      {trail}
    </>
  );
}

function ToolShell({
  children,
  show,
  fill,
}: {
  children: ReactNode;
  show: boolean;
  fill?: boolean;
}) {
  if (!show) return <div className="h-0" />;

  return (
    <div
      className={
        fill
          ? '-mx-4 mt-6 flex min-h-0 flex-1 flex-col px-4'
          : '-mx-4 mt-6 flex shrink-0 flex-col px-4'
      }
      style={{ animation: 'rise-in 800ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
    >
      {children}
    </div>
  );
}

function AreaTool({ onCommit }: { onCommit: (area: string) => void }) {
  return (
    <div className="phoenix-chip-scroller -mx-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-5">
      {BODY_AREAS.map((area) => (
        <GlassChip key={area} onClick={() => onCommit(area)}>
          {area}
        </GlassChip>
      ))}
    </div>
  );
}

function DurationTool({ onCommit }: { onCommit: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {DURATIONS.map((item) => (
        <GlassChip key={item} onClick={() => onCommit(item)}>
          {item}
        </GlassChip>
      ))}
    </div>
  );
}

const INTENSITY_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function IntensityTool({ onCommit }: { onCommit: (value: number) => void }) {
  const [value, setValue] = useState(5);
  const scaleRef = useRef<HTMLDivElement>(null);
  const knobOffset = `calc(12px + (100% - 24px) * ${(value - 0.5) / 10})`;
  const knobSrc =
    typeof intensityKnob === 'string' ? intensityKnob : intensityKnob.src;

  function intensityAt(clientX: number) {
    const scale = scaleRef.current;
    if (!scale) return value;
    const { left, width } = scale.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    return Math.min(10, Math.max(1, Math.floor(ratio * 10) + 1));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setValue(intensityAt(event.clientX));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setValue(intensityAt(event.clientX));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setValue((current) => Math.max(1, current - 1));
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setValue((current) => Math.min(10, current + 1));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div
          role="slider"
          aria-label="Pain intensity"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
          tabIndex={0}
          className="relative h-16 cursor-pointer touch-none select-none outline-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onKeyDown={handleKeyDown}
        >
          <div className="border-border-neutral-faded bg-background-neutral-default absolute inset-0 overflow-hidden rounded-full border">
            <div
              className="from-background-neutral-default to-background-brand-faded pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r transition-[width] duration-150"
              style={{ width: knobOffset }}
            />
            <div className="absolute inset-y-0 inset-x-3">
              <div
                ref={scaleRef}
                className="relative z-10 grid h-full grid-cols-10"
              >
                {INTENSITY_SCALE.map((n) => (
                  <span
                    key={n}
                    className={cn(
                      'text-body-large-strong flex items-center justify-center',
                      n <= value
                        ? 'text-foreground-brand-default'
                        : 'text-foreground-neutral-faded',
                    )}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute top-1/2 z-20 size-12 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-150"
            style={{ left: knobOffset }}
          >
            <img
              alt=""
              aria-hidden
              src={knobSrc}
              className="absolute inset-0 size-full"
            />
            <span className="text-body-large-strong text-foreground-brand-default absolute inset-0 flex items-center justify-center">
              {value}
            </span>
          </div>
        </div>
        <div className="text-body-medium-subtle text-foreground-neutral-faded flex justify-between px-2">
          <span>No pain</span>
          <span>Worst pain</span>
        </div>
      </div>
      <GlassChip className="text-center" onClick={() => onCommit(value)}>
        Continue
      </GlassChip>
    </div>
  );
}

function YesNoTool({ onCommit }: { onCommit: (value: boolean) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <GlassChip onClick={() => onCommit(true)}>Yes</GlassChip>
      <GlassChip onClick={() => onCommit(false)}>No</GlassChip>
    </div>
  );
}

function DoorsTool({ onCommit }: { onCommit: (id: DoorId) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {DOORS.map((door) => (
        <GlassChip key={door.id} onClick={() => onCommit(door.id)}>
          {door.label}
        </GlassChip>
      ))}
    </div>
  );
}

function ReadyTool({ onCommit }: { onCommit: () => void }) {
  const iconSrc =
    typeof securityIcon === 'string' ? securityIcon : securityIcon.src;

  return (
    <div className="mt-auto flex w-full flex-col items-center gap-4 pb-5">
      <div className="flex items-center justify-center gap-1.5">
        <span className="relative size-4 shrink-0 overflow-clip">
          <img
            alt=""
            aria-hidden
            src={iconSrc}
            className="absolute inset-0 size-full"
          />
        </span>
        <p className="text-body-small-default text-foreground-neutral-default text-center">
          {DISCLAIMER}
        </p>
      </div>
      <GlassChip className="text-center" onClick={onCommit}>
        {READY_LABEL}
      </GlassChip>
    </div>
  );
}

export function PhoenixTools({
  step,
  show,
  onReady,
  onArea,
  onDuration,
  onIntensity,
  onTingling,
  onDoor,
}: {
  step: PhoenixStep;
  show: boolean;
  onReady: () => void;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onDoor: (id: DoorId) => void;
}) {
  return (
    <ToolShell
      show={show}
      fill={step.kind === 'ready' || (step.kind === 'know' && step.index === 0)}
    >
      {step.kind === 'ready' ? <ReadyTool onCommit={onReady} /> : null}
      {step.kind === 'know' && step.index === 0 ? (
        <AreaTool onCommit={onArea} />
      ) : null}
      {step.kind === 'know' && step.index === 1 ? (
        <DurationTool onCommit={onDuration} />
      ) : null}
      {step.kind === 'know' && step.index === 2 ? (
        <IntensityTool onCommit={onIntensity} />
      ) : null}
      {step.kind === 'know' && step.index === 3 ? (
        <YesNoTool onCommit={onTingling} />
      ) : null}
      {step.kind === 'doors' ? <DoorsTool onCommit={onDoor} /> : null}
    </ToolShell>
  );
}

export function useDelayedTool(readyWhen: boolean, delay = 700) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!readyWhen) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(id);
  }, [readyWhen, delay]);

  return show;
}

const STACK_WINDOW_QUESTIONS = 4;
const STACK_WINDOW_MAX_PX = 200;

function windowedTurns(turns: StackTurn[]) {
  let beats = 0;
  const kept: StackTurn[] = [];

  for (let index = turns.length - 1; index >= 0; index -= 1) {
    kept.unshift(turns[index]);
    if (turns[index].role === 'phoenix' && turns[index].kind !== 'care') {
      beats += 1;
      if (beats >= STACK_WINDOW_QUESTIONS) break;
    }
  }

  return kept;
}

function stackOpacity(fromEnd: number, role: 'phoenix' | 'member') {
  const base =
    fromEnd === 0
      ? 1
      : fromEnd === 1
        ? 0.72
        : fromEnd === 2
          ? 0.48
          : fromEnd === 3
            ? 0.28
            : 0.12;
  if (role === 'member') return Math.min(1, base + 0.18);
  return base;
}

function stackBlur(fromEnd: number) {
  if (fromEnd <= 1) return 0;
  if (fromEnd === 2) return 1.25;
  return 2.5;
}

function PhoenixLineText({
  text,
  kind,
  shouldStream,
  onStreamComplete,
}: {
  text: string;
  kind: 'guide' | 'question' | 'care' | 'answer';
  shouldStream: boolean;
  onStreamComplete: () => void;
}) {
  const [isComplete, setIsComplete] = useState(!shouldStream);
  const hasCompletedRef = useRef(!shouldStream);
  const characters = useMemo(() => Array.from(text), [text]);

  function handleStreamEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.currentTarget !== event.target || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsComplete(true);
    onStreamComplete();
  }

  if (isComplete || !shouldStream) {
    if (kind === 'guide' && text.includes(THERAPIST_PHRASE)) {
      return <TherapistGuideLine line={text} />;
    }
    return text;
  }

  return (
    <span aria-label={text} className="whitespace-pre-wrap">
      <span aria-hidden="true">
        {characters.map((character, index) => {
          const delay = index * 40;
          const isLast = index === characters.length - 1;

          return (
            <span
              key={`${character}-${index}`}
              className="phoenix-stream-character"
              style={{ animationDelay: `${delay}ms` }}
              onAnimationEnd={isLast ? handleStreamEnd : undefined}
            >
              {character}
            </span>
          );
        })}
      </span>
    </span>
  );
}

interface PhoenixCopyProps {
  turns: StackTurn[];
  step: PhoenixStep;
  toolReady: boolean;
  onGuideAdvance: () => void;
  onReady: () => void;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onDoor: (id: DoorId) => void;
  onTurnStreamComplete: (turnId: string) => void;
}

export function PhoenixCopy({
  turns,
  step,
  toolReady,
  onGuideAdvance,
  onReady,
  onArea,
  onDuration,
  onIntensity,
  onTingling,
  onDoor,
  onTurnStreamComplete,
}: PhoenixCopyProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isFilled, setIsFilled] = useState(false);
  const visibleTurns = useMemo(() => windowedTurns(turns), [turns]);
  const currentId = visibleTurns.at(-1)?.id;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measuredList = list;

    function measure() {
      const nextIsFilled = measuredList.scrollHeight > STACK_WINDOW_MAX_PX + 2;
      setIsFilled((current) =>
        current === nextIsFilled ? current : nextIsFilled,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measuredList);
    return () => observer.disconnect();
  }, [visibleTurns]);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pt-1"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <div
        className="relative shrink-0"
        style={{ maxHeight: STACK_WINDOW_MAX_PX }}
      >
        <div
          className={cn(
            'flex flex-col justify-end overflow-hidden',
            isFilled && 'phoenix-stack-fade',
          )}
          style={{ maxHeight: STACK_WINDOW_MAX_PX }}
        >
          <div
            ref={listRef}
            className="flex shrink-0 flex-col items-start gap-2.5"
          >
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const opacity = stackOpacity(fromEnd, turn.role);
              const blur = stackBlur(fromEnd);

              return (
                <p
                  key={turn.id}
                  className={cn(
                    'text-title-large-strong font-serif font-medium tracking-[-0.04em] text-left transition-[color,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                    turn.role === 'member'
                      ? 'text-foreground-brand-default'
                      : isCurrent
                        ? 'text-foreground-neutral-default'
                        : turn.kind === 'care'
                          ? 'text-foreground-neutral-subtle'
                          : 'text-foreground-neutral-faded',
                  )}
                  style={{
                    opacity,
                    filter: blur ? `blur(${blur}px)` : undefined,
                    animation:
                      'line-in 1300ms cubic-bezier(0.22, 1, 0.36, 1) backwards',
                  }}
                >
                  <PhoenixLineText
                    text={turn.text}
                    kind={turn.kind}
                    shouldStream={isCurrent && turn.role === 'phoenix'}
                    onStreamComplete={() => onTurnStreamComplete(turn.id)}
                  />
                </p>
              );
            })}
          </div>
        </div>
        <div
          className={cn(
            'phoenix-stack-blur transition-opacity duration-500',
            isFilled ? 'opacity-100' : 'opacity-0',
          )}
        />
      </div>
      <PhoenixTools
        step={step}
        show={toolReady}
        onReady={onReady}
        onArea={onArea}
        onDuration={onDuration}
        onIntensity={onIntensity}
        onTingling={onTingling}
        onDoor={onDoor}
      />
    </div>
  );
}
