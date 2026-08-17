'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from 'react';
import { GlassChip } from './glass';
import {
  BODY_AREAS,
  DOORS,
  DURATIONS,
  THERAPIST_PHRASE,
  type DoorId,
  type StackTurn,
} from './script';

export type PhoenixStep =
  | { kind: 'guide'; index: 0 | 1 }
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
    <div className="phoenix-chip-scroller -mx-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-5">
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

function IntensityTool({ onCommit }: { onCommit: (value: number) => void }) {
  const [value, setValue] = useState(5);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/45" />
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#c5d0ff,#ffb5a6)]"
            style={{ width: `${(value / 10) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={10}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/80 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_8px_24px_rgba(80,70,140,0.18)]"
          />
        </div>
        <div className="text-body-small-default text-foreground-neutral-faded mt-2 flex justify-between">
          <span>No pain</span>
          <span>Worst pain</span>
        </div>
      </div>
      <GlassChip
        className="text-center"
        onClick={() => onCommit(value)}
      >{`Continue · ${value}`}</GlassChip>
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

export function PhoenixTools({
  step,
  show,
  onArea,
  onDuration,
  onIntensity,
  onTingling,
  onDoor,
}: {
  step: PhoenixStep;
  show: boolean;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onDoor: (id: DoorId) => void;
}) {
  return (
    <ToolShell show={show} fill={step.kind === 'know' && step.index === 0}>
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
                    'text-left font-serif text-[24px] leading-[30px] tracking-[-0.04em] transition-[color,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                    turn.role === 'member'
                      ? 'text-foreground-brand-default font-medium'
                      : isCurrent
                        ? 'text-foreground-neutral-default font-medium'
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
        onArea={onArea}
        onDuration={onDuration}
        onIntensity={onIntensity}
        onTingling={onTingling}
        onDoor={onDoor}
      />
    </div>
  );
}
