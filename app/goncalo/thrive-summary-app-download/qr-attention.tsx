'use client';

import { VariantSwitcher } from './switcher';
import { motion, useReducedMotion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BLUE, RISE, SWEEP } from './celebration';

const QR_VARIANTS = [
  { id: 'A', label: 'Shimmer' },
  { id: 'B', label: 'Viewfinder' },
];

const START = 1.9;

export function QrVariantSwitcher() {
  return (
    <div className="hidden lg:block">
      <VariantSwitcher variants={QR_VARIANTS}>{() => null}</VariantSwitcher>
    </div>
  );
}

export function QrCode({ src }: { src: string }) {
  return (
    <Suspense fallback={<QrImage src={src} />}>
      <QrAttention src={src} />
    </Suspense>
  );
}

function QrImage({ src }: { src: string }) {
  return (
    <img
      alt="QR code to download the Sword app"
      src={src}
      className="block size-36 shrink-0"
    />
  );
}

function QrAttention({ src }: { src: string }) {
  const variant = useSearchParams().get('variant');
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative size-36 shrink-0">
      <QrImage src={src} />
      {reduceMotion ? null : variant === 'B' ? (
        <Viewfinder />
      ) : (
        <Shimmer src={src} />
      )}
    </div>
  );
}

function Shimmer({ src }: { src: string }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: `url(${src})`,
        maskSize: '100% 100%',
        backgroundImage:
          'linear-gradient(115deg, transparent 30%, rgba(74,137,232,0.25) 40%, rgba(158,195,247,0.6) 50%, rgba(74,137,232,0.25) 60%, transparent 70%)',
        backgroundSize: '300% 100%',
        backgroundRepeat: 'no-repeat',
      }}
      initial={{ backgroundPosition: '100% 0%' }}
      animate={{ backgroundPosition: '0% 0%' }}
      transition={{
        duration: 2.8,
        delay: START,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 3.5,
      }}
    />
  );
}

const CORNERS = [
  'top-0 left-0 rounded-tl-lg border-t-2 border-l-2',
  'top-0 right-0 rounded-tr-lg border-t-2 border-r-2',
  'bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2',
  'bottom-0 right-0 rounded-br-lg border-r-2 border-b-2',
];

function Corners({ className }: { className: string }) {
  return CORNERS.map((corner) => (
    <span
      key={corner}
      className={`absolute ${className} ${corner}`}
      style={{ borderColor: BLUE }}
    />
  ));
}

function Viewfinder() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-3"
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: START - 0.3, ease: RISE }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{
            duration: 3,
            delay: START + 0.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Corners className="size-6" />
        </motion.div>
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="absolute inset-x-0 -top-10 h-10 bg-linear-to-b from-[#4a89e8]/0 to-[#4a89e8]/20"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, 164], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2,
            delay: START,
            ease: SWEEP,
            repeat: Infinity,
            repeatDelay: 1,
            opacity: {
              duration: 2,
              delay: START,
              repeat: Infinity,
              repeatDelay: 1,
              times: [0, 0.1, 0.8, 1],
            },
          }}
        >
          <span
            className="absolute inset-x-0 bottom-0 h-0.5"
            style={{ backgroundColor: BLUE, boxShadow: `0 0 12px ${BLUE}` }}
          />
        </motion.div>
      </div>
    </>
  );
}
