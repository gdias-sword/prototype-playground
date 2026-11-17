'use client';

import { cn } from '@/design/utils';
import loginCard from './assets/login-card.png';
import meshGradient from './assets/thrive-mesh-gradient-01.png';
import programCard from './assets/program-card.png';
import welcomeKitCard from './assets/welcome-kit-card.png';
import { Rise } from './celebration';
import { CardWash, KitCard, KitHero, useKitVariant } from './kit-emphasis';

const CARD_ENTER = 1;
const CARD_STAGGER = 0.15;
const CARD_DURATION = 0.75;

const PROGRAM_SLOT = 'h-[49.167cqw] w-[46.667cqw]';
const KIT_SLOT = 'h-[35cqw] w-[46.667cqw]';

const LOGIN_LEAD =
  'min-w-0 flex-1 text-[4.1667cqw] leading-[5.8333cqw] text-[#0d0d0d]';
const LOGIN_BODY =
  'min-w-0 flex-1 text-[4.5833cqw] leading-[5.8333cqw] text-[#0d0d0d]';
const LOGIN_KIT =
  'min-w-0 flex-1 text-[4.5833cqw] leading-[5.8333cqw] tracking-[0.0417cqw] text-[#0d0d0d]';

interface Step {
  lead: string;
  emphasis: string;
  image: string | { src: string };
  slotClassName: string;
  padClassName: string;
  textClassName: string;
  beam?: boolean;
}

const STEPS: Step[] = [
  {
    lead: 'Log in to the',
    emphasis: 'Sword Health app',
    image: loginCard,
    slotClassName: 'top-[-1.667cqw] left-[57.083cqw] size-[54.167cqw]',
    padClassName: 'pl-[4.167cqw]',
    textClassName: LOGIN_LEAD,
  },
  {
    lead: 'Unlock your',
    emphasis: 'personalized program',
    image: programCard,
    slotClassName: cn('top-[-5cqw] left-[66.25cqw]', PROGRAM_SLOT),
    padClassName: 'pl-[4.167cqw]',
    textClassName: LOGIN_BODY,
  },
  {
    lead: 'Claim your',
    emphasis: 'free welcome kit',
    image: welcomeKitCard,
    slotClassName: cn('top-[-3.125cqw] left-[61.042cqw]', KIT_SLOT),
    padClassName: 'pl-[3.333cqw]',
    textClassName: LOGIN_KIT,
    beam: true,
  },
];

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function OnboardingWash() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 lg:hidden"
    >
      <Mesh />
    </div>
  );
}

export function OnboardingMobileStage() {
  return (
    <div className="pt-2 lg:hidden">
      <Steps />
    </div>
  );
}

export function OnboardingMedia() {
  return (
    <aside
      aria-label="Your program and welcome kit are waiting inside"
      className="absolute inset-y-0 right-0 z-3 hidden w-[42.66%] items-center justify-center overflow-hidden bg-linear-to-b from-white to-[#c7ddfb] px-10 py-12 lg:flex"
    >
      <Mesh />
      <div className="relative z-1 w-full max-w-[480px]">
        <Steps />
      </div>
    </aside>
  );
}

function Mesh() {
  return (
    <img
      alt=""
      src={assetSrc(meshGradient)}
      className="pointer-events-none absolute top-[-19.8%] left-1/2 h-[139.6%] w-auto max-w-none -translate-x-1/2 opacity-80"
    />
  );
}

function Steps() {
  const variant = useKitVariant();

  return (
    <div className="@container mx-auto flex w-full max-w-[480px] flex-col gap-6">
      <Rise delay={0.85}>
        <p className="text-[16px] leading-6 tracking-[0.2px] text-pretty text-foreground-neutral-faded">
          Your program and welcome kit are waiting inside.
        </p>
      </Rise>
      <ol className="flex w-full flex-col gap-[5cqw]">
        {(variant === 'B' ? STEPS.slice(0, -1) : STEPS).map((step, index) => (
          <li key={step.emphasis} className="aspect-[480/122] w-full">
            <Rise
              delay={CARD_ENTER + index * CARD_STAGGER}
              duration={CARD_DURATION}
              className="relative isolate size-full rounded-[3.333cqw]"
            >
              {step.beam && variant === 'A' ? (
                <KitCard step={step} index={index} />
              ) : (
                <StepCard step={step} index={index} />
              )}
            </Rise>
          </li>
        ))}
        {variant === 'B' ? (
          <li>
            <KitHero
              kit={STEPS[STEPS.length - 1]}
              number={STEPS.length}
              delay={CARD_ENTER + (STEPS.length - 1) * CARD_STAGGER}
              duration={CARD_DURATION}
            />
          </li>
        ) : null}
      </ol>
    </div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] border border-white',
        step.padClassName,
      )}
      style={{
        backgroundImage:
          'linear-gradient(138.409deg, rgba(255,255,255,0.8) 27.739%, rgba(255,255,255,0.64) 72.261%)',
      }}
    >
      <CardWash />
      <span className="relative flex size-[6.667cqw] shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] text-[3.3333cqw] leading-[4.5833cqw] font-semibold tracking-[0.0417cqw] text-white tabular-nums">
        {index + 1}
      </span>
      <p className={cn('relative', step.textClassName)}>
        <span className="font-normal">{step.lead}</span>
        <br />
        <span className="font-semibold">{step.emphasis}</span>
      </p>
      <CardImage step={step} />
    </div>
  );
}

function CardImage({ step }: { step: Step }) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute overflow-hidden',
        step.slotClassName,
      )}
    >
      <img
        alt=""
        src={assetSrc(step.image)}
        draggable={false}
        className="pointer-events-none absolute inset-0 size-full max-w-none object-cover select-none"
      />
    </span>
  );
}

