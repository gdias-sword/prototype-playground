'use client';

import julieScott from '@/design/assets/specialists/julie-scott.png';
import { VariantSwitcher } from './switcher';
import { cn } from '@/design/utils';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import loginCard from './assets/login-card.png';
import meshGradient from './assets/thrive-mesh-gradient-01.png';
import programCard from './assets/program-card.png';
import welcomeKitCard from './assets/welcome-kit-card.png';
import { Rise } from './celebration';

const BORDER_BEAM =
  'conic-gradient(from var(--beam-angle), rgba(74,137,232,0) 0deg, rgba(74,137,232,0) 160deg, #4a89e8 320deg, #4a89e8 360deg, rgba(74,137,232,0) 360deg)';

const borderBeamMask = {
  background: BORDER_BEAM,
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMask:
    'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  WebkitMaskComposite: 'xor',
} as const;

const STEP_VARIANTS = [
  { id: 'default', label: 'Physical Therapist' },
  { id: 'login', label: 'Login' },
];

const CARD_ENTER = 1;
const CARD_STAGGER = 0.15;
const CARD_DURATION = 0.75;

const DEFAULT_GRADIENT =
  'linear-gradient(139.355deg, rgba(255,255,255,0.8) 27.739%, rgba(255,255,255,0.64) 72.261%)';
const LOGIN_GRADIENT =
  'linear-gradient(138.409deg, rgba(255,255,255,0.8) 27.739%, rgba(255,255,255,0.64) 72.261%)';

const PROGRAM_SLOT = 'h-[49.167cqw] w-[46.667cqw]';
const KIT_SLOT = 'h-[37.5cqw] w-[50cqw]';

type StepVariant = 'default' | 'login';

interface Step {
  lead: string;
  emphasis: string;
  image: string | { src: string };
  slotClassName: string;
  imageClassName?: string;
  padClassName: string;
  textClassName: string;
  beam?: boolean;
}

interface StepSet {
  aspectClassName: string;
  gradient: string;
  badgeClassName: string;
  steps: Step[];
}

const COPY =
  'min-w-0 flex-1 text-[4.1667cqw] leading-[5.8333cqw] text-[#0d0d0d]';
const LOGIN_LEAD =
  'min-w-0 flex-1 text-[4.1667cqw] leading-[5.8333cqw] text-[#0d0d0d]';
const LOGIN_BODY =
  'min-w-0 flex-1 text-[4.5833cqw] leading-[5.8333cqw] text-[#0d0d0d]';
const LOGIN_KIT =
  'min-w-0 flex-1 text-[4.5833cqw] leading-[5.8333cqw] tracking-[0.0417cqw] text-[#0d0d0d]';

const STEP_SETS: Record<StepVariant, StepSet> = {
  default: {
    aspectClassName: 'aspect-[480/118]',
    gradient: DEFAULT_GRADIENT,
    badgeClassName:
      'text-[3.3333cqw] leading-[4.5833cqw] tracking-[0.0417cqw]',
    steps: [
      {
        lead: 'Unlock your',
        emphasis: 'personalized program',
        image: programCard,
        slotClassName: cn(
          'top-[-5.833cqw] left-[64.583cqw]',
          PROGRAM_SLOT,
        ),
        padClassName: 'pl-[4.167cqw]',
        textClassName: COPY,
      },
      {
        lead: 'Get access to your',
        emphasis: 'Physical Therapist',
        image: julieScott,
        slotClassName: 'top-[-1.667cqw] left-[67.083cqw] size-[30cqw]',
        imageClassName:
          'top-[-0.95%] left-[-21.951%] h-[121.951%] w-[121.951%] max-w-none object-cover',
        padClassName: 'pl-[3.333cqw]',
        textClassName: COPY,
      },
      {
        lead: 'Claim your',
        emphasis: 'free welcome kit',
        image: welcomeKitCard,
        slotClassName: cn('top-[-0.833cqw] left-[62.917cqw]', KIT_SLOT),
        padClassName: 'pl-[3.333cqw]',
        textClassName: COPY,
        beam: true,
      },
    ],
  },
  login: {
    aspectClassName: 'aspect-[480/122]',
    gradient: LOGIN_GRADIENT,
    badgeClassName:
      'text-[3.3333cqw] leading-[4.5833cqw] tracking-[0.0417cqw]',
    steps: [
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
        slotClassName: cn('top-[-0.417cqw] left-[62.917cqw]', KIT_SLOT),
        padClassName: 'pl-[3.333cqw]',
        textClassName: LOGIN_KIT,
        beam: true,
      },
    ],
  },
};

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function StepsVariantSwitcher() {
  return (
    <VariantSwitcher
      param="steps"
      caption="Steps"
      hotkeys={false}
      className="bottom-[max(88px,calc(env(safe-area-inset-bottom)+72px))] lg:bottom-24"
      variants={STEP_VARIANTS}
    >
      {() => null}
    </VariantSwitcher>
  );
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
      aria-label="What you will do in the Sword Health app"
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
  return (
    <Suspense fallback={<StepList variant="default" />}>
      <StepListFromParams />
    </Suspense>
  );
}

function StepListFromParams() {
  const steps = useSearchParams().get('steps');
  return <StepList variant={steps === 'login' ? 'login' : 'default'} />;
}

function StepList({ variant }: { variant: StepVariant }) {
  const set = STEP_SETS[variant];

  return (
    <div className="@container mx-auto w-full max-w-[480px]">
      <style>{`
        @property --beam-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-beam {
          to { --beam-angle: 360deg; }
        }
      `}</style>
      <ol className="flex w-full flex-col gap-[5cqw]">
        {set.steps.map((step, index) => (
          <li
            key={`${variant}-${step.emphasis}`}
            className={cn('w-full', set.aspectClassName)}
          >
            <Rise
              delay={CARD_ENTER + index * CARD_STAGGER}
              duration={CARD_DURATION}
              className="relative isolate size-full rounded-[3.333cqw]"
            >
              {step.beam ? <BorderBeam /> : null}
              <div
                className={cn(
                  'absolute inset-0 flex items-center gap-[4.167cqw] overflow-hidden rounded-[inherit] border border-white',
                  step.padClassName,
                )}
                style={{ backgroundImage: set.gradient }}
              >
                <span
                  className={cn(
                    'flex size-[6.667cqw] shrink-0 items-center justify-center rounded-full bg-[#0d0d0d] font-semibold text-white tabular-nums',
                    set.badgeClassName,
                  )}
                >
                  {index + 1}
                </span>
                <p className={step.textClassName}>
                  <span className="font-normal">{step.lead}</span>
                  <br />
                  <span className="font-semibold">{step.emphasis}</span>
                </p>
                <CardImage step={step} />
              </div>
            </Rise>
          </li>
        ))}
      </ol>
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
        className={cn(
          'pointer-events-none absolute select-none',
          step.imageClassName ?? 'inset-0 size-full max-w-none object-cover',
        )}
      />
    </span>
  );
}

function BorderBeam() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] p-px opacity-70 blur-[3px] motion-safe:animate-[border-beam_3.2s_linear_infinite]"
        style={borderBeamMask}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] p-px motion-safe:animate-[border-beam_3.2s_linear_infinite]"
        style={borderBeamMask}
      />
    </>
  );
}
