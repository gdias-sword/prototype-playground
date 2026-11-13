'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const RISE = [0.22, 1, 0.36, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;
const SWEEP = [0.65, 0, 0.35, 1] as const;

const INK = '#0d0d0d';
const BLUE = '#4a89e8';

export type Celebration = 'seal' | 'confetti' | 'sparkle' | 'progress' | 'glint';

export const CELEBRATIONS: { id: Celebration; label: string }[] = [
  { id: 'seal', label: 'Seal' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'sparkle', label: 'Sparkle' },
  { id: 'progress', label: 'Progress' },
  { id: 'glint', label: 'Glint' },
];

export function Rise({
  delay,
  duration = 0.9,
  className,
  children,
}: {
  delay: number;
  duration?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduceMotion ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }
      }
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration, delay: reduceMotion ? 0 : delay, ease: RISE }}
    >
      {children}
    </motion.div>
  );
}

export function CelebrationBloom() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -top-[170px] -left-[150px] size-[520px] rounded-full lg:-top-[190px] lg:-left-[180px] lg:size-[640px]"
      style={{
        background:
          'radial-gradient(closest-side, rgba(74,137,232,0.22), rgba(158,195,247,0.12) 45%, rgba(199,221,251,0) 72%)',
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.45 }}
      animate={
        reduceMotion
          ? { opacity: 0.55, scale: 1 }
          : { opacity: [0, 1, 0.55], scale: [0.45, 1, 1.08] }
      }
      transition={{
        duration: reduceMotion ? 0 : 2.4,
        delay: reduceMotion ? 0 : 0.2,
        times: [0, 0.4, 1],
        ease: RISE,
      }}
    />
  );
}

export function CelebrationMark({ celebration }: { celebration: Celebration }) {
  const reduceMotion = useReducedMotion();

  if (celebration === 'progress' && !reduceMotion) return <ProgressSeal />;

  return (
    <div className="relative size-11 shrink-0">
      {celebration === 'confetti' && !reduceMotion ? <SealGlow /> : null}
      <CompletionSeal
        accent={
          celebration === 'seal'
            ? 'ripples'
            : celebration === 'confetti'
              ? 'none'
              : 'ring'
        }
      />
      {reduceMotion ? null : celebration === 'confetti' ? (
        <Confetti />
      ) : celebration === 'sparkle' ? (
        <Sparkles sparkles={SEAL_SPARKLES} className="top-1/2 left-1/2" />
      ) : null}
    </div>
  );
}

export function CelebrationHeadline({
  celebration,
  children,
  ending,
}: {
  celebration: Celebration;
  children: ReactNode;
  ending: string;
}) {
  const reduceMotion = useReducedMotion();
  const className =
    'font-serif text-[30px] leading-9 font-semibold tracking-[-0.4px] text-pretty lg:text-[40px] lg:leading-12';

  if (celebration === 'glint' && !reduceMotion) {
    return (
      <motion.h1
        className={`${className} bg-clip-text text-transparent`}
        style={{
          backgroundImage: `linear-gradient(105deg, ${INK} 0%, ${INK} 40%, ${BLUE} 48%, #9ec3f7 50%, ${BLUE} 52%, ${INK} 60%, ${INK} 100%)`,
          backgroundSize: '300% 100%',
        }}
        initial={{ backgroundPosition: '100% 0%' }}
        animate={{ backgroundPosition: '0% 0%' }}
        transition={{ duration: 1.6, delay: 0.95, ease: SWEEP }}
      >
        {children}
        {ending}
      </motion.h1>
    );
  }

  return (
    <h1 className={className}>
      {children}
      <span className="relative">
        {ending}
        {celebration === 'sparkle' && !reduceMotion ? (
          <Sparkles sparkles={HEADLINE_SPARKLES} className="top-1/2 left-full" />
        ) : null}
      </span>
    </h1>
  );
}

function CompletionSeal({ accent }: { accent: 'ripples' | 'ring' | 'none' }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="-18 -18 36 36"
      aria-hidden
      className="relative size-full overflow-visible"
    >
      {reduceMotion ? null : accent === 'ripples' ? (
        <SealRipples />
      ) : accent === 'ring' ? (
        <SealRing delay={0.5} />
      ) : null}
      <motion.circle
        r="15"
        fill={INK}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.55,
          delay: reduceMotion ? 0 : 0.1,
          ease: POP,
        }}
      />
      <Check delay={0.35} />
    </svg>
  );
}

function Check({ delay }: { delay: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.path
      d="M-6 0.8L-1.8 5 6.4-4"
      fill="none"
      stroke="#fff"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={
        reduceMotion ? false : { opacity: 0, scale: 0.5, filter: 'blur(2px)' }
      }
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{
        duration: reduceMotion ? 0 : 0.5,
        delay: reduceMotion ? 0 : delay,
        ease: POP,
      }}
    />
  );
}

const RIPPLES = [0, 1, 2];

function SealRipples() {
  return (
    <g>
      {RIPPLES.map((index) => (
        <motion.circle
          key={index}
          r="15"
          fill={BLUE}
          fillOpacity={0.14}
          stroke={BLUE}
          strokeOpacity={0.35}
          strokeWidth={1 - index * 0.2}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0, 1, 0], scale: [1, 1.15, 3.6 - index * 0.5] }}
          transition={{
            duration: 1.8,
            delay: 0.4 + index * 0.28,
            times: [0, 0.08, 1],
            ease: RISE,
          }}
        />
      ))}
    </g>
  );
}

function SealRing({ delay }: { delay: number }) {
  return (
    <motion.circle
      r="15"
      fill="none"
      stroke={BLUE}
      strokeWidth="1.5"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: [0, 0.6, 0], scale: [1, 1, 3] }}
      transition={{ duration: 1.1, delay, times: [0, 0.01, 1], ease: RISE }}
    />
  );
}

function SealGlow() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-1/2 rounded-full"
      style={{
        background:
          'radial-gradient(closest-side, rgba(74,137,232,0.45), rgba(158,195,247,0.25) 55%, rgba(199,221,251,0))',
      }}
      initial={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }}
      animate={{
        opacity: [0, 1, 0.4],
        scale: [0.6, 3.4, 4.2],
        filter: ['blur(4px)', 'blur(14px)', 'blur(22px)'],
      }}
      transition={{ duration: 2, delay: 0.4, times: [0, 0.35, 1], ease: RISE }}
    />
  );
}

function ProgressSeal() {
  return (
    <div className="relative flex h-11 shrink-0 items-center">
      <motion.div
        className="relative overflow-hidden rounded-full bg-[#0d0d0d]/12"
        initial={{ width: 112, height: 6 }}
        animate={{ width: [112, 112, 44], height: [6, 6, 44] }}
        transition={{ duration: 0.6, delay: 0.85, times: [0, 0.01, 1], ease: RISE }}
      >
        <motion.span
          className="absolute inset-0 origin-left bg-[#0d0d0d]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: SWEEP }}
        />
      </motion.div>
      <svg
        viewBox="-18 -18 36 36"
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 size-11 overflow-visible"
      >
        <g transform="scale(1.2)">
          <motion.path
            d="M-6 0.8L-1.8 5 6.4-4"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.35, ease: 'easeOut' }}
          />
        </g>
        <SealRing delay={1.3} />
      </svg>
    </div>
  );
}

const CONFETTI_COLORS = [BLUE, '#9ec3f7', INK, '#c7ddfb', '#2f6fd1'];

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = ((-62 + (seeded(index, 1) - 0.5) * 150) * Math.PI) / 180;
  const speed = 70 + seeded(index, 2) * 100;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  return {
    peak: { x: vx * 0.7, y: vy * 0.8 },
    end: {
      x: vx * 1.15 + (seeded(index, 3) - 0.5) * 50,
      y: vy * 0.3 + 120 + seeded(index, 4) * 80,
    },
    rotate: (seeded(index, 5) - 0.5) * 900,
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    dot: index % 4 === 0,
    delay: 0.5 + seeded(index, 6) * 0.08,
    duration: 1.7 + seeded(index, 7) * 0.7,
  };
});

function Confetti() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-1/2 size-0"
    >
      {CONFETTI.map((piece, index) => (
        <motion.span
          key={index}
          className={
            piece.dot
              ? 'absolute -top-[2.5px] -left-[2.5px] size-[5px] rounded-full'
              : 'absolute -top-1 -left-[2px] h-2 w-1 rounded-[1px]'
          }
          style={{ backgroundColor: piece.color }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scaleY: 1 }}
          animate={{
            x: [0, piece.peak.x, piece.end.x],
            y: [0, piece.peak.y, piece.end.y],
            opacity: [0, 1, 1, 0],
            rotate: [0, piece.rotate * 0.4, piece.rotate],
            scaleY: piece.dot ? 1 : [1, 0.25, 1, 0.25, 1],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            times: [0, 0.28, 1],
            x: { duration: piece.duration, delay: piece.delay, times: [0, 0.28, 1], ease: ['easeOut', 'linear'] },
            y: { duration: piece.duration, delay: piece.delay, times: [0, 0.28, 1], ease: ['easeOut', 'easeIn'] },
            opacity: { duration: piece.duration, delay: piece.delay, times: [0, 0.05, 0.7, 1] },
            scaleY: { duration: piece.duration, delay: piece.delay, ease: 'linear' },
          }}
        />
      ))}
    </div>
  );
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}

const SEAL_SPARKLES: Sparkle[] = [
  { x: 28, y: -22, size: 14, delay: 0.7, color: BLUE },
  { x: 36, y: 4, size: 8, delay: 0.85, color: '#9ec3f7' },
  { x: -24, y: -18, size: 9, delay: 0.95, color: BLUE },
];

const HEADLINE_SPARKLES: Sparkle[] = [
  { x: 8, y: -22, size: 16, delay: 1.15, color: BLUE },
  { x: 26, y: -4, size: 9, delay: 1.3, color: '#9ec3f7' },
];

function Sparkles({
  sparkles,
  className,
}: {
  sparkles: Sparkle[];
  className: string;
}) {
  return (
    <span aria-hidden className={`pointer-events-none absolute ${className}`}>
      {sparkles.map((sparkle, index) => (
        <motion.svg
          key={index}
          viewBox="-6 -6 12 12"
          className="absolute"
          style={{
            left: sparkle.x - sparkle.size / 2,
            top: sparkle.y - sparkle.size / 2,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{
            scale: [0, 1, 0.85, 0],
            rotate: [-45, 0, 20, 45],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.8,
            delay: sparkle.delay,
            times: [0, 0.3, 0.7, 1],
            ease: RISE,
          }}
        >
          <path
            d="M0-6C.5-1.8 1.8-.5 6 0 1.8.5.5 1.8 0 6-.5 1.8-1.8.5-6 0-1.8-.5-.5-1.8 0-6Z"
            fill={sparkle.color}
          />
        </motion.svg>
      ))}
    </span>
  );
}
