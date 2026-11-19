'use client';

import { cn } from '@/design/utils';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import icCheck from './assets/ic-check.svg';
import icClock from './assets/ic-clock.svg';
import stepPhone from './assets/step-phone.png';
import stepTexture from './assets/step-texture.png';
import { Details, Visual, type Layout } from './benefits';
import { KitFinish, KitTrack } from './kit-layouts';
import { assetSrc, Footer } from './shell';
import { useTuning } from './tuning';

type Phase = 'plan' | 'next' | 'steps';

const EASE = [0.2, 1, 0.4, 1] as const;
const MUTED = '#bdbdbd';
const INK = '#0d0d0d';

const COPY: Record<string, (name: string) => [string, string]> = {
  care: (name) => [
    `Welcome, ${name}. Your care is fully covered.`,
    'A few steps to meet your physical therapist.',
  ],
  included: (name) => [
    `You’re in, ${name}. Your access is unlocked.`,
    'Here’s everything included in your plan.',
  ],
  kit: (name) => [
    `Welcome, ${name}. You’ve got a gift on the way.`,
    'Your welcome kit is on us. Let’s get you started.',
  ],
  pass: (name) => [
    `Good news, ${name}. Your access is unlocked.`,
    'Your Sword plan is ready. Here’s what’s next.',
  ],
  'kit-finish': (name) => [
    `Welcome, ${name}. Your welcome kit is on us.`,
    'Three steps, then it ships to your door.',
  ],
  'kit-track': (name) => [
    `You’re in, ${name}. There’s a gift at the finish.`,
    'Three steps to your free welcome kit.',
  ],
  timeline: (name) => [
    `Your plan starts with getting to know you, ${name}.`,
    'Next, you will answer some questions about your symptoms and goals.',
  ],
};

interface JourneyIntroProps {
  firstName: string;
  variant: string;
  onContinue: () => void;
}

export function JourneyIntro({
  firstName,
  variant,
  onContinue,
}: JourneyIntroProps) {
  const isReduced = useReducedMotion();
  const tuning = useTuning();
  const [phase, setPhase] = useState<Phase>(isReduced ? 'steps' : 'plan');

  useEffect(() => {
    if (isReduced) return;
    const timers = [
      window.setTimeout(() => setPhase('next'), tuning.secondLineAt * 1000),
      window.setTimeout(() => setPhase('steps'), tuning.settleAt * 1000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [isReduced, tuning.secondLineAt, tuning.settleAt]);

  const isSettled = phase === 'steps';
  const isColumn = variant === 'timeline' || variant === 'kit-finish';
  const isWide = variant === 'kit-track';
  const isSplit = !isColumn && !isWide;
  const [first, second] = COPY[variant](firstName);

  return (
    <>
      <div
        className={cn(
          'mx-auto flex w-full flex-1 flex-col px-6',
          isSplit
            ? 'max-w-[1008px] lg:flex-row lg:items-center lg:gap-10'
            : isWide
              ? 'max-w-[1008px]'
              : 'max-w-[608px]',
          isSettled ? 'gap-8 pt-6 pb-40 lg:pt-8' : 'justify-center pb-[12vh]',
          isSettled && isSplit && 'lg:pt-0 lg:pb-28',
        )}
      >
        <div
          className={cn(
            'flex w-full flex-col',
            isSettled
              ? 'gap-6 lg:flex-1 lg:gap-8'
              : 'mx-auto max-w-[560px] justify-center',
            isSettled && !isSplit && 'gap-8 lg:gap-10',
            !isSettled && isWide && 'lg:max-w-[720px]',
          )}
        >
          <AnimatePresence mode="wait">
            {phase === 'plan' ? (
              <Sentence key="plan" id="plan" words={first} isSettled={false} />
            ) : (
              <Sentence
                key="next"
                id="next"
                words={second}
                isSettled={isSettled}
                settledSize={isColumn ? 28 : 32}
              />
            )}
          </AnimatePresence>
          {isSettled && <Content variant={variant} />}
        </div>
        {isSettled && isSplit && (
          <Visual layout={variant as Layout} firstName={firstName} />
        )}
      </div>
      {isSettled && (
        <Footer
          label={isColumn ? 'Continue' : 'Let’s start'}
          isSolid={false}
          delay={isReduced ? 0 : tuning.continueDelay}
          onContinue={onContinue}
        />
      )}
      <p className="sr-only" aria-live="polite">
        {phase === 'plan' ? first : second}
      </p>
    </>
  );
}

function Content({ variant }: { variant: string }) {
  if (variant === 'timeline') return <Steps />;
  if (variant === 'kit-finish') return <KitFinish />;
  if (variant === 'kit-track') return <KitTrack />;
  return <Details layout={variant as Layout} />;
}

function Sentence({
  id,
  words,
  isSettled,
  settledSize = 28,
}: {
  id: string;
  words: string;
  isSettled: boolean;
  settledSize?: number;
}) {
  const isReduced = useReducedMotion();
  const tuning = useTuning();
  const ref = useRef<HTMLParagraphElement>(null);
  const [measure, setMeasure] = useState<{
    lines: string[][];
    height: number;
    scale: number;
  } | null>(null);
  const tokens = words.split(' ');
  const isLines = tuning.textReveal === 'lines';

  useLayoutEffect(() => {
    const paragraph = ref.current!;
    const lines: string[][] = [];
    let top = Number.NaN;
    paragraph.querySelectorAll('span').forEach((span, index) => {
      if (span.offsetTop !== top) {
        top = span.offsetTop;
        lines.push([]);
      }
      lines[lines.length - 1].push(tokens[index]);
    });
    const size = Number.parseFloat(getComputedStyle(paragraph).fontSize);
    setMeasure({
      lines,
      height: paragraph.offsetHeight,
      scale: (size >= 40 ? settledSize : 28) / size,
    });
  }, [words, settledSize]);

  const rise = {
    duration: tuning.stepDuration,
    ease: EASE,
  };

  return (
    <motion.div
      layout="position"
      style={{
        height:
          isSettled && measure ? measure.height * measure.scale : undefined,
      }}
      exit={{
        opacity: 0,
        y: -tuning.stepDistance / 2,
        transition: { duration: 0.5, ease: EASE },
      }}
      transition={{ layout: { duration: tuning.moveDuration, ease: EASE } }}
    >
      <motion.p
        ref={ref}
        aria-hidden
        className="w-full font-serif text-[32px] leading-10 tracking-[-0.4px] lg:text-[40px] lg:leading-[50px]"
        style={{ originX: 0, originY: 0, opacity: measure ? 1 : 0 }}
        animate={{ scale: isSettled && measure ? measure.scale : 1 }}
        transition={{ duration: tuning.moveDuration, ease: EASE }}
      >
        {measure
          ? measure.lines.map((line, lineIndex) => {
              const offset = measure.lines
                .slice(0, lineIndex)
                .reduce((sum, previous) => sum + previous.length, 0);
              return (
                <motion.span
                  key={`${id}-${lineIndex}`}
                  className="block whitespace-nowrap"
                  initial={
                    isReduced || !isLines
                      ? false
                      : { opacity: 0, y: tuning.stepDistance }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...rise,
                    delay: lineIndex * tuning.lineStagger,
                  }}
                >
                  {line.map((word, wordIndex) => {
                    const index = offset + wordIndex;
                    return (
                      <motion.span
                        key={index}
                        initial={
                          isReduced
                            ? false
                            : { color: MUTED, opacity: isLines ? 1 : 0 }
                        }
                        animate={{ color: INK, opacity: 1 }}
                        transition={{
                          opacity: {
                            ...rise,
                            delay: index * tuning.wordStagger,
                          },
                          color: {
                            duration: 0.45,
                            delay: tuning.readStart + index * tuning.readSpeed,
                            ease: 'easeOut',
                          },
                        }}
                      >
                        {wordIndex > 0 ? ' ' : ''}
                        {word}
                      </motion.span>
                    );
                  })}
                </motion.span>
              );
            })
          : tokens.map((word, index) => (
              <span key={index}>
                {word}
                {index < tokens.length - 1 ? ' ' : ''}
              </span>
            ))}
      </motion.p>
    </motion.div>
  );
}

function Steps() {
  const isReduced = useReducedMotion();
  const { stepsStart, rowStagger, stepDuration, stepDistance } = useTuning();
  const card = stepsStart + rowStagger;
  function enter(delay: number) {
    return {
      initial: isReduced ? false : { opacity: 0, y: stepDistance },
      animate: { opacity: 1, y: 0 },
      transition: { duration: stepDuration, delay, ease: EASE },
    };
  }

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        className="flex items-center gap-3"
        initial={isReduced ? false : { opacity: 0, y: stepDistance }}
        animate={{ opacity: [0, 1, 1, 0.4], y: 0 }}
        transition={{
          duration: stepDuration,
          delay: stepsStart,
          ease: EASE,
          opacity: { duration: 2, delay: stepsStart, times: [0, 0.25, 0.6, 1] },
        }}
      >
        <motion.img
          alt=""
          src={assetSrc(icCheck)}
          className="size-5 shrink-0"
          initial={isReduced ? false : { clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.6, delay: stepsStart + 0.3, ease: EASE }}
        />
        <p className="text-[18px] leading-[26px] font-semibold tracking-[0.2px]">
          Account created
        </p>
      </motion.div>

      <motion.div className="flex items-stretch gap-4" {...enter(card)}>
        <div className="flex w-4 shrink-0 flex-col items-center gap-1 pt-[18px]">
          <motion.span
            className="size-4 shrink-0 rounded-full bg-[#4a89e8]"
            initial={isReduced ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              bounce: 0.4,
              duration: 0.6,
              delay: isReduced ? 0 : card + 0.35,
            }}
          />
          <motion.span
            className="h-20 w-0.5 origin-top rounded-full bg-linear-to-b from-[#4a89e8] to-[#4a89e8]/0"
            initial={isReduced ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 1.1,
              delay: isReduced ? 0 : card + 0.5,
              ease: EASE,
            }}
          />
        </div>
        <div className="flex min-w-0 flex-1 items-stretch overflow-clip rounded-3xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)]">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[18px] leading-[26px] font-semibold tracking-[0.2px]">
                Tell us about yourself
              </p>
              <span className="flex items-center gap-1.5 rounded-full bg-[#eaf2fe] px-2.5 py-1 text-[12px] leading-[18px] font-semibold tracking-[0.2px] text-[#2f5aa3]">
                <span className="flex size-4 items-center justify-center">
                  <img alt="" src={assetSrc(icClock)} />
                </span>
                About 5 min
              </span>
            </div>
            <p className="text-[14px] leading-5 tracking-[0.2px]">
              This will help us understand where you are to match you with the
              right physical therapist.
            </p>
          </div>
          <div className="relative hidden aspect-square shrink-0 overflow-clip rounded-2xl bg-linear-to-b from-[#eaf2fe] to-[#c7ddfb] sm:block">
            <img
              alt=""
              src={assetSrc(stepTexture)}
              className="absolute top-[-95.98%] left-[-103.54%] h-[291.47%] w-[307.29%] max-w-none opacity-50"
            />
            <motion.img
              alt=""
              src={assetSrc(stepPhone)}
              width={96}
              height={120}
              className="absolute bottom-[-8px] left-1/2 h-[120px] w-24 -translate-x-1/2"
              initial={isReduced ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: isReduced ? 0 : card + 0.4,
                ease: EASE,
              }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex items-center gap-3"
        {...enter(stepsStart + rowStagger * 2)}
      >
        <span className="size-5 shrink-0 rounded-full border-2 border-[#0d0d0d] opacity-40" />
        <p className="text-[18px] leading-[26px] font-semibold tracking-[0.2px] opacity-40">
          Download the app
        </p>
      </motion.div>
    </div>
  );
}
