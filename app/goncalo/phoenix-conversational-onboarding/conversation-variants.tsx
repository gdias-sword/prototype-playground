'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useMemo, type RefObject } from 'react';
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

const LIST_CLASS = 'flex w-full shrink-0 flex-col items-stretch gap-2.5';
const STACK_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const LINE_TRANSITION = `color ${STACK_COMPACT_MS}ms ${STACK_EASE}, opacity ${STACK_COMPACT_MS}ms ${STACK_EASE}, filter ${STACK_COMPACT_MS}ms ${STACK_EASE}, transform ${STACK_COMPACT_MS}ms ${STACK_EASE}`;

function useConversationStack(props: ConversationProps) {
  const visibleTurns = useMemo(
    () => windowedTurns(props.turns),
    [props.turns],
  );
  const { listRef, frameRef, promptHeight } = useStackWindow(visibleTurns);

  return {
    visibleTurns,
    listRef,
    frameRef,
    promptHeight,
    currentId: visibleTurns.at(-1)?.id,
    isCompact:
      props.toolReady &&
      shouldCompactStack(props.step, props.excludedAreas) &&
      visibleTurns.at(-1)?.role === 'phoenix' &&
      visibleTurns.at(-1)?.kind === 'question',
  };
}

function StackFrame({
  maxHeight,
  frameRef,
  children,
}: {
  maxHeight: number;
  frameRef: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  const frameStyle = {
    maxHeight,
    transition: `max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`,
  };

  return (
    <div
      ref={frameRef}
      className="relative shrink-0 overflow-visible"
      style={{
        ...frameStyle,
        clipPath: 'inset(-8px 0 0)',
      }}
    >
      <div
        className="flex flex-col justify-end overflow-visible"
        style={frameStyle}
      >
        {children}
      </div>
    </div>
  );
}

function phoenixLineClass(
  isCurrent: boolean,
  kind: ConversationProps['turns'][number]['kind'],
) {
  return cn(
    'text-title-large-strong text-left font-serif font-medium tracking-[-0.04em]',
    isCurrent
      ? 'text-foreground-neutral-default'
      : kind === 'care'
        ? 'text-foreground-neutral-subtle'
        : 'text-foreground-neutral-faded',
  );
}

function lineMotion(
  fromEnd: number,
  role: 'phoenix' | 'member',
  isLeavingWindow: boolean,
) {
  const blur = isLeavingWindow ? 2.5 : stackBlur(fromEnd);
  return {
    opacity: isLeavingWindow ? 0 : stackOpacity(fromEnd, role),
    filter: blur ? `blur(${blur}px)` : undefined,
    transition: LINE_TRANSITION,
    animation: 'line-in 1300ms cubic-bezier(0.22, 1, 0.36, 1) backwards' as const,
  };
}

function Tools(props: ConversationProps) {
  return (
    <PhoenixTools
      step={props.step}
      show={props.toolReady}
      excludedAreas={props.excludedAreas}
      onReady={props.onReady}
      onArea={props.onArea}
      onDuration={props.onDuration}
      onIntensity={props.onIntensity}
      onTingling={props.onTingling}
      onMore={props.onMore}
      onDoor={props.onDoor}
    />
  );
}

function PhoenixTurn({
  turn,
  isCurrent,
  fromEnd,
  isLeavingWindow,
  onTurnStreamComplete,
}: {
  turn: ConversationProps['turns'][number];
  isCurrent: boolean;
  fromEnd: number;
  isLeavingWindow: boolean;
  onTurnStreamComplete: (turnId: string) => void;
}) {
  return (
    <p
      className={phoenixLineClass(isCurrent, turn.kind)}
      style={lineMotion(fromEnd, 'phoenix', isLeavingWindow)}
    >
      <PhoenixLineText
        text={turn.text}
        kind={turn.kind}
        shouldStream={isCurrent && turn.role === 'phoenix'}
        onStreamComplete={() => onTurnStreamComplete(turn.id)}
      />
    </p>
  );
}

export function PhoenixCopy(props: ConversationProps) {
  const { step, onGuideAdvance, onTurnStreamComplete } = props;
  const {
    visibleTurns,
    listRef,
    frameRef,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  const maxHeight =
    isCompact && promptHeight > 0 ? promptHeight : STACK_WINDOW_MAX_PX;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pt-1"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <StackFrame maxHeight={maxHeight} frameRef={frameRef}>
        <div ref={listRef} className={LIST_CLASS}>
          {visibleTurns.map((turn, index) => {
            const fromEnd = visibleTurns.length - 1 - index;
            const isCurrent = turn.id === currentId;
            const isLeavingWindow = isCompact && !isCurrent;

            if (turn.role === 'member') {
              return (
                <p
                  key={turn.id}
                  className="text-title-large-strong text-foreground-brand-default pr-1 text-right font-serif font-medium tracking-[-0.04em]"
                  style={lineMotion(fromEnd, 'member', isLeavingWindow)}
                >
                  {turn.text}
                </p>
              );
            }

            return (
              <PhoenixTurn
                key={turn.id}
                turn={turn}
                isCurrent={isCurrent}
                fromEnd={fromEnd}
                isLeavingWindow={isLeavingWindow}
                onTurnStreamComplete={onTurnStreamComplete}
              />
            );
          })}
        </div>
      </StackFrame>
      <Tools {...props} />
    </div>
  );
}
