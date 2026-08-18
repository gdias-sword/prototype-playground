'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useRef, useState } from 'react';
import { ChatScene } from './chat-scene';
import { HomeIndicator, StatusBar } from './device-frame';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';
import { PhoenixCopy, type PhoenixStep, useDelayedTool } from './phoenix-scene';
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

export function Experience() {
  const turnIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const [phase, setPhase] = useState<Phase>('entering');
  const [isHero, setIsHero] = useState(false);
  const [step, setStep] = useState<PhoenixStep>({ kind: 'guide', index: 0 });
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [turns, setTurns] = useState<StackTurn[]>([]);
  const [mood, setMood] = useState<PhoenixMood>('think');
  const [door, setDoor] = useState<DoorId | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const toolReady = useDelayedTool(
    phase === 'phoenix' && step.kind !== 'guide' && mood === 'listen',
    480,
  );

  function nextTurnId() {
    turnIdRef.current += 1;
    return `turn-${turnIdRef.current}`;
  }

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }

  function pushTurns(...incoming: Omit<StackTurn, 'id'>[]) {
    setTurns((current) => [
      ...current,
      ...incoming.map((turn) => ({ ...turn, id: nextTurnId() })),
    ]);
  }

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
    if (phase !== 'phoenix' || step.kind !== 'guide') return;
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (phase !== 'phoenix' || step.kind === 'guide') return;
    setMood('speak');
  }, [phase, step]);

  useEffect(() => {
    if (phase !== 'exiting' || !door) return;
    const id = window.setTimeout(() => {
      setPhase('chat');
      setMood('breath');
    }, 1100);
    return () => window.clearTimeout(id);
  }, [phase, door]);

  useEffect(() => {
    if (phase !== 'chat' || !door) return;
    setChatCount(0);
    const first = window.setTimeout(() => setChatCount(1), 700);
    const second = window.setTimeout(() => setChatCount(2), 1700);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [phase, door]);

  function commitMember(
    text: string,
    next: PhoenixStep,
    nextAnswers: Answers,
    care?: string,
  ) {
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
        : phase === 'phoenix' &&
            step.kind !== 'guide' &&
            step.kind !== 'ready'
          ? 'compact'
          : 'hero';

  const showChat = phase === 'exiting' || phase === 'chat';

  const conversation = {
    turns,
    step,
    toolReady,
    excludedAreas: selectedAreas(answers),
    onTurnStreamComplete: (turnId: string) => {
      const currentTurn = turns.at(-1);
      if (
        phase !== 'phoenix' ||
        currentTurn?.id !== turnId ||
        currentTurn.role !== 'phoenix'
      ) {
        return;
      }
      setMood(currentTurn.kind === 'question' ? 'listen' : 'breath');
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
