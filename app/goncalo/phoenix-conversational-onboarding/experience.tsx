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
import { LaurenPortrait, laurenPortraitSrc } from './lauren-portrait';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';
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
type Layout = 'seed' | 'hero' | 'compact' | 'avatar';

const PAIR_SIZE_PX = 120;
const PAIR_OVERLAP_PX = 20;
const PAIR_GAP_PX = 4;
const PAIR_CUTOUT_RADIUS_PX = PAIR_SIZE_PX / 2 + PAIR_GAP_PX;
const PAIR_CUTOUT_X = `calc(100% + ${PAIR_SIZE_PX / 2 - PAIR_OVERLAP_PX}px)`;
const PAIR_CUTOUT_MASK = `radial-gradient(circle ${PAIR_CUTOUT_RADIUS_PX}px at ${PAIR_CUTOUT_X} 50%, transparent ${PAIR_CUTOUT_RADIUS_PX}px, #000 ${PAIR_CUTOUT_RADIUS_PX + 1}px)`;

const pairCutoutStyle = {
  WebkitMaskImage: PAIR_CUTOUT_MASK,
  maskImage: PAIR_CUTOUT_MASK,
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
} as const;

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

function lineFor(step: PhoenixStep, answers: Answers) {
  if (step.kind === 'guide') return GUIDE_LINES[step.index];
  if (step.kind === 'ready') return GUIDE_LINES[3];
  if (step.kind === 'more') return moreQuestion(answers.area ?? 'that');
  if (step.kind === 'doors') return doorsLine();
  if (step.index === 0) return areaQuestion(answers.completed.length);
  if (step.index === 1) return durationQuestion();
  if (step.index === 2) return intensityQuestion();
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
}: {
  navigatorRef?: Ref<ExperienceHandle | null>;
  onControlsChange?: (state: ExperienceControls) => void;
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
  ): Checkpoint {
    return {
      key: checkpointKey(nextPhase, nextStep, nextTurns.length),
      label: checkpointLabel(nextPhase, nextStep, nextAnswers, nextDoor),
      phase: nextPhase,
      step: cloneStep(nextStep),
      answers: cloneAnswers(nextAnswers),
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
        text: areaQuestion(0),
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
    );
    const areaSnapshot = makeCheckpoint(
      'phoenix',
      areaStep,
      EMPTY_ANSWERS,
      areaTurns,
      'listen',
      null,
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
    const image = new window.Image();
    image.src = laurenPortraitSrc;
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
      makeCheckpoint('chat', step, answers, turns, 'breath', door, chatCount),
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
        text: lineFor(next, nextAnswers),
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

  const layout: Layout =
    phase === 'chat' || phase === 'exiting'
      ? 'avatar'
      : phase === 'entering' && !isHero
        ? 'seed'
        : phase === 'phoenix' && step.kind !== 'guide' && step.kind !== 'ready'
          ? 'compact'
          : 'hero';

  const showChat = phase === 'exiting' || phase === 'chat';
  const isPaired =
    layout === 'hero' &&
    phase === 'phoenix' &&
    (step.kind === 'ready' || (step.kind === 'guide' && step.index >= 1));

  const conversation: ConversationProps = {
    turns,
    step,
    toolReady,
    excludedAreas: selectedAreas(answers),
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
        makeCheckpoint(phase, step, answers, turns, 'listen', door, chatCount),
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
    onArea: (area: string) => {
      const nextAnswers = { ...answers, area };
      setAnswers(nextAnswers);
      commitMember(area, { kind: 'know', index: 1 }, nextAnswers);
    },
    onDuration: (duration: string) => {
      const nextAnswers = { ...answers, duration };
      setAnswers(nextAnswers);
      commitMember(
        duration,
        { kind: 'know', index: 2 },
        nextAnswers,
        durationCareLine(duration),
      );
    },
    onIntensity: (intensity: number) => {
      const nextAnswers = { ...answers, intensity };
      setAnswers(nextAnswers);
      commitMember(
        intensityAnswer(intensity),
        { kind: 'know', index: 3 },
        nextAnswers,
        intensityCareLine(intensity),
      );
    },
    onTingling: (tingling: boolean) => {
      const nextAnswers = completeCondition({ ...answers, tingling });
      setAnswers(nextAnswers);
      const atMax = nextAnswers.completed.length >= MAX_BODY_AREAS;
      commitMember(
        tingling ? 'Yes' : 'No',
        atMax ? { kind: 'doors' } : { kind: 'more' },
        nextAnswers,
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
          'absolute inset-0 flex flex-col transition-opacity duration-700',
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
            layout !== 'hero' && layout !== 'compact' && 'h-[232px]',
          )}
        />
        {phase === 'phoenix' || phase === 'exiting' ? (
          <PhoenixCopy {...conversation} />
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
          'pointer-events-none absolute z-30 flex items-center justify-center transition-[top,left,width,height,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          layout === 'seed' &&
            'top-[42%] left-1/2 size-[60px] -translate-x-1/2',
          layout === 'hero' &&
            !isPaired &&
            'top-[64px] left-1/2 size-[148px] -translate-x-1/2',
          layout === 'hero' &&
            isPaired &&
            'top-[76px] left-1/2 h-[120px] w-[220px] -translate-x-1/2',
          layout === 'compact' &&
            'top-[48px] left-1/2 size-[80px] -translate-x-1/2',
          layout === 'avatar' &&
            'top-[62px] left-[44px] size-[32px] translate-x-0',
        )}
      >
        <div
          className={cn(
            'relative aspect-square shrink-0 transition-[width,height] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            layout === 'seed' && 'size-[60px]',
            layout === 'hero' && (isPaired ? 'size-[120px]' : 'size-[148px]'),
            layout === 'compact' && 'size-[80px]',
            layout === 'avatar' && 'size-[32px]',
          )}
        >
          <div
            className={cn(
              'relative h-full w-full',
              isPaired && 'overflow-hidden rounded-full',
            )}
            style={isPaired ? pairCutoutStyle : undefined}
          >
            <PhoenixOrb mood={mood} className="relative h-full w-full" />
          </div>
        </div>
        <div
          className={cn(
            'relative z-10 min-h-0 min-w-0 shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#eaf2fe] to-[#a6c9f8] transition-[width,height,margin,opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            isPaired
              ? '-ml-5 size-[120px] translate-x-0 scale-100 opacity-100 shadow-[0_8px_8px_rgba(0,0,0,0.08)]'
              : 'ml-0 size-0 translate-x-2 scale-90 opacity-0',
          )}
        >
          <LaurenPortrait decorative />
        </div>
      </div>
    </div>
  );
}
