'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useCallback,
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
import { BodyAreaPickerVariant, type BodyAreaVariantKey, usesBodyCanvas, usesIntakeComposer } from './body-area-variants';
import { IntakeComposer, type AreaCommitMeta } from './intake-composer';
import {
  BODY_AREAS,
  DISCLAIMER,
  DOORS,
  DURATIONS,
  MAX_BODY_AREAS,
  MORE_HINT,
  MORE_NO_LABEL,
  MORE_YES_LABEL,
  READY_LABEL,
  THERAPIST_PHRASE,
  type DoorId,
  type StackTurn,
} from './script';

export type PhoenixStep =
  | { kind: 'guide'; index: 0 | 1 | 2 }
  | { kind: 'ready' }
  | { kind: 'know'; index: 0 | 1 | 2 | 3 }
  | { kind: 'more' }
  | { kind: 'doors' };

export function TherapistGuideLine({
  line,
  shimmer = true,
}: {
  line: string;
  shimmer?: boolean;
}) {
  const [lead, trail] = line.split(THERAPIST_PHRASE);
  const [isShimmering, setIsShimmering] = useState(shimmer);

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

const TOOL_MOTION_MS = 800;

function ToolShell({
  children,
  show,
  fill,
}: {
  children: ReactNode;
  show: boolean;
  fill?: boolean;
}) {
  const [isPresented, setIsPresented] = useState(show);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsPresented(true);
      setIsLeaving(false);
      return;
    }

    if (!isPresented) return;

    setIsLeaving(true);
    const id = window.setTimeout(() => {
      setIsPresented(false);
      setIsLeaving(false);
    }, TOOL_MOTION_MS);
    return () => window.clearTimeout(id);
  }, [show, isPresented]);

  if (!isPresented) return <div className="h-0" />;

  return (
    <div
      className={cn(
        'phoenix-tool-shell -mx-4 flex flex-col px-4',
        fill && 'mt-6 min-h-0 flex-1',
        !fill && 'mt-6 shrink-0',
      )}
      style={{
        animation: isLeaving
          ? `rise-out ${TOOL_MOTION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`
          : `rise-in ${TOOL_MOTION_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      {children}
    </div>
  );
}

const SCROLL_FADE_THRESHOLD_PX = 4;

function AreaTool({
  exclude,
  onCommit,
}: {
  exclude: string[];
  onCommit: (area: string) => void;
}) {
  const areas = BODY_AREAS.filter((area) => !exclude.includes(area));
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  const updateFades = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const { scrollTop, scrollHeight, clientHeight } = scroller;
    const overflow = scrollHeight - clientHeight > SCROLL_FADE_THRESHOLD_PX;

    setFadeTop(overflow && scrollTop > SCROLL_FADE_THRESHOLD_PX);
    setFadeBottom(
      overflow &&
        scrollTop + clientHeight < scrollHeight - SCROLL_FADE_THRESHOLD_PX,
    );
  }, []);

  useLayoutEffect(() => {
    updateFades();

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new ResizeObserver(updateFades);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [areas, updateFades]);

  return (
    <div
      ref={scrollerRef}
      className="phoenix-chip-scroller -mx-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-5"
      data-fade-top={fadeTop || undefined}
      data-fade-bottom={fadeBottom || undefined}
      onScroll={updateFades}
    >
      {areas.map((area) => (
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
          className="relative h-16 cursor-pointer touch-none outline-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onKeyDown={handleKeyDown}
        >
          <div className="border-border-neutral-faded bg-background-neutral-default absolute inset-0 overflow-hidden rounded-full border">
            <div
              className="from-background-neutral-default to-background-brand-faded pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r transition-[width] duration-150"
              style={{ width: knobOffset }}
            />
            <div className="absolute inset-x-3 inset-y-0">
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

function MoreTool({ onCommit }: { onCommit: (wantsMore: boolean) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <GlassChip onClick={() => onCommit(true)}>{MORE_YES_LABEL}</GlassChip>
      <GlassChip onClick={() => onCommit(false)}>{MORE_NO_LABEL}</GlassChip>
      <p className="text-body-medium-default text-foreground-neutral-faded px-2 pt-1 text-center">
        {MORE_HINT}
      </p>
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
  excludedAreas,
  bodyAreaVariant,
  pickedAreas,
  onReady,
  onAreas,
  onDuration,
  onIntensity,
  onTingling,
  onMore,
  onDoor,
}: {
  step: PhoenixStep;
  show: boolean;
  excludedAreas: string[];
  bodyAreaVariant: BodyAreaVariantKey;
  pickedAreas: string[];
  onReady: () => void;
  onAreas: (areas: string[], meta?: AreaCommitMeta) => void;
  onDuration: (value: string, text?: string) => void;
  onIntensity: (value: number, text?: string) => void;
  onTingling: (value: boolean) => void;
  onMore: (wantsMore: boolean) => void;
  onDoor: (id: DoorId) => void;
}) {
  const composerMode =
    bodyAreaVariant === 'C' ? 'slot' : bodyAreaVariant === 'E' ? 'wrap' : null;
  const composerField =
    step.kind === 'know' && step.index === 0
      ? 'area'
      : step.kind === 'know' && step.index === 1
        ? 'duration'
        : step.kind === 'know' && step.index === 2
          ? 'intensity'
          : null;
  const showComposer = Boolean(composerMode && composerField);

  return (
    <ToolShell
      show={show}
      fill={
        step.kind === 'ready' ||
        (step.kind === 'know' &&
          step.index === 0 &&
          !usesIntakeComposer(bodyAreaVariant))
      }
    >
      {step.kind === 'ready' ? <ReadyTool onCommit={onReady} /> : null}
      {showComposer && composerMode && composerField ? (
        <IntakeComposer
          key={composerField}
          mode={composerMode}
          field={composerField}
          maxAreas={MAX_BODY_AREAS}
          onCommitAreas={onAreas}
          onCommitDuration={onDuration}
          onCommitIntensity={onIntensity}
        />
      ) : null}
      {step.kind === 'know' &&
      step.index === 0 &&
      !usesBodyCanvas(bodyAreaVariant) &&
      !usesIntakeComposer(bodyAreaVariant) ? (
        <BodyAreaPickerVariant
          variant={bodyAreaVariant}
          maxAreas={MAX_BODY_AREAS}
          selectedAreas={pickedAreas}
          onCommit={onAreas}
        />
      ) : null}
      {step.kind === 'know' && step.index === 1 && !showComposer ? (
        <DurationTool onCommit={onDuration} />
      ) : null}
      {step.kind === 'know' && step.index === 2 && !showComposer ? (
        <IntensityTool onCommit={onIntensity} />
      ) : null}
      {step.kind === 'know' && step.index === 3 ? (
        <YesNoTool onCommit={onTingling} />
      ) : null}
      {step.kind === 'more' ? <MoreTool onCommit={onMore} /> : null}
      {step.kind === 'doors' ? <DoorsTool onCommit={onDoor} /> : null}
    </ToolShell>
  );
}

export function useDelayedTool(readyWhen: boolean, delay = 700) {
  const [isDelayedReady, setIsDelayedReady] = useState(false);

  useEffect(() => {
    if (!readyWhen) {
      setIsDelayedReady(false);
      return;
    }
    const id = window.setTimeout(() => setIsDelayedReady(true), delay);
    return () => window.clearTimeout(id);
  }, [readyWhen, delay]);

  return readyWhen && isDelayedReady;
}

export const STACK_WINDOW_MAX_PX = 240;
const STACK_WINDOW_QUESTIONS = 4;
export const STACK_COMPACT_MS = 800;

export function isFormQuestion(step: PhoenixStep) {
  return step.kind === 'know' || step.kind === 'more' || step.kind === 'doors';
}

export function optionCount(step: PhoenixStep, excludedAreas: string[]) {
  if (step.kind === 'know' && step.index === 0) {
    return BODY_AREAS.filter((area) => !excludedAreas.includes(area)).length;
  }
  if (step.kind === 'know' && step.index === 1) return DURATIONS.length;
  if (step.kind === 'know' && step.index === 2) return 0;
  if (step.kind === 'know' && step.index === 3) return 2;
  if (step.kind === 'more') return 2;
  if (step.kind === 'doors') return DOORS.length;
  return 0;
}

export function shouldCompactStack(
  step: PhoenixStep,
  excludedAreas: string[],
  variant?: BodyAreaVariantKey,
) {
  if (
    variant &&
    usesIntakeComposer(variant) &&
    step.kind === 'know' &&
    step.index < 3
  ) {
    return false;
  }
  if (!isFormQuestion(step)) return false;
  return optionCount(step, excludedAreas) >= 5;
}

export function windowedTurns(turns: StackTurn[]) {
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

export function stackOpacity(fromEnd: number, role: 'phoenix' | 'member') {
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

export function stackBlur(fromEnd: number) {
  if (fromEnd <= 1) return 0;
  if (fromEnd === 2) return 1.25;
  return 2.5;
}

export function useStackWindow(visibleTurns: StackTurn[]) {
  const listRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [isFilled, setIsFilled] = useState(false);
  const [promptHeight, setPromptHeight] = useState(0);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measuredList = list;
    const measuredFrame = frameRef.current;

    function measure() {
      const cap =
        measuredFrame && measuredFrame.clientHeight > 0
          ? measuredFrame.clientHeight
          : STACK_WINDOW_MAX_PX;
      const nextIsFilled = measuredList.scrollHeight > cap + 2;
      setIsFilled((current) =>
        current === nextIsFilled ? current : nextIsFilled,
      );
      const prompt = measuredList.lastElementChild as HTMLElement | null;
      if (!prompt) return;
      const nextHeight = prompt.offsetHeight;
      setPromptHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(measuredList);
    if (measuredFrame) observer.observe(measuredFrame);
    const prompt = measuredList.lastElementChild;
    if (prompt) observer.observe(prompt);
    return () => observer.disconnect();
  }, [visibleTurns]);

  return { listRef, frameRef, isFilled, promptHeight };
}

export function PhoenixLineText({
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
      return <TherapistGuideLine line={text} shimmer={shouldStream} />;
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

export interface ConversationProps {
  turns: StackTurn[];
  step: PhoenixStep;
  toolReady: boolean;
  excludedAreas: string[];
  hasStreamedTurn?: (turnId: string) => boolean;
  bodyAreaVariant: BodyAreaVariantKey;
  pickedAreas: string[];
  canvasMode?: boolean;
  onGuideAdvance: () => void;
  onReady: () => void;
  onAreas: (areas: string[], meta?: AreaCommitMeta) => void;
  onDuration: (value: string, text?: string) => void;
  onIntensity: (value: number, text?: string) => void;
  onTingling: (value: boolean) => void;
  onMore: (wantsMore: boolean) => void;
  onDoor: (id: DoorId) => void;
  onTurnStreamComplete: (turnId: string) => void;
}
