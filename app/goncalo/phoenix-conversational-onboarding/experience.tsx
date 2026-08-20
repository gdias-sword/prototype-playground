'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import { ChatScene } from './chat-scene';
import { PhoenixCopy } from './conversation-variants';
import { HomeIndicator, StatusBar } from './device-frame';
import { LaurenPortrait } from './lauren-portrait';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';
import {
  usesBodyCanvas,
  usesIntakeComposer,
  type BodyAreaVariantKey,
} from './body-area-variants';
import type { AreaCommitMeta } from './intake-composer';
import { BodyCanvasPicker } from './body-canvas';
import {
  type ConversationProps,
  type PhoenixStep,
  useDelayedTool,
} from './phoenix-scene';
import {
  type Answers,
  type DoorId,
  type StackTurn,
  DOORS,
  GUIDE_LINES,
  READY_LABEL,
  MAX_BODY_AREAS,
  MORE_NO_LABEL,
  MORE_YES_LABEL,
  completeCondition,
  durationCareLine,
  durationQuestion,
  doorsLine,
  areaQuestion,
  followUpQuestion,
  intensityAnswer,
  intensityCareLine,
  intensityQuestion,
  moreQuestion,
  selectedAreas,
  startNextCondition,
  tinglingCareLine,
} from './script';
import { WorldBackdrop } from './world-scene';

type Phase = 'entering' | 'phoenix' | 'exiting' | 'chat';
type Layout = 'seed' | 'hero' | 'compact' | 'avatar' | 'canvas';

export interface ExperienceHandle {
  prevQuestion: () => void;
  nextQuestion: () => void;
  skipIntro: () => void;
}

export interface ExperienceControls {
  canPrev: boolean;
  canNext: boolean;
  canSkipIntro: boolean;
}

interface Checkpoint {
  key: string;
  label: string;
  phase: Phase;
  step: PhoenixStep;
  answers: Answers;
  areaQueue: string[];
  areaQueueIndex: number;
  turns: StackTurn[];
  mood: PhoenixMood;
  door: DoorId | null;
  chatCount: number;
}

const EMPTY_ANSWERS: Answers = {
  area: null,
  duration: null,
  intensity: null,
  tingling: null,
  completed: [],
};

function areaPrompt(variant: BodyAreaVariantKey) {
  if (usesIntakeComposer(variant)) return areaQuestion(0);
  return `Select up to ${MAX_BODY_AREAS} body areas you want to treat`;
}

function lineFor(
  step: PhoenixStep,
  answers: Answers,
  variant: BodyAreaVariantKey,
) {
  if (step.kind === 'guide') return GUIDE_LINES[step.index];
  if (step.kind === 'ready') return GUIDE_LINES[3];
  if (step.kind === 'more') return moreQuestion(answers.area ?? 'that');
  if (step.kind === 'doors') return doorsLine();
  if (step.index === 0) return areaPrompt(variant);
  if (step.index === 1)
    return answers.area
      ? `When did it start for your ${answers.area.toLowerCase()} pain?`
      : durationQuestion();
  if (step.index === 2)
    return answers.area
      ? `How intense has it been lately for your ${answers.area.toLowerCase()} pain?`
      : intensityQuestion();
  return followUpQuestion(answers.area ?? 'Neck');
}

function turnKind(step: PhoenixStep): StackTurn['kind'] {
  if (step.kind === 'guide') return 'guide';
  return 'question';
}

function cloneAnswers(answers: Answers): Answers {
  return {
    ...answers,
    completed: answers.completed.map((condition) => ({ ...condition })),
  };
}

function cloneStep(step: PhoenixStep): PhoenixStep {
  return { ...step };
}

function checkpointKey(phase: Phase, step: PhoenixStep, turnCount: number) {
  if (phase === 'chat' || phase === 'exiting') return `chat:${turnCount}`;
  if (step.kind === 'know') return `know:${step.index}:${turnCount}`;
  return `${step.kind}:${turnCount}`;
}

function checkpointLabel(
  phase: Phase,
  step: PhoenixStep,
  answers: Answers,
  door: DoorId | null,
) {
  if (phase === 'chat' || phase === 'exiting') {
    return DOORS.find((item) => item.id === door)?.label ?? 'Chat';
  }
  if (step.kind === 'ready') return 'Ready';
  if (step.kind === 'more') {
    return answers.area ? `More · ${answers.area}` : 'More';
  }
  if (step.kind === 'doors') return 'Doors';
  if (step.kind === 'know') {
    const round = answers.completed.length + 1;
    const suffix = round > 1 ? ` ${round}` : '';
    if (step.index === 0) return `Area${suffix}`;
    if (step.index === 1) {
      return answers.area ? `Duration · ${answers.area}` : 'Duration';
    }
    if (step.index === 2) {
      return answers.area ? `Intensity · ${answers.area}` : 'Intensity';
    }
    return answers.area ? `Follow-up · ${answers.area}` : 'Follow-up';
  }
  return 'Question';
}

export function Experience({
  navigatorRef,
  onControlsChange,
  bodyAreaVariant = 'A',
}: {
  navigatorRef?: Ref<ExperienceHandle | null>;
  onControlsChange?: (state: ExperienceControls) => void;
  bodyAreaVariant?: BodyAreaVariantKey;
} = {}) {
  const turnIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const restoringRef = useRef(false);
  const streamedTurnIdsRef = useRef(new Set<string>());
  const checkpointsRef = useRef<Checkpoint[]>([]);
  const checkpointIndexRef = useRef(-1);
  const phaseRef = useRef<Phase>('entering');
  const stepRef = useRef<PhoenixStep>({ kind: 'guide', index: 0 });
  const [phase, setPhase] = useState<Phase>('entering');
  const [isHero, setIsHero] = useState(false);
  const [step, setStep] = useState<PhoenixStep>({ kind: 'guide', index: 0 });
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [areaQueue, setAreaQueue] = useState<string[]>([]);
  const [areaQueueIndex, setAreaQueueIndex] = useState(0);
  const areaQueueRef = useRef(areaQueue);
  const areaQueueIndexRef = useRef(areaQueueIndex);
  const [turns, setTurns] = useState<StackTurn[]>([]);
  const [mood, setMood] = useState<PhoenixMood>('think');
  const [door, setDoor] = useState<DoorId | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const [skipToolDelay, setSkipToolDelay] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [checkpointIndex, setCheckpointIndex] = useState(-1);
  const toolReady = useDelayedTool(
    phase === 'phoenix' && step.kind !== 'guide' && mood === 'listen',
    skipToolDelay ? 0 : 480,
  );

  phaseRef.current = phase;
  stepRef.current = step;
  areaQueueRef.current = areaQueue;
  areaQueueIndexRef.current = areaQueueIndex;

  function nextTurnId() {
    turnIdRef.current += 1;
    return `turn-${turnIdRef.current}`;
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  function pushTurns(...incoming: Omit<StackTurn, 'id'>[]) {
    setTurns((current) => [
      ...current,
      ...incoming.map((turn) => ({ ...turn, id: nextTurnId() })),
    ]);
  }

  function makeCheckpoint(
    nextPhase: Phase,
    nextStep: PhoenixStep,
    nextAnswers: Answers,
    nextTurns: StackTurn[],
    nextMood: PhoenixMood,
    nextDoor: DoorId | null,
    nextChatCount: number,
    nextAreaQueue: string[],
    nextAreaQueueIndex: number,
  ): Checkpoint {
    return {
      key: checkpointKey(nextPhase, nextStep, nextTurns.length),
      label: checkpointLabel(nextPhase, nextStep, nextAnswers, nextDoor),
      phase: nextPhase,
      step: cloneStep(nextStep),
      answers: cloneAnswers(nextAnswers),
      areaQueue: [...nextAreaQueue],
      areaQueueIndex: nextAreaQueueIndex,
      turns: [...nextTurns],
      mood: nextMood,
      door: nextDoor,
      chatCount: nextChatCount,
    };
  }

  function recordCheckpoint(snapshot: Checkpoint) {
    if (checkpointIndexRef.current < checkpointsRef.current.length - 1) {
      return;
    }

    const last = checkpointsRef.current.at(-1);
    if (last?.key === snapshot.key) return;

    const next = [...checkpointsRef.current, snapshot];
    checkpointsRef.current = next;
    checkpointIndexRef.current = next.length - 1;
    setCheckpoints(next);
    setCheckpointIndex(next.length - 1);
  }

  function discardFutureCheckpoints() {
    const index = checkpointIndexRef.current;
    if (index < 0 || index >= checkpointsRef.current.length - 1) return;

    const next = checkpointsRef.current.slice(0, index + 1);
    checkpointsRef.current = next;
    setCheckpoints(next);
  }

  function restoreCheckpoint(index: number) {
    const snapshot = checkpointsRef.current[index];
    if (!snapshot) return;

    clearTimers();
    restoringRef.current = true;
    checkpointIndexRef.current = index;
    setCheckpointIndex(index);
    setSkipToolDelay(true);
    setPhase(snapshot.phase);
    setStep(cloneStep(snapshot.step));
    setAnswers(cloneAnswers(snapshot.answers));
    setAreaQueue([...snapshot.areaQueue]);
    setAreaQueueIndex(snapshot.areaQueueIndex);
    setTurns([...snapshot.turns]);
    setMood(snapshot.mood);
    setDoor(snapshot.door);
    setChatCount(snapshot.chatCount);
  }

  function skipIntro() {
    const currentPhase = phaseRef.current;
    const currentStep = stepRef.current;
    if (currentPhase === 'exiting' || currentPhase === 'chat') return;
    if (
      currentPhase === 'phoenix' &&
      currentStep.kind !== 'guide' &&
      currentStep.kind !== 'ready'
    ) {
      return;
    }

    clearTimers();
    restoringRef.current = true;
    setSkipToolDelay(true);
    setIsHero(true);
    setPhase('phoenix');
    setAnswers(EMPTY_ANSWERS);
    setAreaQueue([]);
    setAreaQueueIndex(0);
    setDoor(null);
    setChatCount(0);
    setMood('listen');

    const readyStep: PhoenixStep = { kind: 'ready' };
    const areaStep: PhoenixStep = { kind: 'know', index: 0 };
    const readyTurns: StackTurn[] = GUIDE_LINES.map((text, index) => ({
      id: nextTurnId(),
      role: 'phoenix' as const,
      text,
      kind: index < 3 ? ('guide' as const) : ('question' as const),
    }));
    const areaTurns: StackTurn[] = [
      ...readyTurns,
      {
        id: nextTurnId(),
        role: 'member',
        text: READY_LABEL,
        kind: 'answer',
      },
      {
        id: nextTurnId(),
        role: 'phoenix',
        text: areaPrompt(bodyAreaVariant),
        kind: 'question',
      },
    ];
    areaTurns.forEach((turn) => streamedTurnIdsRef.current.add(turn.id));
    setStep(areaStep);
    setTurns(areaTurns);

    const readySnapshot = makeCheckpoint(
      'phoenix',
      readyStep,
      EMPTY_ANSWERS,
      readyTurns,
      'listen',
      null,
      0,
      [],
      0,
    );
    const areaSnapshot = makeCheckpoint(
      'phoenix',
      areaStep,
      EMPTY_ANSWERS,
      areaTurns,
      'listen',
      null,
      0,
      [],
      0,
    );
    checkpointsRef.current = [readySnapshot, areaSnapshot];
    checkpointIndexRef.current = 1;
    setCheckpoints([readySnapshot, areaSnapshot]);
    setCheckpointIndex(1);
  }

  useImperativeHandle(navigatorRef, () => ({
    prevQuestion() {
      if (phaseRef.current === 'exiting') {
        restoreCheckpoint(checkpointIndexRef.current);
        return;
      }

      const index = checkpointIndexRef.current;
      if (index <= 0) return;
      restoreCheckpoint(index - 1);
    },
    nextQuestion() {
      const index = checkpointIndexRef.current;
      if (index >= checkpointsRef.current.length - 1) return;
      restoreCheckpoint(index + 1);
    },
    skipIntro,
  }));

  useEffect(() => {
    onControlsChange?.({
      canPrev: checkpointIndex > 0 || phase === 'exiting',
      canNext: checkpointIndex >= 0 && checkpointIndex < checkpoints.length - 1,
      canSkipIntro:
        phase === 'entering' ||
        (phase === 'phoenix' &&
          (step.kind === 'guide' || step.kind === 'ready')),
    });
  }, [checkpoints.length, checkpointIndex, onControlsChange, phase, step]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setIsHero(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'entering') return;
    const id = window.setTimeout(() => {
      setPhase('phoenix');
      setMood('speak');
    }, 1200);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'phoenix') return;
    setTurns((current) => {
      if (current.length > 0) return current;
      return [
        {
          id: nextTurnId(),
          role: 'phoenix',
          text: GUIDE_LINES[0],
          kind: 'guide',
        },
      ];
    });
  }, [phase]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind !== 'guide') return;
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'phoenix' || step.kind === 'guide') return;
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'exiting' || !door) return;
    const id = window.setTimeout(() => {
      setPhase('chat');
      setMood('breath');
    }, 1100);
    return () => window.clearTimeout(id);
  }, [phase, door]);

  useEffect(() => {
    if (restoringRef.current) return;
    if (phase !== 'chat' || !door) return;
    setChatCount(0);
    const first = window.setTimeout(() => setChatCount(1), 700);
    const second = window.setTimeout(() => setChatCount(2), 1700);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [phase, door]);

  useEffect(() => {
    if (phase !== 'chat' || !door || chatCount < 2) return;
    recordCheckpoint(
      makeCheckpoint(
        'chat',
        step,
        answers,
        turns,
        'breath',
        door,
        chatCount,
        areaQueueRef.current,
        areaQueueIndexRef.current,
      ),
    );
  }, [phase, door, chatCount, step, answers, turns]);

  useEffect(() => {
    restoringRef.current = false;
  });

  function commitMember(
    text: string,
    next: PhoenixStep,
    nextAnswers: Answers,
    care?: string,
  ) {
    discardFutureCheckpoints();
    setSkipToolDelay(false);
    pushTurns({ role: 'member', text, kind: 'answer' });
    setMood('think');

    const revealNext = () => {
      pushTurns({
        role: 'phoenix',
        text: lineFor(next, nextAnswers, bodyAreaVariant),
        kind: turnKind(next),
      });
      setStep(next);
    };

    if (care) {
      later(() => {
        pushTurns({ role: 'phoenix', text: care, kind: 'care' });
        setMood('speak');
      }, 700);
      later(revealNext, 2800);
      return;
    }

    later(revealNext, 620);
  }

  const isAreaCanvas =
    usesBodyCanvas(bodyAreaVariant) &&
    phase === 'phoenix' &&
    step.kind === 'know' &&
    step.index === 0;

  const layout: Layout =
    phase === 'chat' || phase === 'exiting'
      ? 'avatar'
      : isAreaCanvas
        ? 'canvas'
        : phase === 'entering' && !isHero
          ? 'seed'
          : phase === 'phoenix' && step.kind !== 'guide' && step.kind !== 'ready'
            ? 'compact'
            : 'hero';

  const showChat = phase === 'exiting' || phase === 'chat';

  const conversation: ConversationProps = {
    turns,
    step,
    toolReady,
    excludedAreas: selectedAreas(answers),
    bodyAreaVariant,
    pickedAreas: areaQueue,
    canvasMode: isAreaCanvas,
    hasStreamedTurn: (turnId: string) => streamedTurnIdsRef.current.has(turnId),
    onTurnStreamComplete: (turnId: string) => {
      streamedTurnIdsRef.current.add(turnId);
      const currentTurn = turns.at(-1);
      if (
        phase !== 'phoenix' ||
        currentTurn?.id !== turnId ||
        currentTurn.role !== 'phoenix'
      ) {
        return;
      }
      setMood(currentTurn.kind === 'question' ? 'listen' : 'breath');
      if (currentTurn.kind !== 'question') return;
      recordCheckpoint(
        makeCheckpoint(
          phase,
          step,
          answers,
          turns,
          'listen',
          door,
          chatCount,
          areaQueueRef.current,
          areaQueueIndexRef.current,
        ),
      );
    },
    onGuideAdvance: () => {
      if (step.kind !== 'guide' || mood !== 'breath') return;
      if (step.index < 2) {
        const nextIndex = (step.index + 1) as 1 | 2;
        pushTurns({
          role: 'phoenix',
          text: GUIDE_LINES[nextIndex],
          kind: 'guide',
        });
        setStep({ kind: 'guide', index: nextIndex });
        return;
      }
      pushTurns({
        role: 'phoenix',
        text: GUIDE_LINES[3],
        kind: 'question',
      });
      setStep({ kind: 'ready' });
    },
    onReady: () => {
      commitMember(READY_LABEL, { kind: 'know', index: 0 }, answers);
    },
    onAreas: (areas: string[], meta?: AreaCommitMeta) => {
      const areaQueueNext = areas.slice(0, MAX_BODY_AREAS);
      areaQueueRef.current = areaQueueNext;
      areaQueueIndexRef.current = 0;
      setAreaQueue(areaQueueNext);
      setAreaQueueIndex(0);

      const firstArea = areaQueueNext[0];
      const single = areaQueueNext.length === 1;
      const extraDuration = single ? meta?.duration : undefined;
      const extraIntensity =
        single && extraDuration ? meta?.intensity : undefined;
      const nextAnswers: Answers = {
        area: firstArea,
        duration: extraDuration ?? null,
        intensity: extraIntensity ?? null,
        tingling: null,
        completed: [],
      };
      setAnswers(nextAnswers);

      const memberText = meta?.text ?? areaQueueNext.join(', ');

      if (extraDuration && extraIntensity != null) {
        commitMember(memberText, { kind: 'know', index: 3 }, nextAnswers);
        return;
      }

      if (extraDuration) {
        commitMember(
          memberText,
          { kind: 'know', index: 2 },
          nextAnswers,
          durationCareLine(extraDuration),
        );
        return;
      }

      commitMember(memberText, { kind: 'know', index: 1 }, nextAnswers);
    },
    onDuration: (duration: string, text?: string) => {
      const nextAnswers = { ...answers, duration };
      setAnswers(nextAnswers);
      commitMember(
        text ?? duration,
        { kind: 'know', index: 2 },
        nextAnswers,
        durationCareLine(duration),
      );
    },
    onIntensity: (intensity: number, text?: string) => {
      const nextAnswers = { ...answers, intensity };
      setAnswers(nextAnswers);
      commitMember(
        text ?? intensityAnswer(intensity),
        { kind: 'know', index: 3 },
        nextAnswers,
        intensityCareLine(intensity),
      );
    },
    onTingling: (tingling: boolean) => {
      const nextAnswers = completeCondition({ ...answers, tingling });

      const nextAreaIndex = areaQueueIndexRef.current + 1;
      const queue = areaQueueRef.current;
      const hasMoreAreas = nextAreaIndex < queue.length;

      if (!hasMoreAreas) {
        setAnswers(nextAnswers);
        commitMember(
          tingling ? 'Yes' : 'No',
          { kind: 'doors' },
          nextAnswers,
          tingling ? tinglingCareLine() : undefined,
        );
        return;
      }

      const nextArea = queue[nextAreaIndex]!;
      areaQueueIndexRef.current = nextAreaIndex;
      setAreaQueueIndex(nextAreaIndex);

      const preparedForNextArea: Answers = {
        ...nextAnswers,
        area: nextArea,
        duration: null,
        intensity: null,
        tingling: null,
      };

      setAnswers(preparedForNextArea);
      commitMember(
        tingling ? 'Yes' : 'No',
        { kind: 'know', index: 1 },
        preparedForNextArea,
        tingling ? tinglingCareLine() : undefined,
      );
    },
    onMore: (wantsMore: boolean) => {
      if (wantsMore) {
        const nextAnswers = startNextCondition(answers);
        setAnswers(nextAnswers);
        commitMember(MORE_YES_LABEL, { kind: 'know', index: 0 }, nextAnswers);
        return;
      }

      commitMember(MORE_NO_LABEL, { kind: 'doors' }, answers);
    },
    onDoor: (nextDoor: DoorId) => {
      discardFutureCheckpoints();
      setSkipToolDelay(false);
      const label = DOORS.find((item) => item.id === nextDoor)?.label ?? '';
      pushTurns({ role: 'member', text: label, kind: 'answer' });
      setDoor(nextDoor);
      setPhase('exiting');
      setMood('think');
    },
  };

  return (
    <div className="relative h-full overflow-hidden bg-[#f6f4fb] select-none">
      <WorldBackdrop />
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-[#f4f7ff] transition-opacity duration-1000',
          showChat && phase === 'chat' ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        className={cn(
          'absolute inset-0 flex flex-col pb-12 transition-opacity duration-700',
          phase === 'phoenix' ? 'opacity-100' : 'opacity-0',
          phase !== 'phoenix' && 'pointer-events-none',
        )}
      >
        <StatusBar />
        <div
          className={cn(
            'shrink-0 transition-[height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            layout === 'hero' && 'h-[232px]',
            layout === 'compact' && 'h-[108px]',
            layout === 'canvas' && 'h-[72px]',
            layout !== 'hero' &&
              layout !== 'compact' &&
              layout !== 'canvas' &&
              'h-[232px]',
          )}
        />
        {phase === 'phoenix' || phase === 'exiting' ? (
          <PhoenixCopy {...conversation} />
        ) : null}
        {isAreaCanvas && toolReady ? (
          <BodyCanvasPicker
            maxAreas={MAX_BODY_AREAS}
            selectedAreas={areaQueue}
            onCommit={conversation.onAreas}
          />
        ) : null}
        <HomeIndicator />
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          showChat && phase === 'chat' ? 'opacity-100' : 'opacity-0',
          phase !== 'chat' && 'pointer-events-none',
        )}
      >
        {door && (phase === 'chat' || phase === 'exiting') ? (
          <ChatScene
            door={door}
            answers={answers}
            history={turns}
            avatarSlot
            visibleCount={phase === 'chat' ? chatCount : 0}
          />
        ) : null}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-30 transition-[top,left,width,height,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          layout === 'seed' &&
            'top-[42%] left-1/2 size-[60px] -translate-x-1/2',
          layout === 'hero' &&
            'top-[64px] left-1/2 size-[148px] -translate-x-1/2',
          layout === 'compact' &&
            'top-[48px] left-1/2 size-[80px] -translate-x-1/2',
          layout === 'canvas' &&
            'top-[80px] left-5 size-[36px] translate-x-0',
          layout === 'avatar' &&
            'top-[62px] left-[44px] size-[32px] translate-x-0',
        )}
      >
        <div className="relative h-full w-full">
          <PhoenixOrb mood={mood} className="relative h-full w-full" />
        </div>
      </div>
    </div>
  );
}
