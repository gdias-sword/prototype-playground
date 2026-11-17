'use client';

// Variants — what each take disagrees about to make the welcome kit read as the reward:
// A — Current: same light card as steps 1–2, emphasis lives only in a thin blue beam.
// B — Gradient ring: same layout, emphasis moves to colour — Thrive gradient number,
//     rotating gradient border, and a coloured halo that spills onto the panel.
// C — Dark reward card: emphasis by contrast — the only ink surface on a light page,
//     with a drifting aurora behind the box and a periodic sheen.
// D — Holo foil: emphasis by behaviour — a collectible-card surface that tilts and
//     catches an iridescent glare (pointer-driven, idles on its own on touch).
// E — Reward finale: emphasis by hierarchy — steps 1–2 collapse into a slim checklist,
//     the kit becomes the panel's hero destination.
// F — Reward finale, full steps: E's hero kit card, but steps 1–2 keep their
//     original cards and imagery.

import { VariantSwitcher } from '@/components/variant-switcher';
import { cn } from '@/design/utils';
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from 'motion/react';
import {
  createContext,
  type ComponentProps,
  useContext,
  useEffect,
  useRef,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Rise } from './celebration';

// Sword Health primary gradient (gradient/primary/stop-1..3) and Thrive primary stops
// (#f2f2f2 → #ffe8d6 → #5993ea) from Phoenix DS core tokens.
export const SWORD_GRADIENT =
  'linear-gradient(135deg, #ff7e7e 0.17%, #be95e5 50%, #4a89e8 99.83%)';

const SWORD_CONIC =
  'conic-gradient(from var(--beam-angle), #ff7e7e, #be95e5, #4a89e8, #be95e5, #ff7e7e)';

const ringMask = {
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMaskComposite: 'xor',
} as const;

const VARIANTS = [
  { id: 'A', label: 'Current border beam' },
  { id: 'B', label: 'Gradient ring and halo' },
  { id: 'C', label: 'Dark reward card' },
  { id: 'D', label: 'Holo foil tilt' },
  { id: 'E', label: 'Reward finale' },
  { id: 'F', label: 'Reward finale, full steps' },
];

const KitVariantContext = createContext('A');

export function KitEmphasis({ children }: { children: ReactNode }) {
  return (
    <VariantSwitcher variants={VARIANTS} caption="Kit">
      {(variant) => (
        <KitVariantContext.Provider value={variant}>
          {children}
        </KitVariantContext.Provider>
      )}
    </VariantSwitcher>
  );
}

export function useKitVariant() {
  return useContext(KitVariantContext);
}

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
        'flex size-[6.667cqw] shrink-0 items-center justify-center rounded-full text-[3.3333cqw] leading-[4.5833cqw] font-semibold tracking-[0.0417cqw] text-white tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0.833cqw_2.5cqw_rgba(190,149,229,0.5)]',
        className,
      )}
      style={{ backgroundImage: SWORD_GRADIENT }}
    >
      {children}
    </span>
  );
}

function KitText({ step, inverse }: { step: KitStep; inverse?: boolean }) {
  return (
    <p className={cn(step.textClassName, inverse && 'text-white')}>
      <span className={cn('font-normal', inverse && 'text-white/64')}>
        {step.lead}
      </span>
      <br />
      <span className="font-semibold">{step.emphasis}</span>
    </p>
  );
}

function KitImage({
  step,
  style,
}: {
  step: KitStep;
  style?: ComponentProps<typeof motion.span>['style'];
}) {
  return (
    <motion.span
      aria-hidden
      className={cn(
        'pointer-events-none absolute overflow-hidden',
        step.slotClassName,
      )}
      style={style}
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

export function KitCard({
  variant,
  step,
  index,
}: {
  variant: string;
  step: KitStep;
  index: number;
}) {
  if (variant === 'B') return <GradientRingCard step={step} index={index} />;
  if (variant === 'C') return <DarkRewardCard step={step} index={index} />;
  return <HoloFoilCard step={step} index={index} />;
}

function GradientRingCard({ step, index }: { step: KitStep; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative isolate size-full rounded-[3.333cqw]">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -inset-x-[4cqw] -inset-y-[3.333cqw] -z-20 rounded-[8cqw] blur-[5.833cqw]"
        style={{ backgroundImage: SWORD_GRADIENT }}
        initial={{ opacity: 0.8 }}
        animate={reduceMotion ? undefined : { opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-[0.625cqw] -z-10 rounded-[3.958cqw] p-[0.625cqw] motion-safe:animate-[border-beam_6s_linear_infinite]"
        style={{ ...ringMask, background: SWORD_CONIC }}
      />
      <div className="absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] bg-white/92 pl-[3.333cqw]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-3/5"
          style={{
            background:
              'radial-gradient(closest-side at 62% 58%, rgba(255,126,126,0.26), rgba(190,149,229,0.16) 55%, rgba(190,149,229,0) 100%)',
          }}
        />
        <GradientNumber>{index + 1}</GradientNumber>
        <KitText step={step} />
        <KitImage step={step} />
      </div>
    </div>
  );
}

function DarkRewardCard({ step, index }: { step: KitStep; index: number }) {
  const reduceMotion = useReducedMotion();
  const drift = (x: number[], y: number[], duration: number) =>
    reduceMotion
      ? {}
      : {
          animate: { x, y },
          transition: {
            duration,
            repeat: Infinity,
            repeatType: 'mirror' as const,
            ease: 'easeInOut' as const,
          },
        };

  return (
    <div className="relative isolate size-full rounded-[3.333cqw] shadow-[0_5cqw_10cqw_-4cqw_rgba(74,137,232,0.45)]">
      <div className="absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] bg-[#0d0d0d] pl-[3.333cqw] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[-20%] right-[18%] size-[36cqw] rounded-full bg-[#4a89e8] opacity-70 blur-[8cqw]"
          {...drift([0, -24, 10], [0, 14, -8], 9)}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute right-[-6%] bottom-[-40%] size-[34cqw] rounded-full bg-[#ff7e7e] opacity-70 blur-[8cqw]"
          {...drift([0, -18, 6], [0, -12, 6], 11)}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[10%] right-[2%] size-[22cqw] rounded-full bg-[#be95e5] opacity-80 blur-[6cqw]"
          {...drift([0, 16, -10], [0, 10, -6], 7)}
        />
        {reduceMotion ? null : (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))',
            }}
            initial={{ x: '-120%' }}
            animate={{ x: '360%' }}
            transition={{
              duration: 1.6,
              delay: 2,
              repeat: Infinity,
              repeatDelay: 4.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/10"
        />
        <GradientNumber className="relative">{index + 1}</GradientNumber>
        <div className="relative min-w-0 flex-1">
          <KitText step={step} inverse />
        </div>
        <KitImage step={step} />
      </div>
    </div>
  );
}

function HoloFoilCard({ step, index }: { step: KitStep; index: number }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.3);
  const pointerY = useMotionValue(0.4);
  const idle = useRef<AnimationPlaybackControls[]>([]);
  const spring = { stiffness: 160, damping: 18, mass: 0.6 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [6, -6]), spring);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-8, 8]), spring);
  const foilX = useTransform(pointerX, (value) => value * 100);
  const foilY = useTransform(pointerY, (value) => value * 100);
  const foilPosition = useMotionTemplate`${foilX}% ${foilY}%`;
  const glare = useMotionTemplate`radial-gradient(circle at ${foilX}% ${foilY}%, rgba(255,255,255,0.75), rgba(255,255,255,0) 45%)`;
  const imageX = useTransform(pointerX, [0, 1], [-6, 6]);
  const imageY = useTransform(pointerY, [0, 1], [-3, 3]);

  function startIdle() {
    if (reduceMotion) return;
    idle.current = [
      animate(pointerX, [0.15, 0.85], {
        duration: 3.6,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }),
      animate(pointerY, [0.3, 0.7], {
        duration: 2.7,
        repeat: Infinity,
        repeatType: 'mirror',
        ease: 'easeInOut',
      }),
    ];
  }

  function stopIdle() {
    idle.current.forEach((controls) => controls.stop());
  }

  useEffect(() => {
    startIdle();
    return stopIdle;
  }, [reduceMotion]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  return (
    <div
      className="relative size-full perspective-[900px]"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') stopIdle();
      }}
      onPointerMove={(event) => {
        if (event.pointerType === 'mouse') handlePointerMove(event);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') startIdle();
      }}
    >
      <motion.div
        className="relative isolate size-full rounded-[3.333cqw] shadow-[0_4cqw_8cqw_-3cqw_rgba(74,137,232,0.35)]"
        style={reduceMotion ? undefined : { rotateX, rotateY }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-[0.417cqw] -z-10 rounded-[3.75cqw] p-[0.417cqw]"
          style={{
            ...ringMask,
            backgroundImage:
              'linear-gradient(115deg, #4a89e8, #be95e5, #ff7e7e, #ffe8d6, #b5d8ff, #4a89e8, #be95e5)',
            backgroundSize: '300% 300%',
            backgroundPosition: foilPosition,
          }}
        />
        <div className="absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] bg-white pl-[3.333cqw]">
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-55"
            style={{
              backgroundImage:
                'linear-gradient(115deg, rgba(255,255,255,0) 20%, rgba(74,137,232,0.45) 34%, rgba(190,149,229,0.5) 42%, rgba(255,126,126,0.45) 50%, rgba(255,232,214,0.6) 57%, rgba(181,216,255,0.55) 64%, rgba(255,255,255,0) 78%)',
              backgroundSize: '260% 260%',
              backgroundPosition: foilPosition,
            }}
          />
          <GradientNumber className="relative">{index + 1}</GradientNumber>
          <div className="relative min-w-0 flex-1">
            <KitText step={step} />
          </div>
          <KitImage
            step={step}
            style={reduceMotion ? undefined : { x: imageX, y: imageY }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ backgroundImage: glare }}
          />
        </div>
      </motion.div>
    </div>
  );
}

const SPARKLES = [
  { className: 'top-[18%] right-[10%] size-[3.333cqw]', delay: 0 },
  { className: 'top-[46%] right-[46%] size-[2.083cqw]', delay: 1.1 },
  { className: 'right-[6%] bottom-[30%] size-[2.5cqw]', delay: 2.2 },
];

export function RewardFinale({
  steps,
  delay,
  stagger,
  duration,
}: {
  steps: KitStep[];
  delay: number;
  stagger: number;
  duration: number;
}) {
  const kit = steps[steps.length - 1];
  const tasks = steps.slice(0, -1);

  return (
    <div className="flex w-full flex-col gap-[3.333cqw]">
      <Rise delay={delay} duration={duration}>
        <ol className="flex flex-col rounded-[3.333cqw] border border-white bg-white/72 px-[4.167cqw] backdrop-blur-md">
          {tasks.map((step, index) => (
            <li
              key={step.emphasis}
              className="flex items-center gap-[3.333cqw] border-black/6 py-[3.333cqw] not-first:border-t"
            >
              <span className="flex size-[5.833cqw] shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] text-[2.917cqw] leading-none font-semibold text-white tabular-nums">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 text-[3.75cqw] leading-[5cqw] text-[#0d0d0d]">
                {step.lead}{' '}
                <span className="font-semibold">{step.emphasis}</span>
              </p>
            </li>
          ))}
        </ol>
      </Rise>
      <RewardHero
        kit={kit}
        number={steps.length}
        delay={delay + stagger}
        duration={duration}
      />
    </div>
  );
}

export function RewardHero({
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
      <div
        className="relative isolate aspect-[480/290] w-full overflow-hidden rounded-[5cqw] border border-white shadow-[0_5cqw_10cqw_-4cqw_rgba(74,137,232,0.35)]"
        style={{
          background:
            'linear-gradient(160deg, #ffffff 0%, #ffe8d6 58%, #c8dbf8 100%)',
        }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-[2%] right-[-14%] size-[78cqw] rounded-full blur-[4cqw]"
          style={{
            background:
              'radial-gradient(closest-side, rgba(190,149,229,0.5), rgba(255,126,126,0.28) 50%, rgba(255,126,126,0) 100%)',
          }}
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-[8%] bottom-[9%] h-[5cqw] w-[44cqw] rounded-[50%] bg-[#0d0d0d]/20 blur-[2.5cqw]"
        />
        <motion.img
          alt=""
          src={assetSrc(kit.image)}
          draggable={false}
          className="pointer-events-none absolute right-[-3%] bottom-[2%] w-[62cqw] max-w-none select-none"
          initial={reduceMotion ? false : { y: 16, rotate: -4, scale: 0.92 }}
          animate={{ y: 0, rotate: 0, scale: 1 }}
          transition={{
            duration: 1.1,
            delay: delay + 0.2,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        />
        {reduceMotion
          ? null
          : SPARKLES.map((sparkle) => (
              <motion.svg
                key={sparkle.className}
                aria-hidden
                viewBox="0 0 24 24"
                className={cn(
                  'pointer-events-none absolute',
                  sparkle.className,
                )}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
                transition={{
                  duration: 2.2,
                  delay: delay + 0.8 + sparkle.delay,
                  repeat: Infinity,
                  repeatDelay: 1.4,
                  ease: 'easeOut',
                }}
              >
                <path
                  d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"
                  fill="#ffffff"
                />
              </motion.svg>
            ))}
        <div className="relative flex h-full w-[62%] flex-col justify-between p-[5cqw]">
          <span className="flex items-center gap-[2.083cqw]">
            <GradientNumber>{number}</GradientNumber>
            <span
              className="bg-clip-text text-[2.917cqw] leading-none font-semibold tracking-[0.25cqw] text-transparent uppercase"
              style={{ backgroundImage: SWORD_GRADIENT }}
            >
              Your reward
            </span>
          </span>
          <p className="text-[5.833cqw] leading-[7.083cqw] tracking-[-0.05cqw] text-[#0d0d0d]">
            {kit.lead}
            <br />
            <span className="font-semibold">{kit.emphasis}</span>
          </p>
        </div>
      </div>
    </Rise>
  );
}
