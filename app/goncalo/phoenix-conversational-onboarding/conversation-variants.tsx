'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useMemo } from 'react';
import {
  PhoenixLineText,
  PhoenixTools,
  STACK_WINDOW_MAX_PX,
  stackBlur,
  stackOpacity,
  useStackWindow,
  windowedTurns,
  type ConversationProps,
} from './phoenix-scene';

// Variants:
// A — Color diff. One left-aligned typographic column. Same typeface;
//     speaker is hue only (Phoenix recedes, member is brand blue).
// B — Chip stays. The selected pill is the user turn. Questions stay
//     a left-aligned log; the control becomes the transcript.
// C — Two voices. Same serif for both; Phoenix left, member right.
//     Alignment is the speaker signal — no accent color, no leftover chips.

const LIST_CLASS = 'flex w-full shrink-0 flex-col items-stretch gap-2.5';

function StackFrame({
  isFilled,
  children,
}: {
  isFilled: boolean;
  children: React.ReactNode;
}) {
  return (
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
        {children}
      </div>
      <div
        className={cn(
          'phoenix-stack-blur transition-opacity duration-500',
          isFilled ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  );
}

function phoenixLineClass(
  isCurrent: boolean,
  kind: ConversationProps['turns'][number]['kind'],
) {
  return cn(
    'text-title-large-strong text-left font-serif font-medium tracking-[-0.04em] transition-[color,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    isCurrent
      ? 'text-foreground-neutral-default'
      : kind === 'care'
        ? 'text-foreground-neutral-subtle'
        : 'text-foreground-neutral-faded',
  );
}

function lineMotion(fromEnd: number, role: 'phoenix' | 'member') {
  const blur = stackBlur(fromEnd);
  return {
    opacity: stackOpacity(fromEnd, role),
    filter: blur ? `blur(${blur}px)` : undefined,
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
  onTurnStreamComplete,
}: {
  turn: ConversationProps['turns'][number];
  isCurrent: boolean;
  fromEnd: number;
  onTurnStreamComplete: (turnId: string) => void;
}) {
  return (
    <p className={phoenixLineClass(isCurrent, turn.kind)} style={lineMotion(fromEnd, 'phoenix')}>
      <PhoenixLineText
        text={turn.text}
        kind={turn.kind}
        shouldStream={isCurrent && turn.role === 'phoenix'}
        onStreamComplete={() => onTurnStreamComplete(turn.id)}
      />
    </p>
  );
}

export function VariantA(props: ConversationProps) {
  const { turns, step, onGuideAdvance, onTurnStreamComplete } = props;
  const visibleTurns = useMemo(() => windowedTurns(turns), [turns]);
  const { listRef, isFilled } = useStackWindow(visibleTurns);
  const currentId = visibleTurns.at(-1)?.id;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pt-1"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <StackFrame isFilled={isFilled}>
        <div ref={listRef} className={LIST_CLASS}>
          {visibleTurns.map((turn, index) => {
            const fromEnd = visibleTurns.length - 1 - index;
            const isCurrent = turn.id === currentId;

            if (turn.role === 'member') {
              return (
                <p
                  key={turn.id}
                  className="text-title-large-strong text-foreground-brand-default text-left font-serif font-medium tracking-[-0.04em] transition-[color,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={lineMotion(fromEnd, 'member')}
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

export function VariantB(props: ConversationProps) {
  const { turns, step, onGuideAdvance, onTurnStreamComplete } = props;
  const visibleTurns = useMemo(() => windowedTurns(turns), [turns]);
  const { listRef, isFilled } = useStackWindow(visibleTurns);
  const currentId = visibleTurns.at(-1)?.id;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pt-1"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <StackFrame isFilled={isFilled}>
        <div ref={listRef} className={LIST_CLASS}>
          {visibleTurns.map((turn, index) => {
            const fromEnd = visibleTurns.length - 1 - index;
            const isCurrent = turn.id === currentId;

            if (turn.role === 'member') {
              return (
                <div
                  key={turn.id}
                  className="text-body-large-subtle text-foreground-neutral-strong rounded-full border border-white bg-white/88 px-5 py-3 shadow-[0_10px_40px_rgba(90,80,180,0.14)]"
                  style={lineMotion(fromEnd, 'member')}
                >
                  {turn.text}
                </div>
              );
            }

            return (
              <PhoenixTurn
                key={turn.id}
                turn={turn}
                isCurrent={isCurrent}
                fromEnd={fromEnd}
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

export function VariantC(props: ConversationProps) {
  const { turns, step, onGuideAdvance, onTurnStreamComplete } = props;
  const visibleTurns = useMemo(() => windowedTurns(turns), [turns]);
  const { listRef, isFilled } = useStackWindow(visibleTurns);
  const currentId = visibleTurns.at(-1)?.id;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-5 pt-1"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <StackFrame isFilled={isFilled}>
        <div ref={listRef} className={LIST_CLASS}>
          {visibleTurns.map((turn, index) => {
            const fromEnd = visibleTurns.length - 1 - index;
            const isCurrent = turn.id === currentId;

            if (turn.role === 'member') {
              return (
                <p
                  key={turn.id}
                  className="text-title-large-strong text-foreground-neutral-strong pr-1 text-right font-serif font-medium tracking-[-0.04em] transition-[color,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={lineMotion(fromEnd, 'member')}
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
