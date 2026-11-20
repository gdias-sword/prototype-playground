'use client';

import { cn } from '@/design/utils';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { Rise } from './celebration';

const SWORD_GRADIENT =
  'linear-gradient(120deg, #af7bdf 0%, #be95e5 50%, #cddff8 100%)';

const FOIL =
  'linear-gradient(115deg, rgba(255,255,255,0) 16%, rgba(175,123,223,0.42) 34%, rgba(190,149,229,0.48) 46%, rgba(255,182,214,0.36) 56%, rgba(243,233,251,0.55) 66%, rgba(205,223,248,0.42) 76%, rgba(255,255,255,0) 88%)';

const ringMask = {
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMaskComposite: 'xor',
} as const;

export interface KitStep {
  lead: string;
  emphasis: string;
  image: string | { src: string };
  slotClassName: string;
  textClassName: string;
}

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const drift = {
  backgroundPosition: ['0% 42%', '100% 58%', '0% 42%'],
};

function GradientNumber({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'flex size-[6.667cqw] shrink-0 items-center justify-center rounded-full text-[3.3333cqw] leading-[4.5833cqw] font-semibold tracking-[0.0417cqw] text-white tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0.833cqw_2.5cqw_rgba(175,123,223,0.5)]',
        className,
      )}
      style={{ backgroundImage: SWORD_GRADIENT }}
    >
      {children}
    </span>
  );
}

function KitText({ step }: { step: KitStep }) {
  return (
    <p className={step.textClassName}>
      <span className="font-normal">{step.lead}</span>
      <br />
      <span className="font-semibold">{step.emphasis}</span>
    </p>
  );
}

export function CardWash({ strong = false }: { strong?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0',
        strong ? 'opacity-40' : 'opacity-[0.16]',
      )}
      style={{
        backgroundImage: FOIL,
        backgroundSize: '260% 260%',
      }}
      animate={reduceMotion ? undefined : drift}
      transition={{
        duration: strong ? 16 : 22,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function KitImage({ step, float = false }: { step: KitStep; float?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={cn(
        'pointer-events-none absolute overflow-hidden',
        step.slotClassName,
      )}
      animate={
        float && !reduceMotion ? { y: ['0cqw', '-1.15cqw', '0cqw'] } : undefined
      }
      transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <img
        alt=""
        src={assetSrc(step.image)}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full max-w-none object-cover select-none"
      />
    </motion.span>
  );
}

export function KitCard({ step, index }: { step: KitStep; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate size-full rounded-[3.333cqw]">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-[0.313cqw] -z-10 rounded-[3.646cqw] p-[0.313cqw]"
        style={{
          ...ringMask,
          backgroundImage:
            'linear-gradient(115deg, #af7bdf, #be95e5, #f2b6e4, #f3e9fb, #cddff8, #af7bdf)',
          backgroundSize: '280% 280%',
        }}
        animate={reduceMotion ? undefined : drift}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] bg-white pl-[3.333cqw] shadow-[0_4cqw_8cqw_-3cqw_rgba(175,123,223,0.28)]">
        <CardWash strong />
        <GradientNumber className="relative">{index + 1}</GradientNumber>
        <div className="relative min-w-0 flex-1">
          <KitText step={step} />
        </div>
        <KitImage step={step} float />
      </div>
    </div>
  );
}

export function KitHero({
  kit,
  number,
  delay,
  duration,
}: {
  kit: KitStep;
  number: number;
  delay: number;
  duration: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Rise delay={delay} duration={duration}>
      <div className="relative isolate aspect-[480/200] w-full rounded-[3.333cqw]">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-[0.313cqw] -z-10 rounded-[3.646cqw] p-[0.313cqw]"
          style={{
            ...ringMask,
            backgroundImage:
              'linear-gradient(115deg, #af7bdf, #be95e5, #f2b6e4, #f3e9fb, #cddff8, #af7bdf)',
            backgroundSize: '280% 280%',
          }}
          animate={reduceMotion ? undefined : drift}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-white shadow-[0_4cqw_8cqw_-3cqw_rgba(175,123,223,0.28)]">
          <CardWash strong />
          <span
            aria-hidden
            className="pointer-events-none absolute right-[-4cqw] bottom-[8%] h-[5cqw] w-[36cqw] rounded-[50%] bg-[#0d0d0d]/16 blur-[2.5cqw]"
          />
          <motion.img
            alt=""
            src={assetSrc(kit.image)}
            draggable={false}
            className="pointer-events-none absolute top-[calc(50%+12.92cqw)] right-[-15cqw] h-[50cqw] w-[66.667cqw] max-w-none -translate-y-1/2 object-cover object-[center_22%] select-none"
            animate={
              reduceMotion ? undefined : { y: ['0cqw', '-1.35cqw', '0cqw'] }
            }
            transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex h-full flex-col justify-between p-[5cqw]">
            <GradientNumber>{number}</GradientNumber>
            <p className="w-[58%] text-[5cqw] leading-[6.667cqw] text-[#0d0d0d]">
              {kit.lead}
              <br />
              <span className="font-semibold">{kit.emphasis}</span>
            </p>
          </div>
        </div>
      </div>
    </Rise>
  );
}
