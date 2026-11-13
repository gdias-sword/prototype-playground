'use client';

// Variants — what the line means, and where the label lives:
// A — Story meters: glass tray, a line above every label. Each line fills on its own and stays filled.
// B — Sliding underline: no tray. One rule travels under the active label, then fills there.
// C — Journey rail: one line runs through nodes and keeps advancing across the sequence. Glass sits only behind the current label.
// D — Numbered glass pill: only the active label is shown. A white platter sits on the current number, and a rule inside it fills.
// E — Steady glass pill: the tray keeps one width, idle steps stay circles, and the white platter itself grows across the active step.
// Mobile uses a vertical timeline of the same steps in the page body. Desktop keeps these treatments on the image.

import { cn } from '@/design/utils';
import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useId, type FocusEvent, type ReactNode } from 'react';

export interface Step {
  label: string;
}

type PauseReason = 'focus';

export interface StepperProps {
  steps: Step[];
  active: number;
  progress: MotionValue<number>;
  journey: MotionValue<number>;
  meters: MotionValue<number>[];
  onSelect: (index: number) => void;
  onPauseChange: (reason: PauseReason, paused: boolean) => void;
  className?: string;
}

const labelClass =
  'text-pretty text-[12px] leading-4 font-medium tracking-[0.2px] lg:text-[14px] lg:leading-5';

const timelineLabel = 'text-[14px] leading-5';

function pauseHandlers(
  onPauseChange: (reason: PauseReason, paused: boolean) => void,
) {
  return {
    onFocus: (event: FocusEvent<HTMLOListElement>) => {
      if (
        event.target instanceof Element &&
        event.target.matches(':focus-visible')
      ) {
        onPauseChange('focus', true);
      }
    },
    onBlur: (event: FocusEvent<HTMLOListElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        onPauseChange('focus', false);
      }
    },
  };
}

function StepButton({
  index,
  steps,
  isActive,
  onSelect,
  className,
  children,
}: {
  index: number;
  steps: Step[];
  isActive: boolean;
  onSelect: (index: number) => void;
  className?: string;
  children: ReactNode;
}) {
  const step = steps[index];

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-current={isActive ? 'step' : undefined}
      aria-label={`Step ${index + 1} of ${steps.length}: ${step.label}`}
      className={cn(
        'min-w-0 cursor-pointer rounded-xl text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Label({
  children,
  isActive,
  isComplete = false,
  className,
}: {
  children: string;
  isActive: boolean;
  isComplete?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        labelClass,
        'relative z-1 block transition-colors duration-200',
        isActive
          ? 'text-[#0d0d0d]'
          : isComplete
            ? 'text-[#0d0d0d]/70'
            : 'text-[#0d0d0d]/45 group-hover:text-[#0d0d0d]/75',
        className,
      )}
    >
      {children}
    </span>
  );
}

export type TimelineKind = 'meters' | 'underline' | 'rail' | 'numbered';

export function VerticalTimeline({
  kind,
  className,
  ...props
}: StepperProps & { kind: TimelineKind }) {
  return (
    <div className={className}>
      {kind === 'meters' ? <VerticalMeters {...props} /> : null}
      {kind === 'underline' ? <VerticalUnderline {...props} /> : null}
      {kind === 'rail' ? <VerticalRail {...props} /> : null}
      {kind === 'numbered' ? <VerticalNumbered {...props} /> : null}
    </div>
  );
}

function VerticalMeters({
  steps,
  active,
  meters,
  onSelect,
  onPauseChange,
}: StepperProps) {
  return (
    <ol {...pauseHandlers(onPauseChange)} className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.label}>
            <StepButton
              index={index}
              steps={steps}
              isActive={isActive}
              onSelect={onSelect}
              className="group flex min-h-8 w-full items-stretch gap-4 text-left"
            >
              <span className="relative w-0.5 shrink-0 self-stretch overflow-hidden rounded-full bg-[#0d0d0d]/15">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 origin-top rounded-full bg-[#0d0d0d]"
                  style={{ scaleY: meters[index] }}
                />
              </span>
              <Label
                isActive={isActive}
                isComplete={index < active}
                className={timelineLabel}
              >
                {step.label}
              </Label>
            </StepButton>
          </li>
        );
      })}
    </ol>
  );
}

function VerticalUnderline({
  steps,
  active,
  progress,
  onSelect,
  onPauseChange,
}: StepperProps) {
  const reduceMotion = useReducedMotion();
  const markerId = useId();
  const travel = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute top-3 bottom-3 left-0 w-px bg-[#0d0d0d]/15"
      />
      <ol {...pauseHandlers(onPauseChange)} className="flex flex-col gap-5">
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li key={step.label}>
              <StepButton
                index={index}
                steps={steps}
                isActive={isActive}
                onSelect={onSelect}
                className="group relative flex w-full py-1 pr-1 pl-4 text-left"
              >
                {isActive ? (
                  <motion.span
                    layoutId={reduceMotion ? undefined : markerId}
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-0.5 overflow-hidden rounded-full bg-[#0d0d0d]/15"
                    transition={travel}
                  >
                    <motion.span
                      className="absolute inset-0 origin-top bg-[#0d0d0d]"
                      style={{ scaleY: progress }}
                    />
                  </motion.span>
                ) : null}
                <Label
                  isActive={isActive}
                  isComplete={index < active}
                  className={timelineLabel}
                >
                  {step.label}
                </Label>
              </StepButton>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function VerticalRail({
  steps,
  active,
  meters,
  onSelect,
  onPauseChange,
}: StepperProps) {
  return (
    <ol {...pauseHandlers(onPauseChange)} className="flex flex-col">
      {steps.map((step, index) => {
        const isActive = index === active;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex">
            <StepButton
              index={index}
              steps={steps}
              isActive={isActive}
              onSelect={onSelect}
              className="group flex w-full items-stretch gap-4 text-left"
            >
              <span className="flex w-4 shrink-0 flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    'relative z-1 mt-1.5 size-2.5 shrink-0 rounded-full',
                    index <= active
                      ? 'bg-[#0d0d0d]'
                      : 'bg-white shadow-[0_0_0_1px_rgba(13,13,13,0.25)]',
                    isActive && 'shadow-[0_0_0_4px_rgba(13,13,13,0.08)]',
                  )}
                />
                {isLast ? null : (
                  <span className="relative mt-1.5 w-0.5 flex-1 overflow-hidden rounded-full bg-[#0d0d0d]/15">
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 origin-top bg-[#0d0d0d]"
                      style={{ scaleY: meters[index] }}
                    />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1',
                  isLast ? 'py-0.5' : 'pt-0.5 pb-6',
                )}
              >
                <span
                  className={cn(
                    'block',
                    isActive && 'rounded-xl bg-[#f2f6fb] px-3 py-2',
                  )}
                >
                  <Label
                    isActive={isActive}
                    isComplete={index < active}
                    className={timelineLabel}
                  >
                    {step.label}
                  </Label>
                </span>
              </span>
            </StepButton>
          </li>
        );
      })}
    </ol>
  );
}

function VerticalNumbered({
  steps,
  active,
  meters,
  onSelect,
  onPauseChange,
}: StepperProps) {
  return (
    <ol {...pauseHandlers(onPauseChange)} className="flex flex-col">
      {steps.map((step, index) => {
        const isActive = index === active;
        const isReached = index <= active;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex">
            <StepButton
              index={index}
              steps={steps}
              isActive={isActive}
              onSelect={onSelect}
              className="group flex w-full items-stretch gap-4 text-left"
            >
              <span className="flex w-8 shrink-0 flex-col items-center">
                <span
                  aria-hidden
                  className={cn(
                    'relative z-1 flex size-8 shrink-0 items-center justify-center rounded-full text-[15px] leading-none font-semibold tabular-nums transition-[color,background-color,box-shadow] duration-300',
                    isActive
                      ? 'bg-[#4a89e8] text-white shadow-[0_0_0_6px_rgba(74,137,232,0.16)]'
                      : isReached
                        ? 'bg-[#4a89e8] text-white'
                        : 'bg-white text-[#4a89e8] shadow-[0_0_0_1.5px_rgba(74,137,232,0.4)]',
                  )}
                >
                  {index + 1}
                </span>
                {isLast ? null : (
                  <span className="relative -mt-1 min-h-8 w-1.5 flex-1 overflow-hidden rounded-full bg-[#e0ecfd]">
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 origin-top bg-[#4a89e8]"
                      style={{ scaleY: meters[index] }}
                    />
                  </span>
                )}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 pt-[3px]',
                  isLast ? null : 'pb-3',
                )}
              >
                <span
                  className={cn(
                    'block text-[18px] leading-[26px] font-semibold tracking-[0.2px] transition-colors duration-300',
                    isReached
                      ? 'text-[#0d0d0d]'
                      : 'text-[#0d0d0d]/40 group-hover:text-[#0d0d0d]/70',
                  )}
                >
                  {step.label}
                </span>
              </span>
            </StepButton>
          </li>
        );
      })}
    </ol>
  );
}

export function StoryLines({
  steps,
  active,
  meters,
  onSelect,
  onPauseChange,
  className,
}: StepperProps) {
  return (
    <ol
      {...pauseHandlers(onPauseChange)}
      className={cn(
        'absolute grid grid-cols-3 rounded-3xl bg-white/45 p-3 shadow-[0_8px_24px_rgba(31,34,44,0.08)] ring-1 ring-white/70 backdrop-blur-xl lg:p-4',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.label} className="min-w-0">
            <StepButton
              index={index}
              steps={steps}
              isActive={isActive}
              onSelect={onSelect}
              className="group flex w-full flex-col items-stretch gap-2 px-1"
            >
              <span className="relative h-0.5 overflow-hidden rounded-full bg-[#0d0d0d]/20">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 origin-left rounded-full bg-[#0d0d0d]"
                  style={{ scaleX: meters[index] }}
                />
              </span>
              <Label isActive={isActive}>{step.label}</Label>
            </StepButton>
          </li>
        );
      })}
    </ol>
  );
}

export function SlidingUnderline({
  steps,
  active,
  progress,
  onSelect,
  onPauseChange,
  className,
}: StepperProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('absolute', className)}>
      <ol {...pauseHandlers(onPauseChange)} className="grid grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === active;
          return (
            <li key={step.label} className="min-w-0">
              <StepButton
                index={index}
                steps={steps}
                isActive={isActive}
                onSelect={onSelect}
                className="group w-full px-2 pb-3"
              >
                <Label isActive={isActive}>{step.label}</Label>
              </StepButton>
            </li>
          );
        })}
      </ol>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#0d0d0d]/15" />
        <motion.div
          className="absolute inset-y-0 left-0 w-1/3"
          initial={false}
          animate={{ x: `${active * 100}%` }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        >
          <div className="absolute inset-0 rounded-full bg-[#0d0d0d]/20" />
          <motion.div
            className="absolute inset-0 origin-left rounded-full bg-[#0d0d0d]"
            style={{ scaleX: progress }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function JourneyRail({
  steps,
  active,
  journey,
  onSelect,
  onPauseChange,
  className,
}: StepperProps) {
  return (
    <div className={cn('absolute', className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute top-1 right-[16.666%] left-[16.666%] h-px -translate-y-1/2 bg-[#0d0d0d]/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1 left-[16.666%] w-[66.666%] -translate-y-1/2"
      >
        <motion.div
          className="h-px origin-left bg-[#0d0d0d]"
          style={{ scaleX: journey }}
        />
      </div>
      <ol {...pauseHandlers(onPauseChange)} className="grid grid-cols-3">
        {steps.map((step, index) => {
          const isActive = index === active;
          const isComplete = index < active;
          return (
            <li key={step.label} className="min-w-0">
              <StepButton
                index={index}
                steps={steps}
                isActive={isActive}
                onSelect={onSelect}
                className="group flex w-full flex-col items-center gap-4 px-2"
              >
                <span
                  aria-hidden
                  className={cn(
                    'relative z-1 size-2 rounded-full ring-2 ring-white',
                    isComplete || isActive
                      ? 'bg-[#0d0d0d]'
                      : 'bg-white/80 shadow-[0_0_0_1px_rgba(13,13,13,0.25)]',
                  )}
                />
                <span className="relative block w-full">
                  {isActive ? (
                    <span className="absolute inset-x-0 -inset-y-1 rounded-xl bg-white/55 shadow-[0_4px_16px_rgba(31,34,44,0.06)] ring-1 ring-white/80 backdrop-blur-md" />
                  ) : null}
                  <Label isActive={isActive}>{step.label}</Label>
                </span>
              </StepButton>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function NumberedCapsule({
  steps,
  active,
  progress,
  onSelect,
  onPauseChange,
  className,
}: StepperProps) {
  const reduceMotion = useReducedMotion();
  const platterId = useId();
  const travel = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <ol
      {...pauseHandlers(onPauseChange)}
      className={cn(
        'absolute flex w-max max-w-[calc(100%-12px)] items-center rounded-full bg-white/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(31,34,44,0.14)] ring-1 ring-white/80 backdrop-blur-2xl',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.label} className="flex min-w-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${index + 1} of ${steps.length}: ${step.label}`}
              className={cn(
                'group relative flex h-12 cursor-pointer items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]',
                isActive
                  ? 'min-w-0 pr-3.5'
                  : 'w-10 justify-center hover:bg-white/45',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId={reduceMotion ? undefined : platterId}
                  className="absolute inset-0 rounded-full bg-white shadow-[0_1px_1px_rgba(31,34,44,0.05)]"
                  transition={travel}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-1 flex size-8 shrink-0 items-center justify-center text-[13px] leading-4 font-semibold tabular-nums transition-colors duration-200',
                  isActive
                    ? 'text-[#0d0d0d]'
                    : 'text-[#0d0d0d]/45 group-hover:text-[#0d0d0d]/80',
                )}
              >
                {index + 1}
              </span>
              {isActive ? (
                <motion.span
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, ease: 'easeOut' }
                  }
                  className="relative z-1 min-w-0 truncate text-[12px] leading-4 font-medium tracking-[0.2px] text-[#0d0d0d] lg:text-[14px] lg:leading-5"
                >
                  {step.label}
                </motion.span>
              ) : null}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute right-3.5 bottom-1.5 left-8 z-1 h-0.5 overflow-hidden rounded-full"
                >
                  <span className="absolute inset-0 bg-[#0d0d0d]/12" />
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-[#0d0d0d]"
                    style={{ scaleX: progress }}
                  />
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function SteadyPill({
  steps,
  active,
  progress,
  onSelect,
  onPauseChange,
  className,
}: StepperProps) {
  const reduceMotion = useReducedMotion();
  const platterShift = useTransform(
    progress,
    (value) => `translateX(calc(${value - 1} * (100% - 48px)))`,
  );

  return (
    <ol
      {...pauseHandlers(onPauseChange)}
      className={cn(
        'absolute flex w-max max-w-[calc(100%-48px)] items-center gap-1 rounded-full bg-white/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(31,34,44,0.14)] ring-1 ring-white/80 backdrop-blur-2xl',
        className,
      )}
    >
      {steps.map((step, index) => {
        const isActive = index === active;
        return (
          <li key={step.label} className="flex shrink-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${index + 1} of ${steps.length}: ${step.label}`}
              className={cn(
                'group relative flex h-12 shrink-0 cursor-pointer items-center overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d0d0d]',
                isActive ? null : 'hover:bg-white/45',
              )}
            >
              {isActive ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-full rounded-full bg-white shadow-[0_1px_1px_rgba(31,34,44,0.05)]"
                  style={{ transform: platterShift }}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-1 flex size-12 shrink-0 items-center justify-center text-[13px] leading-4 font-semibold tabular-nums transition-colors duration-200',
                  isActive
                    ? 'text-[#0d0d0d]'
                    : 'text-[#0d0d0d]/45 group-hover:text-[#0d0d0d]/80',
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'grid transition-[grid-template-columns,margin,opacity] ease-in-out',
                  reduceMotion ? 'duration-0' : 'duration-700',
                  isActive
                    ? '-ml-2 grid-cols-[1fr] opacity-100'
                    : 'ml-0 grid-cols-[0fr] opacity-0',
                )}
              >
                <span className="min-w-0 overflow-hidden">
                  <span className="relative z-1 grid pr-4 text-left text-[12px] leading-4 font-medium tracking-[0.2px] whitespace-nowrap text-[#0d0d0d] lg:text-[14px] lg:leading-5">
                    {steps.map((candidate, candidateIndex) => (
                      <span
                        key={candidate.label}
                        aria-hidden={candidateIndex !== index}
                        className={cn(
                          'col-start-1 row-start-1',
                          candidateIndex === index ? null : 'invisible',
                        )}
                      >
                        {candidate.label}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
