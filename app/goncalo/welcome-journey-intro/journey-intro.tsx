'use client';

import { cn } from '@/design/utils';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KitFinish } from './kit-layouts';
import { Container, Footer, SubHeader } from './shell';
import { useTuning } from './tuning';

type Phase = 'plan' | 'next' | 'steps';

const EASE = [0.2, 1, 0.4, 1] as const;
const MUTED = '#bdbdbd';
const INK = '#0d0d0d';

interface JourneyIntroProps {
  firstName: string;
  onContinue: () => void;
}

export function JourneyIntro({ firstName, onContinue }: JourneyIntroProps) {
  const { intro } = useTuning();
  const first = `Welcome, ${firstName}!`;
  const second = 'Let’s start by getting to know you.';

  if (intro === 'none') {
    return (
      <DirectWelcome title={`${first} ${second}`} onContinue={onContinue} />
    );
  }

  return (
    <SpokenWelcome
      lines={intro === 'one-line' ? [`${first} ${second}`] : [first, second]}
      onContinue={onContinue}
    />
  );
}

/* Skips the spoken lines and enters like every other enrollment step. */

function DirectWelcome({
  title,
  onContinue,
}: {
  title: string;
  onContinue: () => void;
}) {
  const tuning = useTuning();
  return (
    <>
      <Container header={<SubHeader title={title} />}>
        <KitFinish start={tuning.contentDelay} />
      </Container>
      <Footer label="Continue" isSolid={false} onContinue={onContinue} />
    </>
  );
}

function SpokenWelcome({
  lines,
  onContinue,
}: {
  lines: string[];
  onContinue: () => void;
}) {
  const isReduced = useReducedMotion();
  const tuning = useTuning();
  const [phase, setPhase] = useState<Phase>(isReduced ? 'steps' : 'plan');
  const isSingle = lines.length === 1;

  useEffect(() => {
    if (isReduced) return;
    const timers = isSingle
      ? [
          window.setTimeout(
            () => setPhase('steps'),
            tuning.combinedSettleAt * 1000,
          ),
        ]
      : [
          window.setTimeout(() => setPhase('next'), tuning.secondLineAt * 1000),
          window.setTimeout(() => setPhase('steps'), tuning.settleAt * 1000),
        ];
    return () => timers.forEach(window.clearTimeout);
  }, [
    isReduced,
    isSingle,
    tuning.secondLineAt,
    tuning.settleAt,
    tuning.combinedSettleAt,
  ]);

  const isSettled = phase === 'steps';
  const index = phase === 'plan' || isSingle ? 0 : 1;

  return (
    <>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[608px] flex-1 flex-col gap-8 px-6',
          isSettled ? 'pt-6 pb-40 lg:pt-8' : 'justify-center pb-[12vh]',
        )}
      >
        <div
          className={cn(
            'flex w-full flex-col',
            isSettled
              ? 'gap-8 lg:gap-10'
              : 'mx-auto max-w-[560px] justify-center',
          )}
        >
          <AnimatePresence mode="wait">
            <Sentence
              key={index}
              id={String(index)}
              words={lines[index]}
              isSettled={isSettled}
            />
          </AnimatePresence>
          {isSettled && <KitFinish />}
        </div>
      </div>
      {isSettled && (
        <Footer
          label="Continue"
          isSolid={false}
          delay={isReduced ? 0 : tuning.continueDelay}
          onContinue={onContinue}
        />
      )}
      <p className="sr-only" aria-live="polite">
        {lines[index]}
      </p>
    </>
  );
}

function Sentence({
  id,
  words,
  isSettled,
}: {
  id: string;
  words: string;
  isSettled: boolean;
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
      scale: 28 / size,
    });
  }, [words]);

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
