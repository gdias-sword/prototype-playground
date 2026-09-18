'use client';

import { cn } from '@/design/utils';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  PhoenixLineText,
  PhoenixTools,
  STACK_COMPACT_MS,
  STACK_WINDOW_MAX_PX,
  shouldCompactStack,
  stackBlur,
  stackOpacity,
  useStackWindow,
  windowedTurns,
  type ConversationProps,
} from './phoenix-scene';
import { lerp } from './recall';
import type { StackTurn } from './script';

export const LIST_CLASS = 'flex w-full shrink-0 flex-col items-stretch gap-2.5';
export const STACK_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const LINE_TRANSITION = `color ${STACK_COMPACT_MS}ms ${STACK_EASE}, opacity ${STACK_COMPACT_MS}ms ${STACK_EASE}, filter ${STACK_COMPACT_MS}ms ${STACK_EASE}, transform ${STACK_COMPACT_MS}ms ${STACK_EASE}`;
export const MEMBER_LINE_CLASS =
  'pr-1 text-right font-sans text-[26px] leading-8 font-medium';

export function useShellHeight() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [shellHeight, setShellHeight] = useState(0);

  useLayoutEffect(() => {
    const node = shellRef.current;
    if (!node) return;

    function measure() {
      const next = node!.clientHeight;
      setShellHeight((current) => (current === next ? current : next));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { shellRef, shellHeight };
}

export function useConversationStack(
  props: ConversationProps,
  showFullHistory = false,
) {
  const windowed = useMemo(() => windowedTurns(props.turns), [props.turns]);
  const visibleTurns = showFullHistory ? props.turns : windowed;
  const { listRef, frameRef, isFilled, promptHeight } =
    useStackWindow(visibleTurns);

  return {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId: props.turns.at(-1)?.id,
    isCompact:
      !showFullHistory &&
      props.toolReady &&
      shouldCompactStack(props.step, props.excludedAreas) &&
      windowed.at(-1)?.role === 'phoenix' &&
      windowed.at(-1)?.kind === 'question',
  };
}

export function StackFrame({
  maxHeight,
  transition,
  frameRef,
  scrollRef,
  fadeTop,
  scrollable,
  snapScroll,
  answerSnap,
  onScroll,
  children,
}: {
  maxHeight: number;
  transition: string;
  frameRef: RefObject<HTMLDivElement | null>;
  scrollRef?: RefObject<HTMLDivElement | null>;
  fadeTop?: boolean;
  scrollable?: boolean;
  snapScroll?: boolean;
  answerSnap?: boolean;
  onScroll?: () => void;
  children: ReactNode;
}) {
  const frameStyle = { maxHeight, transition };
  const isSnapScroll = Boolean(snapScroll);

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative shrink-0 overflow-visible',
        fadeTop && 'phoenix-stack-window',
      )}
      style={{ ...frameStyle, clipPath: 'inset(-8px 0 0)' }}
    >
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          'flex flex-col',
          snapScroll
            ? 'phoenix-stack-snap-scroller overflow-y-auto'
            : scrollable
              ? 'phoenix-recall-scroller overflow-y-auto'
              : 'justify-end overflow-visible',
          answerSnap && 'phoenix-answer-history-scroller',
        )}
        style={
          isSnapScroll
            ? { ...frameStyle, height: maxHeight, minHeight: 0 }
            : frameStyle
        }
      >
        {children}
      </div>
    </div>
  );
}

export function phoenixLineClass(isCurrent: boolean, kind: StackTurn['kind']) {
  return cn(
    'text-start font-sans text-title-large-subtle',
    isCurrent
      ? 'text-foreground-neutral-default'
      : kind === 'care'
        ? 'text-foreground-neutral-default'
        : 'text-foreground-neutral-default/20',
  );
}

export function lineMotion({
  fromEnd,
  role,
  hidden,
  expansion = 0,
  animate = true,
  minOpacity = 0,
}: {
  fromEnd: number;
  role: 'phoenix' | 'member';
  hidden?: boolean;
  expansion?: number;
  animate?: boolean;
  minOpacity?: number;
}): CSSProperties {
  const blur = hidden ? 2.5 : lerp(stackBlur(fromEnd), 0, expansion);
  return {
    opacity: hidden
      ? 0
      : Math.max(lerp(stackOpacity(fromEnd, role), 1, expansion), minOpacity),
    filter: blur ? `blur(${blur}px)` : undefined,
    transition: LINE_TRANSITION,
    animation: animate
      ? 'line-in 1300ms cubic-bezier(0.22, 1, 0.36, 1) backwards'
      : undefined,
  };
}

export function Tools(props: ConversationProps) {
  return (
    <PhoenixTools
      step={props.step}
      show={props.toolReady}
      excludedAreas={props.excludedAreas}
      selectedAnswer={props.selectedAnswer}
      selectedRegions={props.selectedRegions}
      selectedImpacts={props.selectedImpacts}
      area={props.area}
      onReady={props.onReady}
      onArea={props.onArea}
      onRegions={props.onRegions}
      onDuration={props.onDuration}
      onIntensity={props.onIntensity}
      onTingling={props.onTingling}
      onImpact={props.onImpact}
      onMore={props.onMore}
      onActivity={props.onActivity}
      onCallYes={props.onCallYes}
      onCallNo={props.onCallNo}
      onRemindYes={props.onRemindYes}
      onRemindNo={props.onRemindNo}
    />
  );
}

export function PhoenixTurn({
  turn,
  isCurrent,
  style,
  uniformColor,
  hasStreamedTurn,
  instantStream,
  onTurnStreamComplete,
}: {
  turn: StackTurn;
  isCurrent: boolean;
  style?: CSSProperties;
  /** Stack snap: full neutral tone; focus is shown via parent opacity only. */
  uniformColor?: boolean;
  hasStreamedTurn?: (turnId: string) => boolean;
  instantStream?: boolean;
  onTurnStreamComplete: (turnId: string) => void;
}) {
  return (
    <p
      className={
        uniformColor
          ? phoenixLineClass(true, turn.kind)
          : phoenixLineClass(isCurrent, turn.kind)
      }
      style={style}
    >
      <PhoenixLineText
        text={turn.text}
        kind={turn.kind}
        shouldStream={
          isCurrent && turn.role === 'phoenix' && !hasStreamedTurn?.(turn.id)
        }
        instantStream={instantStream}
        onStreamComplete={() => onTurnStreamComplete(turn.id)}
      />
    </p>
  );
}

export function MemberTurn({
  text,
  style,
  className,
  onRewind,
}: {
  text: string;
  style?: CSSProperties;
  className?: string;
  onRewind?: () => void;
}) {
  const lineClass = cn(
    className ?? 'text-foreground-brand-default',
    MEMBER_LINE_CLASS,
  );

  if (!onRewind) {
    return (
      <p className={lineClass} style={style}>
        {text}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onRewind();
      }}
      className={cn(
        lineClass,
        'w-full cursor-pointer appearance-none border-0 bg-transparent p-0 transition-opacity duration-200 hover:opacity-80',
        !className && 'hover:text-foreground-brand-default',
      )}
      style={style}
    >
      {text}
    </button>
  );
}

export function advanceHandler(props: ConversationProps) {
  if (props.step.kind === 'guide') return props.onGuideAdvance;
  if (props.step.kind === 'session' || props.step.kind === 'placement-intro') {
    return props.onSessionAdvance;
  }
  return undefined;
}

export function restStackHeight(isCompact: boolean, promptHeight: number) {
  return isCompact && promptHeight > 0 ? promptHeight : STACK_WINDOW_MAX_PX;
}

/** Ordered oldest-first list of the member answers that can be returned to. */
export function rewindableAnswers(props: ConversationProps) {
  const targets = props.rewindTargets;
  if (!targets || targets.size === 0) return [];

  return props.turns
    .filter((turn) => turn.role === 'member' && targets.has(turn.id))
    .map((turn) => ({
      turnId: turn.id,
      text: turn.text,
      checkpointIndex: targets.get(turn.id)!,
    }))
    .sort((a, b) => a.checkpointIndex - b.checkpointIndex);
}

/** The Phoenix question that a given member answer was replying to. */
export function questionForAnswer(turns: StackTurn[], answerTurnId: string) {
  const index = turns.findIndex((turn) => turn.id === answerTurnId);
  if (index < 0) return null;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (turns[cursor].role === 'phoenix' && turns[cursor].kind !== 'care') {
      return turns[cursor];
    }
  }
  return null;
}
