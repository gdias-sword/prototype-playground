'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const RISE = [0.22, 1, 0.36, 1] as const;
const POP = [0.34, 1.56, 0.64, 1] as const;

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

export function CompletionSeal() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="-18 -18 36 36"
      aria-hidden
      className="size-8 shrink-0 overflow-visible lg:size-9"
    >
      {reduceMotion ? null : <SealBurst />}
      {reduceMotion ? null : <SealRing />}
      <motion.circle
        r="15"
        fill="#0d0d0d"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.55,
          delay: reduceMotion ? 0 : 0.1,
          ease: POP,
        }}
      />
      <motion.path
        d="M-6 0.8L-1.8 5 6.4-4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.4,
          delay: reduceMotion ? 0 : 0.45,
          ease: 'easeOut',
        }}
      />
    </svg>
  );
}

function SealRing() {
  return (
    <motion.circle
      r="15"
      fill="none"
      stroke="#4a89e8"
      strokeWidth="1.5"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={{ opacity: 0.6, scale: 1 }}
      animate={{ opacity: 0, scale: 3 }}
      transition={{ duration: 1.1, delay: 0.5, ease: RISE }}
    />
  );
}

function SealBurst() {
  return (
    <g>
      {Array.from({ length: 10 }, (_, index) => (
        <g key={index} transform={`rotate(${index * 36})`}>
          <motion.line
            x1="24"
            y1="0"
            x2="30"
            y2="0"
            stroke="#4a89e8"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: [0, 1, 0], x: [-5, 2, 9] }}
            transition={{
              duration: 0.9,
              delay: 0.55,
              times: [0, 0.3, 1],
              ease: RISE,
            }}
          />
        </g>
      ))}
    </g>
  );
}
