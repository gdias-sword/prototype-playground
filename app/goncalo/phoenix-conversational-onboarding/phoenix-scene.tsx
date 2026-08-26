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
import {
  ActivityTool,
  CallActions,
  FooterActions,
  PrimaryAction,
  RemindActions,
} from './extended-scenes';
import { GlassChip } from './glass';
import {
  BODY_AREAS,
  DISCLAIMER,
  DURATIONS,
  MORE_HINT,
  MORE_NO_LABEL,
  MORE_YES_LABEL,
  READY_LABEL,
  THERAPIST_PHRASE,
  type ActivityId,
  type StackTurn,
} from './script';
import { useScrollFade } from './use-scroll-fade';

export type PhoenixStep =
  | { kind: 'guide'; index: 0 | 1 | 2 }
  | { kind: 'ready' }
  | { kind: 'know'; index: 0 | 1 | 2 | 3 }
  | { kind: 'more' }
  | { kind: 'activity' }
  | { kind: 'session' }
  | { kind: 'camera' }
  | { kind: 'offer' }
  | { kind: 'safety' }
  | { kind: 'placement' }
  | { kind: 'exercise' }
  | { kind: 'call' }
  | { kind: 'schedule' }
  | { kind: 'confirm' }
  | { kind: 'remind' };

export function isPanelStep(step: PhoenixStep) {
  return (
    step.kind === 'camera' ||
    step.kind === 'offer' ||
    step.kind === 'safety' ||
    step.kind === 'confirm'
  );
}

export function isImmersiveStep(step: PhoenixStep) {
  return step.kind === 'placement' || step.kind === 'exercise';
}

export function hasConversationTools(step: PhoenixStep) {
  return (
    step.kind === 'ready' ||
    step.kind === 'know' ||
    step.kind === 'more' ||
    step.kind === 'activity' ||
    step.kind === 'call' ||
    step.kind === 'remind'
  );
}

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

function EmphasizedLine({
  text,
  phrase,
  className,
}: {
  text: string;
  phrase: string;
  className: string;
}) {
  const index = text.lastIndexOf(phrase);
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className={className}>{phrase}</span>
      {text.slice(index + phrase.length)}
    </>
  );
}

function phraseStartIndex(characters: string[], phrase: string) {
  const needle = Array.from(phrase);
  if (needle.length === 0) return -1;

  for (let index = characters.length - needle.length; index >= 0; index -= 1) {
    if (
      needle.every(
        (character, offset) => characters[index + offset] === character,
      )
    ) {
      return index;
    }
  }

  return -1;
}

const TOOL_MOTION_MS = 800;

function toolShellFills(step: PhoenixStep) {
  return (
    step.kind === 'ready' ||
    (step.kind === 'know' && (step.index === 0 || step.index === 2)) ||
    step.kind === 'activity' ||
    step.kind === 'call' ||
    step.kind === 'remind'
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

function AreaTool({
  exclude,
  onCommit,
}: {
  exclude: string[];
  onCommit: (area: string) => void;
}) {
  const areas = BODY_AREAS.filter((area) => !exclude.includes(area));
  const { scrollerRef, fadeTop, fadeBottom, onScroll } = useScrollFade([
    areas,
  ]);

  return (
    <div
      ref={scrollerRef}
      className="phoenix-chip-scroller -mx-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-5"
      data-fade-top={fadeTop || undefined}
      data-fade-bottom={fadeBottom || undefined}
      onScroll={onScroll}
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
    <div className="flex min-h-0 flex-1 flex-col">
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
      <FooterActions>
        <PrimaryAction onClick={() => onCommit(value)}>Continue</PrimaryAction>
      </FooterActions>
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
      <PrimaryAction onClick={onCommit}>{READY_LABEL}</PrimaryAction>
    </div>
  );
}

export function PhoenixTools({
  step,
  show,
  excludedAreas,
  onReady,
  onArea,
  onDuration,
  onIntensity,
  onTingling,
  onMore,
  onActivity,
  onCallYes,
  onCallNo,
  onRemindYes,
  onRemindNo,
}: {
  step: PhoenixStep;
  show: boolean;
  excludedAreas: string[];
  onReady: () => void;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onMore: (wantsMore: boolean) => void;
  onActivity: (id: ActivityId) => void;
  onCallYes: () => void;
  onCallNo: () => void;
  onRemindYes: () => void;
  onRemindNo: () => void;
}) {
  return (
    <ToolShell show={show} fill={toolShellFills(step)}>
      {step.kind === 'ready' ? <ReadyTool onCommit={onReady} /> : null}
      {step.kind === 'know' && step.index === 0 ? (
        <AreaTool exclude={excludedAreas} onCommit={onArea} />
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
      {step.kind === 'more' ? <MoreTool onCommit={onMore} /> : null}
      {step.kind === 'activity' ? <ActivityTool onCommit={onActivity} /> : null}
      {step.kind === 'call' ? (
        <CallActions onYes={onCallYes} onNo={onCallNo} />
      ) : null}
      {step.kind === 'remind' ? (
        <RemindActions onYes={onRemindYes} onNo={onRemindNo} />
      ) : null}
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
export const STREAM_CHAR_DELAY_MS = 40;
export const STREAM_CHAR_ANIM_MS = 400;

export function streamDurationMs(text: string) {
  const count = Array.from(text).length;
  if (count === 0) return 0;
  return (count - 1) * STREAM_CHAR_DELAY_MS + STREAM_CHAR_ANIM_MS;
}

export function isFormQuestion(step: PhoenixStep) {
  return (
    step.kind === 'know' ||
    step.kind === 'more' ||
    step.kind === 'activity' ||
    step.kind === 'call' ||
    step.kind === 'remind'
  );
}

export function optionCount(step: PhoenixStep, excludedAreas: string[]) {
  if (step.kind === 'know' && step.index === 0) {
    return BODY_AREAS.filter((area) => !excludedAreas.includes(area)).length;
  }
  if (step.kind === 'know' && step.index === 1) return DURATIONS.length;
  if (step.kind === 'know' && step.index === 2) return 0;
  if (step.kind === 'know' && step.index === 3) return 2;
  if (step.kind === 'more') return 2;
  if (step.kind === 'activity') return 3;
  if (step.kind === 'call' || step.kind === 'remind') return 2;
  return 0;
}

export function shouldCompactStack(step: PhoenixStep, excludedAreas: string[]) {
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
  instantStream = false,
  emphasis,
}: {
  text: string;
  kind: 'guide' | 'question' | 'care' | 'answer';
  shouldStream: boolean;
  onStreamComplete: () => void;
  instantStream?: boolean;
  emphasis?: { phrase: string; className: string };
}) {
  const [isComplete, setIsComplete] = useState(!shouldStream || instantStream);
  const hasCompletedRef = useRef(!shouldStream);
  const hasStartedRef = useRef(shouldStream);
  const characters = useMemo(() => Array.from(text), [text]);
  const emphasisStart = useMemo(
    () => (emphasis ? phraseStartIndex(characters, emphasis.phrase) : -1),
    [characters, emphasis],
  );

  if (shouldStream) {
    hasStartedRef.current = true;
  }

  function completeStream() {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsComplete(true);
    onStreamComplete();
  }

  useEffect(() => {
    if (!shouldStream || !instantStream) return;
    const id = window.setTimeout(() => completeStream(), 0);
    return () => window.clearTimeout(id);
  }, [shouldStream, instantStream]);

  function handleStreamEnd(event: AnimationEvent<HTMLSpanElement>) {
    if (event.currentTarget !== event.target) return;
    completeStream();
  }

  if (isComplete || !hasStartedRef.current) {
    if (emphasis && text.includes(emphasis.phrase)) {
      return (
        <EmphasizedLine
          text={text}
          phrase={emphasis.phrase}
          className={emphasis.className}
        />
      );
    }
    if (kind === 'guide' && text.includes(THERAPIST_PHRASE)) {
      return <TherapistGuideLine line={text} shimmer={false} />;
    }
    return text;
  }

  const emphasisLength = emphasis ? Array.from(emphasis.phrase).length : 0;

  return (
    <span
      aria-label={text.replaceAll('\n', ' ')}
      className="whitespace-pre-wrap"
    >
      <span aria-hidden="true">
        {characters.map((character, index) => {
          const delay = index * STREAM_CHAR_DELAY_MS;
          const isLast = index === characters.length - 1;
          const isEmphasis =
            emphasisStart >= 0 &&
            index >= emphasisStart &&
            index < emphasisStart + emphasisLength;

          return (
            <span
              key={`${character}-${index}`}
              className={cn(
                'phoenix-stream-character',
                isEmphasis && emphasis?.className,
              )}
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
  reserveOrbSlot?: boolean;
  excludedAreas: string[];
  hasStreamedTurn?: (turnId: string) => boolean;
  instantStream?: boolean;
  onGuideAdvance: () => void;
  onSessionAdvance: () => void;
  onReady: () => void;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onMore: (wantsMore: boolean) => void;
  onActivity: (id: ActivityId) => void;
  onCallYes: () => void;
  onCallNo: () => void;
  onRemindYes: () => void;
  onRemindNo: () => void;
  onTurnStreamComplete: (turnId: string) => void;
}
