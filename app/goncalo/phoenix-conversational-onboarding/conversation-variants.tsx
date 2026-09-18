'use client';

// Rewind explorations. Axis: how a member returns to an answer they already gave,
// without reintroducing the wizard chrome (back button + progress rail) we removed.
//
// A — Pull to remember: the stack is a timeline. A vertical pull expands it into a
//     browsable history; tapping an answer jumps there. Review and commit are
//     separate acts, so browsing can never destroy an answer.
// B — Living answers: no gesture, no mode, nothing to discover. Your answers simply
//     stay legible and tappable in the resting stack. Reach is deliberately short —
//     you can amend the recent past, not rewrite the whole intake.
// C — Say so: no navigation at all. Correction is a conversational turn. You tell
//     Phoenix you want to change something and it asks which; the flow moves forward
//     into the correction rather than rewinding backwards through screens.
// D — Swipe back: horizontal edge-swipe steps back exactly one question, like the
//     native iOS back gesture. Discrete and stepwise — no history to browse.
// E — Snap answers: fixed window, no expansion. A vertical snap scroller cycles
//     through past answers; the centered row is the selection. Tap it to rewind.
// F — Snap stack: same unified conversation stack (Phoenix + member + streaming).
//     Fixed window, full history inside it, scroll-snap with focus on the centered
//     turn. New turns stay pinned to the present until you scroll up.
// G — Snap stack flat: same snap mechanics as F, but only the centered line is
//     full opacity / scale; all other lines sit at 20% opacity and 0.92 scale.
// H — Pull snap stack: A's pull-to-expand, then F's snap-stack picker. CSS snap
//     only — no JS gravity settle, so flicks can pass more than one line.

import { cn } from '@/design/utils';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import { GlassChip } from './glass';
import {
  LIST_CLASS,
  MEMBER_LINE_CLASS,
  MemberTurn,
  PhoenixTurn,
  STACK_EASE,
  StackFrame,
  Tools,
  advanceHandler,
  lineMotion,
  phoenixLineClass,
  questionForAnswer,
  restStackHeight,
  rewindableAnswers,
  useConversationStack,
  useShellHeight,
} from './conversation-stack';
import {
  STACK_COMPACT_MS,
  STACK_WINDOW_MAX_PX,
  toolShellFills,
  type ConversationProps,
} from './phoenix-scene';
import { RECALL_EASE, RECALL_MS, lerp } from './recall';
import { DEFAULT_REWIND_VARIANT } from './rewind-variants';
import {
  ANSWER_SNAP_ROW_PX,
  answerSnapPadRows,
  answerSnapWheelHeight,
  useAnswerSnapWheel,
} from './use-answer-snap-wheel';
import {
  snapStackFlatShellStyle,
  snapStackShellStyle,
  useStackSnapFocus,
  type StackSnapFocusOptions,
} from './use-stack-snap-focus';
import { usePullToRecall } from './use-pull-to-recall';
import { useSwipeBack } from './use-swipe-back';

const RECALL_TRANSITION = `opacity ${RECALL_MS}ms ${RECALL_EASE}, transform ${RECALL_MS}ms ${RECALL_EASE}`;

function shellClass(props: ConversationProps, extra?: string) {
  return cn(
    'flex min-h-0 flex-1 flex-col px-4 pt-2',
    !toolShellFills(props.step) && 'pb-24',
    extra,
  );
}

/* ------------------------------------------------------------------ */
/* A — Pull to remember                                                */
/* ------------------------------------------------------------------ */

function PullToRememberShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, rewindTargets, onRewindTo } = props;
  const [isRecalling, setIsRecalling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { shellRef, shellHeight } = useShellHeight();

  const canRecall = (rewindTargets?.size ?? 0) > 0;
  const recalling = isRecalling && canRecall;

  const atBottom = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return true;
    return node.scrollTop >= node.scrollHeight - node.clientHeight - 2;
  }, []);

  const closeRecall = useCallback(() => setIsRecalling(false), []);
  const openRecall = useCallback(() => setIsRecalling(true), []);

  const recall = usePullToRecall({
    enabled: canRecall,
    isOpen: recalling,
    atBottom,
    onOpen: openRecall,
    onClose: closeRecall,
  });

  useEffect(() => {
    if (!canRecall) setIsRecalling(false);
  }, [canRecall]);

  const expansion = recalling ? 1 - recall.dismiss : recall.pull;
  const isRecallActive = expansion > 0;

  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props, isRecallActive);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !recalling) return;
    node.scrollTop = node.scrollHeight;
  }, [recalling]);

  // The stack sits below the shell's top padding, so the expanded frame has to
  // give that back plus room to breathe above the home indicator.
  const restHeight = restStackHeight(isCompact, promptHeight);
  const openHeight = Math.max(restHeight, shellHeight - 64);
  const maxHeight = lerp(restHeight, openHeight, expansion);

  function handleShellClick() {
    if (recall.consumeDragClick()) return;
    if (recalling) {
      closeRecall();
      return;
    }
    advanceHandler(props)?.();
  }

  return (
    <div
      ref={shellRef}
      className={shellClass(props, 'overflow-hidden')}
      onClick={handleShellClick}
    >
      <div
        className="flex min-h-0 flex-1 flex-col pt-6"
        style={{
          touchAction: recalling ? 'pan-y' : canRecall ? 'none' : undefined,
        }}
        {...recall.handlers}
      >
        <StackFrame
          maxHeight={maxHeight}
          transition={
            recall.isDragging
              ? 'none'
              : `max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`
          }
          frameRef={frameRef}
          scrollRef={scrollRef}
          fadeTop={!isCompact && isFilled}
          scrollable={recalling}
        >
          <div ref={listRef} className={cn(LIST_CLASS, recalling && 'mt-auto')}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const hidden = isCompact && !isCurrent;
              if (hidden) return null;

              const style = lineMotion({
                fromEnd,
                role: turn.role,
                expansion,
                animate: !isRecallActive,
              });

              if (turn.role === 'member') {
                const target = rewindTargets?.get(turn.id);
                return (
                  <MemberTurn
                    key={turn.id}
                    text={turn.text}
                    style={style}
                    onRewind={
                      recalling && target !== undefined
                        ? () => {
                            closeRecall();
                            onRewindTo?.(target);
                          }
                        : undefined
                    }
                  />
                );
              }

              return (
                <PhoenixTurn
                  key={turn.id}
                  turn={turn}
                  isCurrent={isCurrent}
                  style={style}
                  hasStreamedTurn={props.hasStreamedTurn}
                  instantStream={props.instantStream}
                  onTurnStreamComplete={onTurnStreamComplete}
                />
              );
            })}
          </div>
        </StackFrame>
        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
          style={{
            opacity: Math.max(0, 1 - expansion * 2.2),
            transform: `translateY(${expansion * 24}px)`,
            transition: recall.isDragging ? 'none' : RECALL_TRANSITION,
            pointerEvents: isRecallActive ? 'none' : undefined,
          }}
          aria-hidden={isRecallActive}
        >
          <Tools {...props} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* B — Living answers                                                  */
/* ------------------------------------------------------------------ */

const LIVING_ANSWER_OPACITY = 0.55;

function LivingAnswersShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, rewindTargets, onRewindTo } = props;
  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  return (
    <div
      className={shellClass(props)}
      onClick={() => advanceHandler(props)?.()}
    >
      <div className="flex min-h-0 flex-1 flex-col pt-6">
        <StackFrame
          maxHeight={restStackHeight(isCompact, promptHeight)}
          transition={`max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`}
          frameRef={frameRef}
          fadeTop={!isCompact && isFilled}
        >
          <div ref={listRef} className={LIST_CLASS}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const hidden = isCompact && !isCurrent;
              if (hidden) return null;

              if (turn.role === 'member') {
                const target = rewindTargets?.get(turn.id);
                return (
                  <MemberTurn
                    key={turn.id}
                    text={turn.text}
                    style={lineMotion({
                      fromEnd,
                      role: 'member',
                      minOpacity:
                        target === undefined ? 0 : LIVING_ANSWER_OPACITY,
                    })}
                    onRewind={
                      target === undefined
                        ? undefined
                        : () => onRewindTo?.(target)
                    }
                  />
                );
              }

              return (
                <PhoenixTurn
                  key={turn.id}
                  turn={turn}
                  isCurrent={isCurrent}
                  style={lineMotion({ fromEnd, role: 'phoenix' })}
                  hasStreamedTurn={props.hasStreamedTurn}
                  instantStream={props.instantStream}
                  onTurnStreamComplete={onTurnStreamComplete}
                />
              );
            })}
          </div>
        </StackFrame>
        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
        >
          <Tools {...props} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* C — Say so                                                          */
/* ------------------------------------------------------------------ */

const CORRECTION_PROMPT = 'Actually, I want to change something';
const CORRECTION_REPLY = 'Of course. Which one should we revisit?';
const CORRECTION_DISMISS = 'Never mind';

function SaySoShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, onRewindTo } = props;
  const [isCorrecting, setIsCorrecting] = useState(false);
  const answers = rewindableAnswers(props);
  const canCorrect = answers.length > 0;

  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  useEffect(() => {
    if (!canCorrect) setIsCorrecting(false);
  }, [canCorrect]);

  const correcting = isCorrecting && canCorrect;

  return (
    <div
      className={shellClass(props)}
      onClick={() => {
        if (correcting) return;
        advanceHandler(props)?.();
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col pt-6">
        <StackFrame
          maxHeight={restStackHeight(isCompact && !correcting, promptHeight)}
          transition={`max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`}
          frameRef={frameRef}
          fadeTop={!isCompact && isFilled}
        >
          <div ref={listRef} className={LIST_CLASS}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const hidden = isCompact && !isCurrent && !correcting;
              if (hidden) return null;

              if (turn.role === 'member') {
                return (
                  <MemberTurn
                    key={turn.id}
                    text={turn.text}
                    style={lineMotion({ fromEnd, role: 'member' })}
                  />
                );
              }

              return (
                <PhoenixTurn
                  key={turn.id}
                  turn={turn}
                  isCurrent={isCurrent}
                  style={lineMotion({ fromEnd, role: 'phoenix' })}
                  hasStreamedTurn={props.hasStreamedTurn}
                  instantStream={props.instantStream}
                  onTurnStreamComplete={onTurnStreamComplete}
                />
              );
            })}

            {correcting ? (
              <p
                className={phoenixLineClass(true, 'question')}
                style={{
                  animation: `line-in 700ms ${RECALL_EASE} backwards`,
                }}
              >
                {CORRECTION_REPLY}
              </p>
            ) : null}
          </div>
        </StackFrame>

        {canCorrect && !correcting ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsCorrecting(true);
            }}
            className={cn(
              MEMBER_LINE_CLASS,
              'text-foreground-brand-default/35 hover:text-foreground-brand-default/70 mt-2.5 shrink-0 cursor-pointer text-[20px] leading-7 transition-colors duration-200',
            )}
          >
            {CORRECTION_PROMPT}
          </button>
        ) : null}

        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
        >
          {correcting ? (
            <div className="mt-6 flex flex-col gap-2">
              {answers.map((answer) => (
                <GlassChip
                  key={answer.turnId}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsCorrecting(false);
                    onRewindTo?.(answer.checkpointIndex);
                  }}
                >
                  {answer.text}
                </GlassChip>
              ))}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsCorrecting(false);
                }}
                className="text-body-large-strong text-foreground-neutral-default h-12 w-full cursor-pointer"
              >
                {CORRECTION_DISMISS}
              </button>
            </div>
          ) : (
            <Tools {...props} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D — Swipe back                                                      */
/* ------------------------------------------------------------------ */

function SwipeBackShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, onRewindTo } = props;
  const answers = rewindableAnswers(props);
  const previous = answers.at(-1) ?? null;
  const previousQuestion = previous
    ? questionForAnswer(props.turns, previous.turnId)
    : null;

  const swipe = useSwipeBack({
    enabled: previous != null,
    onCommit: () => {
      if (previous) onRewindTo?.(previous.checkpointIndex);
    },
  });

  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  const { progress } = swipe;
  const motion = swipe.isDragging
    ? 'none'
    : `opacity ${RECALL_MS}ms ${RECALL_EASE}, transform ${RECALL_MS}ms ${RECALL_EASE}, filter ${RECALL_MS}ms ${RECALL_EASE}`;

  function handleShellClick() {
    if (swipe.consumeDragClick()) return;
    advanceHandler(props)?.();
  }

  return (
    <div
      className={shellClass(props, 'overflow-hidden')}
      onClick={handleShellClick}
    >
      <div
        className="relative flex min-h-0 flex-1 flex-col pt-6"
        style={{ touchAction: previous ? 'pan-y' : undefined }}
        {...swipe.handlers}
      >
        {previousQuestion ? (
          <p
            aria-hidden
            className="text-title-large-subtle text-foreground-neutral-default pointer-events-none absolute inset-x-0 top-6 px-0 text-start font-sans"
            style={{
              opacity: progress * 0.9,
              // Stays inside the shell's horizontal padding so the incoming
              // question never gets clipped mid-word.
              transform: `translateX(${-10 + progress * 10}%)`,
              filter: `blur(${(1 - progress) * 3}px)`,
              transition: motion,
            }}
          >
            {previousQuestion.text}
          </p>
        ) : null}

        <div
          style={{
            opacity: 1 - progress * 0.85,
            transform: `translateX(${progress * 42}%)`,
            filter: progress ? `blur(${progress * 2}px)` : undefined,
            transition: motion,
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <StackFrame
            maxHeight={restStackHeight(isCompact, promptHeight)}
            transition={`max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`}
            frameRef={frameRef}
            fadeTop={!isCompact && isFilled}
          >
            <div ref={listRef} className={LIST_CLASS}>
              {visibleTurns.map((turn, index) => {
                const fromEnd = visibleTurns.length - 1 - index;
                const isCurrent = turn.id === currentId;
                const hidden = isCompact && !isCurrent;
                if (hidden) return null;

                if (turn.role === 'member') {
                  return (
                    <MemberTurn
                      key={turn.id}
                      text={turn.text}
                      style={lineMotion({ fromEnd, role: 'member' })}
                    />
                  );
                }

                return (
                  <PhoenixTurn
                    key={turn.id}
                    turn={turn}
                    isCurrent={isCurrent}
                    style={lineMotion({ fromEnd, role: 'phoenix' })}
                    hasStreamedTurn={props.hasStreamedTurn}
                    instantStream={props.instantStream}
                    onTurnStreamComplete={onTurnStreamComplete}
                  />
                );
              })}
            </div>
          </StackFrame>
          <div
            className={cn(
              'flex flex-col',
              toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
            )}
            style={{ pointerEvents: progress > 0.02 ? 'none' : undefined }}
          >
            <Tools {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* E — Snap answers                                                    */
/* ------------------------------------------------------------------ */

function SnapAnswersShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, onRewindTo } = props;
  const answers = rewindableAnswers(props);
  const wheel = useAnswerSnapWheel(answers.length);
  const padRows = answerSnapPadRows();
  const wheelHeight = answerSnapWheelHeight();

  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props);

  return (
    <div
      className={shellClass(props)}
      onClick={() => advanceHandler(props)?.()}
    >
      <div className="flex min-h-0 flex-1 flex-col pt-6">
        <StackFrame
          maxHeight={restStackHeight(isCompact, promptHeight)}
          transition={`max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`}
          frameRef={frameRef}
          fadeTop={!isCompact && isFilled}
        >
          <div ref={listRef} className={LIST_CLASS}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              if (turn.role === 'member') return null;
              if (!isCurrent) return null;

              return (
                <PhoenixTurn
                  key={turn.id}
                  turn={turn}
                  isCurrent={isCurrent}
                  style={lineMotion({ fromEnd, role: 'phoenix' })}
                  hasStreamedTurn={props.hasStreamedTurn}
                  instantStream={props.instantStream}
                  onTurnStreamComplete={onTurnStreamComplete}
                />
              );
            })}
          </div>
        </StackFrame>

        {answers.length > 0 ? (
          <div
            className="relative mt-5 shrink-0"
            style={{ height: wheelHeight }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              aria-hidden
              className="border-foreground-brand-default/12 bg-foreground-brand-default/[0.06] pointer-events-none absolute inset-x-0 top-1/2 z-10 h-11 -translate-y-1/2 rounded-2xl border"
            />
            <div
              ref={wheel.scrollRef}
              onScroll={wheel.onScroll}
              className="phoenix-answer-snap-wheel h-full snap-y snap-mandatory overflow-y-auto"
            >
              {Array.from({ length: padRows }, (_, index) => (
                <div
                  key={`pad-top-${index}`}
                  aria-hidden
                  className="shrink-0 snap-center snap-always"
                  style={{ height: ANSWER_SNAP_ROW_PX }}
                />
              ))}
              {answers.map((answer, index) => {
                const isActive = index === wheel.activeIndex;
                const distance = Math.abs(index - wheel.activeIndex);
                return (
                  <div
                    key={answer.turnId}
                    className="flex shrink-0 snap-center snap-always items-center justify-end px-1"
                    style={{ height: ANSWER_SNAP_ROW_PX }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          onRewindTo?.(answer.checkpointIndex);
                          return;
                        }
                        wheel.scrollToIndex(index);
                      }}
                      className={cn(
                        MEMBER_LINE_CLASS,
                        'max-w-full truncate text-[22px] leading-7 transition-[color,opacity,transform,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isActive
                          ? 'text-foreground-brand-default scale-100 opacity-100'
                          : 'text-foreground-brand-default/45 scale-[0.94] opacity-80',
                        distance > 1 && 'opacity-50',
                      )}
                      style={{
                        filter: isActive
                          ? undefined
                          : `blur(${Math.min(distance * 0.45, 1.2)}px)`,
                      }}
                    >
                      {answer.text}
                    </button>
                  </div>
                );
              })}
              {Array.from({ length: padRows }, (_, index) => (
                <div
                  key={`pad-bottom-${index}`}
                  aria-hidden
                  className="shrink-0 snap-center snap-always"
                  style={{ height: ANSWER_SNAP_ROW_PX }}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
        >
          <Tools {...props} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* F / G — Snap stack (shared layout)                                  */
/* ------------------------------------------------------------------ */

type SnapStackShellStyle = (input: {
  turnId: string;
  snappedId: string | null;
  index: number;
  snappedIndex: number;
}) => CSSProperties;

function SnapTurnList({
  listRef,
  visibleTurns,
  currentId,
  snap,
  snappedIndex,
  shellStyleForTurn,
  rewindTargets,
  onRewindTo,
  hasStreamedTurn,
  instantStream,
  onTurnStreamComplete,
}: {
  listRef: RefObject<HTMLDivElement | null>;
  visibleTurns: ConversationProps['turns'];
  currentId: string | undefined;
  snap: ReturnType<typeof useStackSnapFocus>;
  snappedIndex: number;
  shellStyleForTurn: SnapStackShellStyle;
  rewindTargets: ConversationProps['rewindTargets'];
  onRewindTo: ConversationProps['onRewindTo'];
  hasStreamedTurn: ConversationProps['hasStreamedTurn'];
  instantStream: ConversationProps['instantStream'];
  onTurnStreamComplete: ConversationProps['onTurnStreamComplete'];
}) {
  return (
    <div ref={listRef} className={LIST_CLASS} {...snap.scrollHandlers}>
      <div aria-hidden className="shrink-0" style={{ height: snap.snapPad }} />
      {visibleTurns.map((turn, index) => {
        const isCurrent = turn.id === currentId;
        const shellStyle = shellStyleForTurn({
          turnId: turn.id,
          snappedId: snap.snappedId,
          index,
          snappedIndex,
        });
        const isSnapped = turn.id === snap.snappedId;

        return (
          <div
            key={turn.id}
            data-snap-turn={turn.id}
            className="w-full shrink-0"
            style={shellStyle}
            onClick={(event) => {
              if (isSnapped) return;
              event.stopPropagation();
              snap.scrollToTurn(turn.id);
            }}
          >
            {turn.role === 'member' ? (
              <MemberTurn
                text={turn.text}
                onRewind={
                  isSnapped && rewindTargets?.has(turn.id)
                    ? () => onRewindTo?.(rewindTargets.get(turn.id)!)
                    : undefined
                }
              />
            ) : (
              <PhoenixTurn
                turn={turn}
                isCurrent={isCurrent}
                uniformColor
                hasStreamedTurn={hasStreamedTurn}
                instantStream={instantStream}
                onTurnStreamComplete={onTurnStreamComplete}
              />
            )}
          </div>
        );
      })}
      <div aria-hidden className="shrink-0" style={{ height: snap.snapPad }} />
    </div>
  );
}

function SnapStackLayout(
  props: ConversationProps,
  shellStyleForTurn: SnapStackShellStyle,
  snapOptions?: StackSnapFocusOptions,
) {
  const { step, onTurnStreamComplete, rewindTargets, onRewindTo } = props;
  const { visibleTurns, listRef, frameRef, currentId } = useConversationStack(
    props,
    true,
  );

  const turnIds = visibleTurns.map((turn) => turn.id);
  const snap = useStackSnapFocus(turnIds, snapOptions);
  const snappedIndex = visibleTurns.findIndex(
    (turn) => turn.id === snap.snappedId,
  );

  return (
    <div
      className={shellClass(props)}
      onClick={() => advanceHandler(props)?.()}
    >
      <div className="flex min-h-0 flex-1 flex-col pt-6">
        <StackFrame
          maxHeight={STACK_WINDOW_MAX_PX}
          transition={`max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`}
          frameRef={frameRef}
          scrollRef={snap.scrollRef}
          fadeTop={false}
          snapScroll
          onScroll={snap.onScroll}
        >
          <SnapTurnList
            listRef={listRef}
            visibleTurns={visibleTurns}
            currentId={currentId}
            snap={snap}
            snappedIndex={snappedIndex}
            shellStyleForTurn={shellStyleForTurn}
            rewindTargets={rewindTargets}
            onRewindTo={onRewindTo}
            hasStreamedTurn={props.hasStreamedTurn}
            instantStream={props.instantStream}
            onTurnStreamComplete={onTurnStreamComplete}
          />
        </StackFrame>

        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
        >
          <Tools {...props} />
        </div>
      </div>
    </div>
  );
}

function SnapStackShell(props: ConversationProps) {
  return SnapStackLayout(props, (input) => snapStackShellStyle(input));
}

function SnapStackFlatShell(props: ConversationProps) {
  return SnapStackLayout(
    props,
    (input) =>
      snapStackFlatShellStyle({
        turnId: input.turnId,
        snappedId: input.snappedId,
      }),
    { liveFocus: false },
  );
}

/* ------------------------------------------------------------------ */
/* H — Pull snap stack                                                 */
/* ------------------------------------------------------------------ */

const RECALL_ANSWER_ATTR = 'data-recall-answer';
const RECALL_EDIT_HINT = 'Tap to edit';
const RECALL_CHECKPOINT_TRANSITION = `opacity 180ms ${STACK_EASE}, transform 180ms ${STACK_EASE}`;

function updateRecallCheckpoints(scroller: HTMLElement) {
  const answers = Array.from(
    scroller.querySelectorAll<HTMLElement>(`[${RECALL_ANSWER_ATTR}]`),
  );
  if (answers.length === 0) return;

  const bounds = scroller.getBoundingClientRect();
  const focusY = bounds.top + bounds.height / 2;
  const distances = answers.map((answer) => {
    const rect = answer.getBoundingClientRect();
    return Math.abs(rect.top + rect.height / 2 - focusY);
  });
  const nearest = Math.min(...distances);
  const activeIndex = distances.indexOf(nearest);

  answers.forEach((answer, index) => {
    const isActive = index === activeIndex;
    answer.style.opacity = isActive ? '1' : '0.22';
    answer.style.transform = `scale(${isActive ? 1 : 0.92})`;
    answer.toggleAttribute('data-active', isActive);
  });
}

function PullSnapStackShell(props: ConversationProps) {
  const { step, onTurnStreamComplete, rewindTargets, onRewindTo } = props;
  const [isRecalling, setIsRecalling] = useState(false);
  const { shellRef, shellHeight } = useShellHeight();
  const scrollRef = useRef<HTMLDivElement>(null);

  const canRecall = (rewindTargets?.size ?? 0) > 0;
  const recalling = isRecalling && canRecall;

  const closeRecall = useCallback(() => setIsRecalling(false), []);
  const openRecall = useCallback(() => setIsRecalling(true), []);
  const atBottom = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return true;
    return node.scrollTop >= node.scrollHeight - node.clientHeight - 2;
  }, []);

  const recall = usePullToRecall({
    enabled: canRecall,
    isOpen: recalling,
    atBottom,
    onOpen: openRecall,
    onClose: closeRecall,
  });

  useEffect(() => {
    if (!canRecall) setIsRecalling(false);
  }, [canRecall]);

  const expansion = recalling ? 1 - recall.dismiss : recall.pull;
  const isRecallActive = expansion > 0;

  const {
    visibleTurns,
    listRef,
    frameRef,
    isFilled,
    promptHeight,
    currentId,
    isCompact,
  } = useConversationStack(props, isRecallActive);

  const restHeight = restStackHeight(isCompact, promptHeight);
  const openHeight = Math.max(restHeight, shellHeight - 24);
  const maxHeight = lerp(restHeight, openHeight, expansion);

  useLayoutEffect(() => {
    if (!isRecallActive) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
    if (recalling) updateRecallCheckpoints(node);
  }, [isRecallActive, maxHeight, recalling, visibleTurns.length]);

  function handleHistoryScroll() {
    const node = scrollRef.current;
    if (node) updateRecallCheckpoints(node);
  }

  function handleShellClick() {
    if (recall.consumeDragClick()) return;
    if (recalling) {
      closeRecall();
      return;
    }
    advanceHandler(props)?.();
  }

  return (
    <div
      ref={shellRef}
      className={shellClass(props, 'overflow-hidden')}
      onClick={handleShellClick}
    >
      <div
        className="flex min-h-0 flex-1 flex-col pt-6"
        style={{
          touchAction: recalling ? 'pan-y' : canRecall ? 'none' : undefined,
        }}
        {...recall.handlers}
      >
        <StackFrame
          maxHeight={maxHeight}
          transition={
            recall.isDragging
              ? 'none'
              : `max-height ${STACK_COMPACT_MS}ms ${STACK_EASE}`
          }
          frameRef={frameRef}
          scrollRef={scrollRef}
          fadeTop={!isRecallActive && !isCompact && isFilled}
          scrollable={recalling}
          answerSnap={recalling}
          onScroll={recalling ? handleHistoryScroll : undefined}
        >
          <div ref={listRef} className={LIST_CLASS}>
            {visibleTurns.map((turn, index) => {
              const fromEnd = visibleTurns.length - 1 - index;
              const isCurrent = turn.id === currentId;
              const hidden = isCompact && !isCurrent && !isRecallActive;
              if (hidden) return null;

              if (turn.role === 'member') {
                const target = rewindTargets?.get(turn.id);
                const isCheckpoint = recalling && target !== undefined;
                return (
                  <div
                    key={turn.id}
                    data-recall-answer={isCheckpoint ? '' : undefined}
                    className="flex w-full shrink-0 flex-col items-stretch"
                    style={{
                      opacity: isCheckpoint ? 0.22 : 1,
                      transform: isCheckpoint ? 'scale(0.92)' : undefined,
                      transformOrigin: 'right center',
                      transition: isCheckpoint
                        ? RECALL_CHECKPOINT_TRANSITION
                        : undefined,
                    }}
                  >
                    <MemberTurn
                      text={turn.text}
                      style={
                        recalling
                          ? undefined
                          : lineMotion({
                              fromEnd,
                              role: 'member',
                              expansion,
                              animate: !isRecallActive,
                            })
                      }
                      onRewind={
                        isCheckpoint
                          ? () => {
                              closeRecall();
                              onRewindTo?.(target);
                            }
                          : undefined
                      }
                    />
                    {isCheckpoint ? (
                      <span
                        data-recall-edit-hint
                        className="text-foreground-neutral-default/45 pointer-events-none pr-1 text-right font-sans text-[15px] leading-5"
                      >
                        {RECALL_EDIT_HINT}
                      </span>
                    ) : null}
                  </div>
                );
              }

              return (
                <PhoenixTurn
                  key={turn.id}
                  turn={turn}
                  isCurrent={isCurrent}
                  uniformColor={recalling}
                  style={
                    recalling
                      ? {
                          opacity: 0.24,
                          transition: 'opacity 200ms ease',
                        }
                      : lineMotion({
                          fromEnd,
                          role: 'phoenix',
                          expansion,
                          animate: !isRecallActive,
                        })
                  }
                  hasStreamedTurn={props.hasStreamedTurn}
                  instantStream={props.instantStream}
                  onTurnStreamComplete={onTurnStreamComplete}
                />
              );
            })}
          </div>
        </StackFrame>
        <div
          className={cn(
            'flex flex-col',
            toolShellFills(step) ? 'min-h-0 flex-1' : 'shrink-0',
          )}
          style={{
            opacity: Math.max(0, 1 - expansion * 2.2),
            transform: `translateY(${expansion * 24}px)`,
            transition: recall.isDragging ? 'none' : RECALL_TRANSITION,
            pointerEvents: isRecallActive ? 'none' : undefined,
          }}
          aria-hidden={isRecallActive}
        >
          <Tools {...props} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ConversationShell(props: ConversationProps) {
  const variant = props.variant ?? DEFAULT_REWIND_VARIANT;
  if (variant === 'B') return <LivingAnswersShell {...props} />;
  if (variant === 'C') return <SaySoShell {...props} />;
  if (variant === 'D') return <SwipeBackShell {...props} />;
  if (variant === 'E') return <SnapAnswersShell {...props} />;
  if (variant === 'F') return <SnapStackShell {...props} />;
  if (variant === 'G') return <SnapStackFlatShell {...props} />;
  if (variant === 'H') return <PullSnapStackShell {...props} />;
  return <PullToRememberShell {...props} />;
}
