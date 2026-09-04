'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useMemo, type RefObject } from 'react';
import { PanelHeaderStack } from './panel-header';
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
  const visibleTurns = useMemo(() => windowedTurns(props.turns), [props.turns]);
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
  fromEnd: number,
  kind: ConversationProps['turns'][number]['kind'],
) {
  const isCurrent = fromEnd === 0;

  return cn(
    isCurrent ? 'text-title-large-strong' : 'text-title-medium-strong',
    'text-left font-sans font-medium tracking-[-0.02em]',
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
    animation:
      'line-in 1300ms cubic-bezier(0.22, 1, 0.36, 1) backwards' as const,
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
  fromEnd,
  isLeavingWindow,
  hasStreamedTurn,
  instantStream,
  onTurnStreamComplete,
}: {
  turn: ConversationProps['turns'][number];
  isCurrent: boolean;
  fromEnd: number;
  isLeavingWindow: boolean;
  hasStreamedTurn?: (turnId: string) => boolean;
  instantStream?: boolean;
  onTurnStreamComplete: (turnId: string) => void;
}) {
  return (
    <p
      className={phoenixLineClass(fromEnd, turn.kind)}
      style={lineMotion(fromEnd, 'phoenix', isLeavingWindow)}
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

export function PhoenixCopy(props: ConversationProps) {
  const {
    step,
    reserveOrbSlot,
    onGuideAdvance,
    onSessionAdvance,
    onTurnStreamComplete,
  } = props;
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

  // Panel-header orb alignment matches ContinuityPanel: slot + gap-6 apply only
  // to the current prompt, not the full scrollback (which caused huge gaps).
  const stackTurns = reserveOrbSlot
    ? visibleTurns.filter((turn) => turn.id === currentId)
    : visibleTurns;

  const stack = (
    <StackFrame maxHeight={maxHeight} frameRef={frameRef}>
      <div ref={listRef} className={LIST_CLASS}>
        {stackTurns.map((turn, index) => {
          const fromEnd = stackTurns.length - 1 - index;
          const isCurrent = turn.id === currentId;
          const isLeavingWindow = isCompact && !isCurrent;

          if (isLeavingWindow) return null;

          if (turn.role === 'member') {
            return (
              <p
                key={turn.id}
                className="text-title-medium-strong text-foreground-brand-default pr-1 text-right font-sans font-medium tracking-[-0.02em]"
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
              hasStreamedTurn={props.hasStreamedTurn}
              instantStream={props.instantStream}
              onTurnStreamComplete={onTurnStreamComplete}
            />
          );
        })}
      </div>
    </StackFrame>
  );

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col px-5',
        reserveOrbSlot ? 'pt-4' : 'pt-1',
      )}
      onClick={
        step.kind === 'guide'
          ? onGuideAdvance
          : step.kind === 'session' || step.kind === 'placement-intro'
            ? onSessionAdvance
            : undefined
      }
    >
      {reserveOrbSlot ? <PanelHeaderStack>{stack}</PanelHeaderStack> : stack}
      <Tools {...props} />
    </div>
  );
}
