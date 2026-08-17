'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useRef, useState } from 'react';
import { createExperienceAudio, type ExperienceAudio } from './audio';
import { ChatScene } from './chat-scene';
import { HomeIndicator, StatusBar } from './device-frame';
import { PhoenixOrb, type PhoenixMood } from './phoenix-orb';
import { PhoenixCopy, type PhoenixStep, useDelayedTool } from './phoenix-scene';
import {
  type Answers,
  type DoorId,
  GUIDE_LINES,
  areaQuestion,
  durationQuestion,
  intensityQuestion,
  followUpQuestion,
  doorsLine,
} from './script';
import { WorldBackdrop } from './world-scene';

type Phase = 'entering' | 'phoenix' | 'exiting' | 'chat';
type Layout = 'seed' | 'hero' | 'hero-compact' | 'avatar';

const EMPTY_ANSWERS: Answers = {
  area: null,
  duration: null,
  intensity: null,
  tingling: null,
};

function currentLine(step: PhoenixStep, answers: Answers) {
  if (step.kind === 'guide') return GUIDE_LINES[step.index];
  if (step.kind === 'doors') return doorsLine();
  if (step.index === 0) return areaQuestion();
  if (step.index === 1) return durationQuestion(answers.area ?? 'That');
  if (step.index === 2) return intensityQuestion(answers.duration ?? 'Okay');
  return followUpQuestion(answers.area ?? 'Neck');
}

export function Experience({
  muted,
  replayKey,
}: {
  muted: boolean;
  replayKey: number;
}) {
  const audioRef = useRef<ExperienceAudio | null>(null);
  const [phase, setPhase] = useState<Phase>('entering');
  const [isHero, setIsHero] = useState(false);
  const [step, setStep] = useState<PhoenixStep>({ kind: 'guide', index: 0 });
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [previous, setPrevious] = useState<string | null>(null);
  const [mood, setMood] = useState<PhoenixMood>('think');
  const [door, setDoor] = useState<DoorId | null>(null);
  const [chatCount, setChatCount] = useState(0);
  const toolReady = useDelayedTool(
    phase === 'phoenix' && step.kind !== 'guide' && mood === 'listen',
    280,
  );
  const searching =
    phase === 'phoenix' && step.kind === 'know' && step.index === 0;

  useEffect(() => {
    const audio = createExperienceAudio();
    audioRef.current = audio;
    return () => audio.dispose();
  }, [replayKey]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    audioRef.current?.setPresent(true);
    audioRef.current?.setSpeak(
      mood === 'speak' ? 1 : mood === 'think' ? 0.35 : 0.08,
    );
  }, [phase, mood]);

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
    if (phase !== 'phoenix' || step.kind !== 'guide') return;
    setMood('speak');
    const id = window.setTimeout(() => setMood('breath'), 1600);
    return () => window.clearTimeout(id);
  }, [phase, step]);

  useEffect(() => {
    if (phase !== 'phoenix' || step.kind === 'guide') return;
    setMood('speak');
    const speak = window.setTimeout(() => setMood('listen'), 900);
    return () => window.clearTimeout(speak);
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

  function unlock() {
    audioRef.current?.unlock();
  }

  function afterThink(next: PhoenixStep, prev: string) {
    setMood('think');
    window.setTimeout(() => {
      setPrevious(prev);
      setStep(next);
    }, 620);
  }

  const layout: Layout =
    phase === 'chat' || phase === 'exiting'
      ? 'avatar'
      : phase === 'phoenix' && searching
        ? 'hero-compact'
        : phase === 'entering' && !isHero
          ? 'seed'
          : 'hero';

  const showChat = phase === 'exiting' || phase === 'chat';

  return (
    <div
      className="relative h-full overflow-hidden bg-[#f6f4fb] select-none"
      onPointerDown={unlock}
    >
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
        <div className="h-[232px] shrink-0" />
        {phase === 'phoenix' || phase === 'exiting' ? (
          <PhoenixCopy
            step={step}
            answers={answers}
            toolReady={toolReady}
            previous={previous}
            onGuideAdvance={() => {
              if (step.kind !== 'guide') return;
              if (step.index === 0) {
                setPrevious(GUIDE_LINES[0]);
                setStep({ kind: 'guide', index: 1 });
                return;
              }
              afterThink({ kind: 'know', index: 0 }, GUIDE_LINES[1]);
            }}
            onArea={(area) => {
              setAnswers((current) => ({ ...current, area }));
              afterThink(
                { kind: 'know', index: 1 },
                currentLine(step, { ...answers, area }),
              );
            }}
            onDuration={(duration) => {
              setAnswers((current) => ({ ...current, duration }));
              afterThink(
                { kind: 'know', index: 2 },
                currentLine(step, { ...answers, duration }),
              );
            }}
            onIntensity={(intensity) => {
              setAnswers((current) => ({ ...current, intensity }));
              afterThink(
                { kind: 'know', index: 3 },
                currentLine(step, { ...answers, intensity }),
              );
            }}
            onTingling={(tingling) => {
              setAnswers((current) => ({ ...current, tingling }));
              afterThink(
                { kind: 'doors' },
                currentLine(step, { ...answers, tingling }),
              );
            }}
            onDoor={(nextDoor) => {
              setDoor(nextDoor);
              setPhase('exiting');
              setMood('think');
            }}
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
            avatarSlot
            visibleCount={phase === 'chat' ? chatCount : 0}
          />
        ) : null}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute z-30 transition-[top,left,width,height,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
          layout === 'seed' &&
            'top-[42%] left-1/2 size-[88px] -translate-x-1/2',
          layout === 'hero' &&
            'top-[52px] left-1/2 size-[220px] -translate-x-1/2',
          layout === 'hero-compact' &&
            'top-[48px] left-1/2 size-[128px] -translate-x-1/2',
          layout === 'avatar' &&
            'top-[62px] left-[44px] size-[32px] translate-x-0',
        )}
      >
        <div className="relative h-full w-full">
          {layout === 'hero' || layout === 'hero-compact' ? (
            <>
              <span className="phoenix-ring absolute inset-[-18%] rounded-full border border-[#c5d4f8]/50" />
              <span className="phoenix-ring absolute inset-[-32%] rounded-full border border-[#c5d4f8]/30 [animation-delay:-1.4s]" />
            </>
          ) : null}
          <PhoenixOrb mood={mood} className="relative h-full w-full" />
        </div>
      </div>
    </div>
  );
}
