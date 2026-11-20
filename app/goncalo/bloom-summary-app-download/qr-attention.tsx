'use client';

import { motion, useReducedMotion } from 'motion/react';

const START = 1.9;

export function QrCode({ src }: { src: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative size-36 shrink-0">
      <QrImage src={src} />
      {reduceMotion ? null : <Shimmer src={src} />}
    </div>
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

function Shimmer({ src }: { src: string }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        maskImage: `url(${src})`,
        maskSize: '100% 100%',
        backgroundImage:
          'linear-gradient(115deg, transparent 30%, rgba(175,123,223,0.25) 40%, rgba(223,202,242,0.6) 50%, rgba(175,123,223,0.25) 60%, transparent 70%)',
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
