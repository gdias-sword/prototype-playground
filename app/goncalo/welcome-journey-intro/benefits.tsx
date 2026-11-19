'use client';

import { SwordLogo } from '@/design/assets/logos/sword';
import { cn } from '@/design/utils';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import icCheck from './assets/ic-check.svg';
import icGift from './assets/ic-gift.svg';
import kitClosed from './assets/kit-closed.png';
import pepsi from './assets/pepsi.svg';
import ptPortrait from './assets/pt-portrait.png';
import splitMember from './assets/split-member.png';
import splitPt from './assets/split-pt.png';
import splitVisual from './assets/split-visual.png';
import stepPhone from './assets/step-phone.png';
import { assetSrc } from './shell';
import { useTuning } from './tuning';

const EASE = [0.2, 1, 0.4, 1] as const;

export type Layout = 'care' | 'included' | 'kit' | 'pass';

export function useEnter() {
  const isReduced = useReducedMotion();
  const { stepDuration, stepDistance, stepsStart, rowStagger } = useTuning();
  return (order: number, distance = stepDistance) => ({
    initial: isReduced ? false : { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: stepDuration,
      delay: isReduced ? 0 : stepsStart + order * rowStagger,
      ease: EASE,
    },
  });
}

export function Details({ layout }: { layout: Layout }) {
  const enter = useEnter();
  return (
    <div className="flex flex-col gap-8">
      <motion.p
        {...enter(0)}
        className="text-[16px] leading-[22px] tracking-[0.2px]"
      >
        {
          {
            care: 'Here’s what we’ll do together, fully covered by PepsiCo.',
            included: 'Covered by PepsiCo, so it’s $0 for you.',
            kit: 'Finish these steps and we’ll ship it to your door, free.',
            pass: 'Everything below is covered by PepsiCo. Here’s how to start.',
          }[layout]
        }
      </motion.p>
      {layout === 'included' ? (
        <>
          <div className="flex flex-col gap-2">
            <Benefit
              order={1}
              image={
                <img
                  alt=""
                  src={assetSrc(ptPortrait)}
                  className="size-full object-cover"
                />
              }
              title="Your own physical therapist"
              description="Builds your plan and checks in along the way"
            />
            <Benefit
              order={2}
              image={
                <img
                  alt=""
                  src={assetSrc(stepPhone)}
                  className="mt-2.5 h-11 w-auto"
                />
              }
              title="Guided sessions in the Sword app"
              description="Real-time feedback on every move"
            />
            <Benefit
              order={3}
              image={
                <img
                  alt=""
                  src={assetSrc(kitClosed)}
                  className="my-auto w-10"
                />
              }
              title="A welcome kit, shipped free"
              description="Yours once you’ve met your PT"
            />
          </div>
          <motion.div
            {...enter(4)}
            className="flex items-center gap-3 border-t border-[#e8e8e8] pt-5"
          >
            <Marker state="current" number={1} />
            <p className="flex-1 text-[16px] leading-[22px] font-medium tracking-[0.2px]">
              First, tell us about yourself
            </p>
            <p className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
              5 min
            </p>
          </motion.div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <Step order={1} state="current" number={1} meta="5 min">
            Tell us about yourself
          </Step>
          <Step order={2} number={2} meta="10 min">
            Movement check-up in the app
          </Step>
          <Step order={3} number={3} meta="Video call">
            Meet your physical therapist
          </Step>
          {layout === 'kit' && (
            <Step order={4} state="reward" meta="Free">
              Get your welcome kit
            </Step>
          )}
        </div>
      )}
    </div>
  );
}

function Marker({
  state = 'upcoming',
  number,
}: {
  state?: 'current' | 'upcoming' | 'reward';
  number?: number;
}) {
  return (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-[16px] leading-[26px] font-semibold tracking-[0.2px]',
        state === 'current' && 'border-2 border-[#4a89e8] text-[#4a89e8]',
        state === 'upcoming' &&
          'border-[1.5px] border-[#e8e8e8] text-[#5e5e5e]',
        state === 'reward' &&
          'bg-linear-to-br from-[#ffeaea] via-[#f3eafc] to-[#eaf2fe]',
      )}
    >
      {state === 'reward' ? <img alt="" src={assetSrc(icGift)} /> : number}
    </span>
  );
}

function Step({
  order,
  state,
  number,
  meta,
  children,
}: {
  order: number;
  state?: 'current' | 'upcoming' | 'reward';
  number?: number;
  meta: string;
  children: ReactNode;
}) {
  const enter = useEnter();
  return (
    <motion.div {...enter(order)} className="flex items-center gap-3">
      <Marker state={state} number={number} />
      <p
        className={cn(
          'flex-1 text-[16px] leading-[22px] font-medium tracking-[0.2px]',
          state === 'reward' && 'font-semibold',
        )}
      >
        {children}
      </p>
      <p
        className={cn(
          'text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]',
          state === 'reward' && 'font-semibold text-[#4a89e8]',
        )}
      >
        {meta}
      </p>
    </motion.div>
  );
}

function Benefit({
  order,
  image,
  title,
  description,
}: {
  order: number;
  image: ReactNode;
  title: string;
  description: string;
}) {
  const enter = useEnter();
  return (
    <motion.div
      {...enter(order)}
      className="flex items-center gap-4 rounded-2xl bg-white p-2 pr-4 shadow-[0_4px_20px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)]"
    >
      <span className="flex size-12 shrink-0 justify-center overflow-clip rounded-xl bg-linear-to-b from-[#eaf2fe] to-[#c7ddfb]">
        {image}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[16px] leading-[22px] font-semibold tracking-[0.2px]">
          {title}
        </span>
        <span className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
          {description}
        </span>
      </span>
    </motion.div>
  );
}

export function Visual({
  layout,
  firstName,
}: {
  layout: Layout;
  firstName: string;
}) {
  const enter = useEnter();
  return (
    <motion.div
      {...enter(0.5)}
      className="relative h-[360px] w-full shrink-0 lg:h-[560px] lg:flex-1"
    >
      {layout === 'pass' ? (
        <Pass firstName={firstName} />
      ) : (
        <>
          <img
            alt=""
            src={assetSrc(splitVisual)}
            className="pointer-events-none absolute inset-0 size-full object-cover mix-blend-multiply"
          />
          {layout === 'kit' ? (
            <Kit />
          ) : (
            <img
              alt=""
              src={assetSrc(splitMember)}
              className="pointer-events-none absolute top-[5%] left-1/2 h-[79%] w-auto -translate-x-[60%] object-contain"
            />
          )}
          {layout !== 'kit' && (
            <Floating order={2} className="bottom-[8%] left-[6%] lg:left-[11%]">
              <img
                alt=""
                src={assetSrc(splitPt)}
                width={44}
                height={44}
                className="size-11 rounded-full"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
                  Your physical therapist
                </span>
                <span className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
                  Reviews your answers and builds your plan
                </span>
              </span>
            </Floating>
          )}
          {layout === 'included' && (
            <Floating order={3} className="top-[10%] right-[4%]">
              <span className="flex size-11 items-center justify-center overflow-clip rounded-xl bg-linear-to-br from-[#fbe3ea] via-[#ece5fb] to-[#d6e6fd]">
                <img alt="" src={assetSrc(kitClosed)} className="w-9" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
                  Welcome kit
                </span>
                <span className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
                  Shipped free
                </span>
              </span>
            </Floating>
          )}
        </>
      )}
    </motion.div>
  );
}

function Floating({
  order,
  className,
  children,
}: {
  order: number;
  className: string;
  children: ReactNode;
}) {
  const enter = useEnter();
  return (
    <motion.div
      {...enter(order, 16)}
      className={cn(
        'absolute flex items-center gap-3 rounded-2xl bg-white py-3 pr-4 pl-3 whitespace-nowrap shadow-[0_8px_24px_rgba(26,38,77,0.12)]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function Kit() {
  const isReduced = useReducedMotion();
  const { stepsStart, rowStagger } = useTuning();
  return (
    <>
      <motion.img
        alt="Sword Thrive welcome kit box"
        src={assetSrc(kitClosed)}
        className="absolute top-1/2 left-1/2 w-[78%] max-w-[460px] -translate-1/2 drop-shadow-[0_24px_40px_rgba(26,38,77,0.18)]"
        initial={isReduced ? false : { rotate: -4, scale: 0.94 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          duration: 1.6,
          delay: isReduced ? 0 : stepsStart + rowStagger,
          ease: EASE,
        }}
      />
      <Floating order={2.5} className="top-[12%] right-[4%] lg:right-[8%]">
        <img alt="" src={assetSrc(icGift)} className="size-5" />
        <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
          On us · $0
        </span>
      </Floating>
      <Floating order={3} className="bottom-[8%] left-[4%] lg:left-[8%]">
        <img
          alt=""
          src={assetSrc(splitPt)}
          width={44}
          height={44}
          className="size-11 rounded-full"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-[14px] leading-5 font-semibold tracking-[0.2px]">
            Ships after your first call
          </span>
          <span className="text-[14px] leading-5 tracking-[0.2px] text-[#5e5e5e]">
            Once you’ve met your PT
          </span>
        </span>
      </Floating>
    </>
  );
}

function Pass({ firstName }: { firstName: string }) {
  const isReduced = useReducedMotion();
  const { stepsStart, rowStagger } = useTuning();
  const enter = useEnter();
  return (
    <div className="absolute inset-0 flex items-center justify-center [perspective:1200px]">
      <img
        alt=""
        src={assetSrc(splitVisual)}
        className="pointer-events-none absolute inset-0 size-full object-cover mix-blend-multiply"
      />
      <motion.div
        className="relative flex w-[min(100%,400px)] flex-col gap-8 overflow-clip rounded-[28px] bg-linear-to-br from-[#2f5aa3] via-[#4a89e8] to-[#8fb8f3] p-7 text-white shadow-[0_32px_64px_rgba(26,38,77,0.28)]"
        initial={isReduced ? false : { rotateX: 18, rotateY: -14, y: 40 }}
        animate={{ rotateX: 0, rotateY: 0, y: 0 }}
        transition={{
          duration: 1.6,
          delay: isReduced ? 0 : stepsStart + rowStagger * 0.5,
          ease: EASE,
        }}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-12 bg-linear-to-r from-white/0 via-white/25 to-white/0"
          initial={{ left: '-60%' }}
          animate={{ left: '130%' }}
          transition={{
            duration: 1.4,
            delay: isReduced ? 0 : stepsStart + rowStagger * 3,
            ease: EASE,
          }}
        />
        <div className="flex items-start justify-between">
          <SwordLogo variant="white" className="h-6 w-[97px]" />
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[12px] leading-[18px] font-semibold tracking-[0.2px] backdrop-blur">
            Access unlocked
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] leading-[18px] tracking-[0.2px] text-white/70 uppercase">
            Member
          </span>
          <span className="font-serif text-[28px] leading-9 tracking-[-0.4px]">
            {firstName}
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {[
            'Your own physical therapist',
            'Guided sessions in the Sword app',
            'Welcome kit, shipped free',
          ].map((item, index) => (
            <motion.li
              key={item}
              {...enter(2 + index * 0.5, 12)}
              className="flex items-center gap-3 text-[14px] leading-5 font-semibold tracking-[0.2px]"
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-white">
                <img alt="" src={assetSrc(icCheck)} className="size-3.5" />
              </span>
              {item}
            </motion.li>
          ))}
        </ul>
        <div className="flex items-end justify-between border-t border-white/20 pt-5">
          <span className="flex flex-col gap-1">
            <span className="text-[12px] leading-[18px] tracking-[0.2px] text-white/70">
              Offered by
            </span>
            <span className="flex h-7 items-center rounded-lg bg-white px-2">
              <img alt="PepsiCo" src={assetSrc(pepsi)} className="h-5 w-auto" />
            </span>
          </span>
          <span className="flex flex-col items-end">
            <span className="text-[12px] leading-[18px] tracking-[0.2px] text-white/70">
              Your cost
            </span>
            <span className="font-serif text-[32px] leading-10 tracking-[-0.4px]">
              $0
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
