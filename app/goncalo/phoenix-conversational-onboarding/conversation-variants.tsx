'use client';

import { cn } from '@/design/utils';
import { useMemo, type RefObject } from 'react';
import {
  PhoenixLineText,
  PhoenixTools,
  STACK_COMPACT_MS,
  STACK_WINDOW_MAX_PX,
  shouldCompactStack,
  toolShellFills,
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
  const { listRef, frameRef, isFilled, promptHeight } =
    useStackWindow(visibleTurns);

  return {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
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
  fadeTop,
  children,
}: {
  maxHeight: number;
  frameRef: RefObject<HTMLDivElement | null>;
  fadeTop?: boolean;
  children: React.ReactNode;
}) {
  const frameStyle = {
    maxHeight,
    transition: `max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`,
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative shrink-0 overflow-visible',
        fadeTop && 'phoenix-stack-window',
      )}
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
    'text-start font-sans text-title-large-subtle',
    isCurrent
      ? 'text-foreground-neutral-default'
      : kind === 'care'
        ? 'text-foreground-neutral-default'
        : 'text-foreground-neutral-default/20',
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
      selectedAnswer={props.selectedAnswer}
      selectedRegions={props.selectedRegions}
      selectedImpacts={props.selectedImpacts}
      area={props.area}
      onReady={props.onReady}
      onArea={props.onArea}
      onRegions={props.onRegions}
      onDuration={props.onDuration}
      onIntensity={props.onIntensity}
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

function PhoenixTurn({
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
      className={phoenixLineClass(isCurrent, turn.kind)}
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

function advanceHandler(props: ConversationProps) {
  if (props.step.kind === 'guide') return props.onGuideAdvance;
  if (props.step.kind === 'session' || props.step.kind === 'placement-intro') {
    return props.onSessionAdvance;
  }
  return undefined;
}

export function ConversationShell(props: ConversationProps) {
  const { step, onTurnStreamComplete } = props;
  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  const maxHeight =
    isCompact && promptHeight > 0 ? promptHeight : STACK_WINDOW_MAX_PX;

  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col px-4',
        // Back control is fixed at top 52px (42px tall). With the status bar
        // in flow, pt-10 + the stack's pt-6 lands the headline at 112px —
        // the same clearance as the enrollment question screen.
        props.canRewind ? 'pt-10' : 'pt-2',
        !toolShellFills(step) && 'pb-24',
      )}
      onClick={advanceHandler(props)}
    >
      <div className="flex min-h-0 flex-1 flex-col pt-6">
        <StackFrame
          maxHeight={maxHeight}
          frameRef={frameRef}
          fadeTop={!isCompact && isFilled}
        >
          <div ref={listRef} className={LIST_CLASS}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const isLeavingWindow = isCompact && !isCurrent;
              if (isLeavingWindow) return null;

              if (turn.role === 'member') {
                return (
                  <p
                    key={turn.id}
                    className="text-foreground-brand-default pr-1 text-right font-sans text-[26px] leading-8 font-medium"
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
        <Tools {...props} />
      </div>
    </div>
  );
}
