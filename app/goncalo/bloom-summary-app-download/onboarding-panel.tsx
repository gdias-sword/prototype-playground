'use client';

import { cn } from '@/design/utils';
import loginCard from './assets/login-card.png';
import mesh from './assets/mesh.png';
import programCard from './assets/program-card.png';
import welcomeKit from './assets/welcome-kit.png';
import { Rise } from './celebration';
import { CardWash, KitCard, KitHero } from './kit-emphasis';

const CARD_ENTER = 1.2;
const CARD_STAGGER = 0.2;
const CARD_DURATION = 0.8;

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
  compactSlot: string;
  largeSlot: string;
  imageClassName: string;
  padClassName: string;
  textClassName: string;
  beam?: boolean;
}

const STEPS: Step[] = [
  {
    lead: 'Log in to the',
    emphasis: 'Sword Health app',
    image: loginCard,
    compactSlot: 'bottom-[-30.3cqw] right-[-14.7cqw] size-[59.6cqw]',
    largeSlot: 'bottom-[-27.5cqw] right-[-11.67cqw] size-[54.17cqw]',
    imageClassName: 'inset-0 size-full max-w-none object-cover object-[center_6%]',
    padClassName: 'pl-[4.167cqw]',
    textClassName: LOGIN_LEAD,
  },
  {
    lead: 'Unlock your',
    emphasis: 'personalized program',
    image: programCard,
    compactSlot: 'top-[-20cqw] right-[-16cqw] h-[58cqw] w-[55cqw]',
    largeSlot: 'top-[-14.4cqw] left-[62cqw] h-[49.17cqw] w-[46.67cqw]',
    imageClassName:
      'inset-0 size-full max-w-none object-cover object-[58%_center]',
    padClassName: 'pl-[4.167cqw]',
    textClassName: LOGIN_BODY,
  },
  {
    lead: 'Claim your',
    emphasis: 'free welcome kit',
    image: welcomeKit,
    compactSlot: 'right-[-7.3cqw] bottom-[-13.5cqw] h-[36.7cqw] w-[48.9cqw]',
    largeSlot: 'top-[-0.2cqw] left-[54.4cqw] h-[50cqw] w-[62.5cqw]',
    imageClassName:
      'inset-0 size-full max-w-none object-cover object-[center_18%]',
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
      <Steps layout="compact" />
    </div>
  );
}

export function OnboardingMedia() {
  return (
    <aside
      aria-label="Here's what comes next"
      className="absolute inset-y-0 right-0 z-3 hidden w-[42.66%] items-center justify-center overflow-hidden bg-linear-to-b from-white to-[#dfcaf2] px-10 py-12 lg:flex"
    >
      <Mesh />
      <div className="relative z-1 w-full max-w-[480px]">
        <Steps layout="large" />
      </div>
    </aside>
  );
}

function Mesh() {
  return (
    <img
      alt=""
      src={assetSrc(mesh)}
      className="pointer-events-none absolute top-[-30.78%] left-[-73.1%] h-[189.84%] w-[285.98%] max-w-none opacity-40"
    />
  );
}

function Steps({ layout }: { layout: 'compact' | 'large' }) {
  const steps = layout === 'large' ? STEPS.slice(0, -1) : STEPS;

  return (
    <div className="@container mx-auto flex w-full max-w-[480px] flex-col gap-6">
      {layout === 'compact' ? (
        <Rise delay={1}>
          <p className="text-[16px] leading-6 tracking-[0.2px] text-pretty text-foreground-neutral-faded">
            Here's what comes next
          </p>
        </Rise>
      ) : null}
      <ol className="flex w-full flex-col gap-[5cqw]">
        {steps.map((step, index) => (
          <li key={step.emphasis} className="aspect-[480/122] w-full">
            <Rise
              delay={CARD_ENTER + index * CARD_STAGGER}
              duration={CARD_DURATION}
              className="relative isolate size-full rounded-[3.333cqw]"
            >
              {step.beam && layout === 'compact' ? (
                <KitCard
                  step={{ ...step, slotClassName: step.compactSlot }}
                  index={index}
                />
              ) : (
                <StepCard step={step} index={index} layout={layout} />
              )}
            </Rise>
          </li>
        ))}
        {layout === 'large' ? (
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

function StepCard({
  step,
  index,
  layout,
}: {
  step: Step;
  index: number;
  layout: 'compact' | 'large';
}) {
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
      <CardImage step={step} layout={layout} />
    </div>
  );
}

function CardImage({
  step,
  layout,
}: {
  step: Step;
  layout: 'compact' | 'large';
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute overflow-hidden',
        layout === 'compact' ? step.compactSlot : step.largeSlot,
      )}
    >
      <img
        alt=""
        src={assetSrc(step.image)}
        draggable={false}
        className={cn(
          'pointer-events-none absolute select-none',
          step.imageClassName,
        )}
      />
    </span>
  );
}
