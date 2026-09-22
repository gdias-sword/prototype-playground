'use client';

import { cn } from '@/design/utils';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import icCalendar from './assets/ic-calendar.svg';
import icClock from './assets/ic-clock.svg';
import icGift from './assets/ic-gift.svg';
import icSecurity from './assets/ic-security.svg';
import icTagClock from './assets/ic-tag-clock.svg';
import icWorld from './assets/ic-world.svg';
import sessionCard from './assets/session-card.png';
import { ChevronDown } from 'lucide-react';
import {
  ACTIVITIES,
  CALL_NO_LABEL,
  CALL_YES_LABEL,
  CAMERA_PRIVACY,
  ENABLE_CAMERA_LABEL,
  LATER_LABEL,
  REMIND_NO_LABEL,
  REMIND_YES_LABEL,
  SAFETY_FLAGS,
  SAFETY_NONE_LABEL,
  SEND_KIT_LABEL,
  SCHEDULE_DAYS,
  SCHEDULE_MONTH,
  SCHEDULE_ZONE,
  START_SESSION_LABEL,
  appointmentDayLabel,
  checkupTitle,
  safetyHint,
  scheduleTimesForDay,
  type ActivityId,
  type ScheduleDay,
} from './script';
import { GlassCheckRow, GlassChip, glassSurfaceClasses } from './glass';
import { useScrollFade } from './use-scroll-fade';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const SESSION_PREVIEW_SRC = new URL(
  './assets/session-preview.mp4',
  import.meta.url,
).href;

const PANEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const PANEL_CONTENT_MS = 800;

export function PrimaryAction({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const prevLabelRef = useRef<string | null>(null);
  const shouldAnimate =
    prevLabelRef.current !== null && prevLabelRef.current !== children;

  useEffect(() => {
    prevLabelRef.current = children;
  }, [children]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-body-large-strong bg-background-neutral-inverse text-foreground-neutral-inverse flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="grid overflow-hidden">
        <span
          key={children}
          className={cn(
            'col-start-1 row-start-1',
            shouldAnimate && 'phoenix-cta-label-wipe',
          )}
        >
          {children}
        </span>
      </span>
    </button>
  );
}

function SecondaryAction({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-large-strong text-foreground-neutral-default h-12 w-full cursor-pointer"
    >
      {children}
    </button>
  );
}

export function FooterActions({ children }: { children: ReactNode }) {
  return (
    <div className="mt-auto flex shrink-0 flex-col items-center gap-2 pb-2">
      {children}
    </div>
  );
}

const SUBMIT_REVEAL_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export function useRewindDraft<T>(
  saved: T | null | undefined,
  options?: { commitOnFirstSelect?: boolean },
) {
  const commitOnFirstSelect = options?.commitOnFirstSelect ?? true;
  const [draft, setDraft] = useState<T | null>(() => saved ?? null);

  useEffect(() => {
    setDraft(saved ?? null);
  }, [saved]);

  const isRewind = saved != null;
  const isDirty = isRewind && draft !== saved;
  const value = draft ?? saved ?? null;

  function choose(next: T, commit: (value: T) => void) {
    if (!isRewind) {
      if (commitOnFirstSelect) {
        commit(next);
        return;
      }
      setDraft(next);
      return;
    }
    if (next === saved && draft === saved) {
      commit(next);
      return;
    }
    setDraft(next);
  }

  function confirm(commit: (value: T) => void) {
    if (value == null) return;
    commit(value);
  }

  return { value, isRewind, isDirty, choose, confirm };
}

export function SubmitReveal({
  visible,
  onClick,
  children,
  className,
}: {
  visible: boolean;
  onClick: () => void;
  children: string;
  className?: string;
}) {
  return (
    <div
      inert={!visible || undefined}
      className={cn(
        'grid w-full shrink-0 transition-[grid-template-rows] duration-500',
        SUBMIT_REVEAL_EASE,
        visible ? 'grid-rows-[1fr] min-h-12' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className="overflow-hidden">
        <PrimaryAction onClick={onClick}>{children}</PrimaryAction>
      </div>
    </div>
  );
}

export function CameraPanel({ onEnable }: { onEnable: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playFromStart = () => {
      video.currentTime = 0;
      void video.play();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playFromStart();
      return;
    }

    video.addEventListener('loadeddata', playFromStart, { once: true });
    return () => video.removeEventListener('loadeddata', playFromStart);
  }, []);

  return (
    <div className="mt-8 flex min-h-0 flex-1 flex-col">
      <OfferPiece
        index={0}
        ready
        className="relative h-[300px] overflow-hidden rounded-3xl bg-white"
      >
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
          src={SESSION_PREVIEW_SRC}
          className="absolute inset-0 size-full object-cover"
        />
      </OfferPiece>
      <div className="mt-auto flex w-full shrink-0 flex-col gap-4 pb-2">
        <OfferPiece index={0} ready className="w-full">
          <div className="flex items-center gap-1.5">
            <span className="relative size-4 shrink-0 overflow-clip">
              <img
                alt=""
                aria-hidden
                src={assetSrc(icSecurity)}
                className="absolute inset-0 size-full"
              />
            </span>
            <p className="text-body-small-default text-foreground-neutral-default">
              {CAMERA_PRIVACY}
            </p>
          </div>
        </OfferPiece>
        <OfferPiece index={1} ready className="w-full">
          <PrimaryAction onClick={onEnable}>
            {ENABLE_CAMERA_LABEL}
          </PrimaryAction>
        </OfferPiece>
      </div>
    </div>
  );
}

function OfferPiece({
  index,
  ready,
  className,
  children,
}: {
  index: number;
  ready: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        className,
        ready ? 'phoenix-offer-piece' : 'pointer-events-none opacity-0',
      )}
      style={
        ready ? ({ '--offer-stagger': index } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}

export function OfferPanel({
  area,
  onStart,
  onLater,
}: {
  area: string;
  onStart: () => void;
  onLater: () => void;
}) {
  const [headlineReady] = useState(true);

  return (
    <div
      className="mt-8 flex min-h-0 flex-1 flex-col"
      inert={!headlineReady || undefined}
    >
      <div>
        <OfferPiece
          index={0}
          ready={headlineReady}
          className="relative h-80 overflow-hidden rounded-t-2xl"
        >
          <img
            alt=""
            src={assetSrc(sessionCard)}
            className="absolute inset-0 size-full object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <span className="text-body-medium-subtle rounded-full bg-black/40 px-2 py-1 text-white">
              Mobility
            </span>
            <span className="text-body-medium-subtle flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-white">
              <span className="relative size-4 overflow-clip">
                <img
                  alt=""
                  aria-hidden
                  src={assetSrc(icTagClock)}
                  className="absolute inset-0 size-full"
                />
              </span>
              8:00
            </span>
          </div>
          <p className="text-title-large-strong absolute inset-x-5 bottom-4 font-serif font-medium tracking-[-0.04em] text-white">
            {checkupTitle(area)}
          </p>
        </OfferPiece>
        <OfferPiece
          index={1}
          ready={headlineReady}
          className="flex items-center gap-3 rounded-b-2xl border border-white bg-white/80 px-5 py-3"
        >
          <span className="bg-background-neutral-default flex size-8 items-center justify-center rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
            <span className="relative size-5 overflow-clip">
              <img
                alt=""
                aria-hidden
                src={assetSrc(icGift)}
                className="absolute inset-0 size-full"
              />
            </span>
          </span>
          <p className="text-body-medium-subtle text-foreground-neutral-default">
            Complete the session to unlock your welcome kit
          </p>
        </OfferPiece>
      </div>
      <FooterActions>
        <OfferPiece index={2} ready={headlineReady} className="w-full">
          <PrimaryAction onClick={onStart}>{START_SESSION_LABEL}</PrimaryAction>
        </OfferPiece>
        <OfferPiece index={3} ready={headlineReady} className="w-full">
          <SecondaryAction onClick={onLater}>{LATER_LABEL}</SecondaryAction>
        </OfferPiece>
      </FooterActions>
    </div>
  );
}

export function SafetyPanel({
  onContinue,
}: {
  onContinue: (flags: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [headlineReady] = useState(true);
  const { scrollerRef, fadeTop, fadeBottom, onScroll } = useScrollFade([
    headlineReady,
  ]);

  function toggle(flag: string) {
    setSelected((current) =>
      current.includes(flag)
        ? current.filter((item) => item !== flag)
        : [...current, flag],
    );
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      inert={!headlineReady || undefined}
    >
      <OfferPiece index={0} ready={headlineReady} className="mt-4">
        <p className="text-body-large-default text-foreground-neutral-default">
          {safetyHint()}
        </p>
      </OfferPiece>
      <OfferPiece
        index={1}
        ready={headlineReady}
        className="mt-8 flex min-h-0 flex-1 flex-col pb-4"
      >
        <div
          ref={scrollerRef}
          role="group"
          aria-label="Safety considerations"
          className="phoenix-chip-scroller -mx-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-2"
          data-fade-top={fadeTop || undefined}
          data-fade-bottom={fadeBottom || undefined}
          onScroll={onScroll}
        >
          {SAFETY_FLAGS.map((flag) => (
            <GlassCheckRow
              key={flag}
              selected={selected.includes(flag)}
              onClick={() => toggle(flag)}
            >
              {flag}
            </GlassCheckRow>
          ))}
        </div>
      </OfferPiece>
      <OfferPiece
        index={2}
        ready={headlineReady}
        className="mt-auto w-full pb-2"
      >
        <PrimaryAction onClick={() => onContinue(selected)}>
          {selected.length > 0 ? 'Continue' : SAFETY_NONE_LABEL}
        </PrimaryAction>
      </OfferPiece>
    </div>
  );
}

export function SchedulePanel({
  onContinue,
}: {
  onContinue: (day: ScheduleDay, time: string) => void;
}) {
  const [day, setDay] = useState<ScheduleDay>(SCHEDULE_DAYS[0]);
  const [time, setTime] = useState<string | null>(null);
  const slots = scheduleTimesForDay(day);
  const { scrollerRef, fadeTop, fadeBottom, onScroll } = useScrollFade([
    day.date,
  ]);

  function selectDay(item: ScheduleDay) {
    setDay(item);
    const nextSlots = scheduleTimesForDay(item);
    setTime((current) =>
      current && nextSlots.includes(current) ? current : null,
    );
  }

  return (
    <div
      className="mt-8 flex min-h-0 flex-1 flex-col gap-6"
      style={{
        animation: `rise-in ${PANEL_CONTENT_MS}ms ${PANEL_EASE} both`,
      }}
    >
      <p className="text-body-large-strong text-foreground-neutral-default">
        {SCHEDULE_MONTH}
      </p>
      <div className="phoenix-chip-scroller -mx-4 overflow-x-auto px-4">
        <div className="flex justify-between gap-x-2">
          {SCHEDULE_DAYS.map((item) => {
            const isSelected = item.date === day.date;
            return (
              <button
                key={item.date}
                type="button"
                disabled={!item.available}
                onClick={() => selectDay(item)}
                className="flex shrink-0 cursor-pointer flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    'text-title-small-strong flex size-12 items-center justify-center rounded-full',
                    isSelected &&
                      'bg-background-brand-default border-background-brand-default text-foreground-neutral-inverse border shadow-[0_10px_40px_rgba(90,80,180,0.14)]',
                    !isSelected &&
                      item.available &&
                      glassSurfaceClasses({
                        className: 'text-foreground-neutral-default',
                      }),
                    !item.available &&
                      'border-background-neutral-subtle bg-background-neutral-subtle text-foreground-neutral-faded border',
                  )}
                >
                  {item.date}
                </span>
                <span
                  className={cn(
                    'text-body-small-subtle',
                    item.available
                      ? 'text-foreground-neutral-default'
                      : 'text-foreground-neutral-faded',
                  )}
                >
                  {item.weekday}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="phoenix-chip-scroller -mx-4 grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-4 overflow-y-auto px-4 pb-2"
        data-fade-top={fadeTop || undefined}
        data-fade-bottom={fadeBottom || undefined}
        onScroll={onScroll}
      >
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setTime(slot)}
            className={glassSurfaceClasses({
              selected: time === slot,
              className:
                'text-body-medium-subtle text-foreground-neutral-default h-[62px] cursor-pointer rounded-2xl px-4 text-left',
            })}
          >
            {slot}
          </button>
        ))}
      </div>
      <FooterActions>
        <PrimaryAction
          disabled={!time}
          onClick={() => {
            if (!time) return;
            onContinue(day, time);
          }}
        >
          Continue
        </PrimaryAction>
      </FooterActions>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  ready,
}: {
  icon: string | { src: string };
  label: string;
  value: string;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        'border-border-neutral-faded bg-background-neutral-default flex items-center gap-4 rounded-[20px] border p-3',
        ready ? 'phoenix-summary-row' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="flex size-[52px] items-center justify-center rounded-xl bg-gradient-to-b from-[#eaf2fe] to-[#c7ddfb]">
        <span className="relative size-5 overflow-clip">
          <img
            alt=""
            aria-hidden
            src={assetSrc(icon)}
            className="absolute inset-0 size-full"
          />
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-body-small-subtle text-foreground-neutral-faded">
          {label}
        </p>
        <p className="text-body-medium-subtle text-foreground-neutral-default">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ConfirmPanel({
  day,
  time,
  onConfirm,
}: {
  day: ScheduleDay;
  time: string;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-8 flex min-h-0 flex-1 flex-col">
      <div className="flex w-full flex-col gap-3">
        <SummaryRow
          ready
          icon={icCalendar}
          label="Day"
          value={appointmentDayLabel(day)}
        />
        <SummaryRow
          ready
          icon={icClock}
          label="Time"
          value={time}
        />
        <SummaryRow
          ready
          icon={icWorld}
          label="Time Zone"
          value={SCHEDULE_ZONE}
        />
      </div>
      <FooterActions>
        <PrimaryAction onClick={onConfirm}>Confirm appointment</PrimaryAction>
      </FooterActions>
    </div>
  );
}

function AddressField({
  placeholder,
  type = 'text',
}: {
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="border-border-neutral-faded bg-background-neutral-default text-body-medium-default text-foreground-neutral-default placeholder:text-foreground-neutral-faded h-16 w-full rounded-2xl border px-4 outline-none"
    />
  );
}

export function AddressPanel({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="mt-8 flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-6">
        <AddressField placeholder="Address" />
        <AddressField placeholder="City" />
        <button
          type="button"
          className="border-border-neutral-faded bg-background-neutral-default text-body-medium-default text-foreground-neutral-faded flex h-16 w-full items-center justify-between rounded-2xl border px-4"
        >
          Country
          <ChevronDown className="size-5 shrink-0" />
        </button>
        <AddressField placeholder="Postal code" />
      </div>
      <FooterActions>
        <PrimaryAction onClick={onSubmit}>{SEND_KIT_LABEL}</PrimaryAction>
      </FooterActions>
    </div>
  );
}

const ACTIVITY_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

function activityIdFromAnswer(answer?: string | null) {
  if (!answer) return null;
  return ACTIVITIES.find((activity) => activity.label === answer)?.id ?? null;
}

export function ActivityTool({
  selected: savedAnswer,
  onCommit,
}: {
  selected?: string | null;
  onCommit: (id: ActivityId) => void;
}) {
  const rewind = useRewindDraft<ActivityId>(activityIdFromAnswer(savedAnswer), {
    commitOnFirstSelect: false,
  });
  const selected = rewind.value;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2">
        {ACTIVITIES.map((activity) => {
          const isSelected = selected === activity.id;
          return (
            <GlassChip
              key={activity.id}
              selected={isSelected}
              rewindSelected={
                rewind.isRewind && !rewind.isDirty && isSelected
              }
              onClick={() => rewind.choose(activity.id, onCommit)}
              className={cn(
                'grid justify-items-center overflow-hidden text-center',
                'transition-[grid-template-rows,padding,gap,transform,background-color,box-shadow] duration-500',
                ACTIVITY_EASE,
                isSelected
                  ? 'grid-rows-[auto_1fr] gap-0.5 py-4'
                  : 'grid-rows-[auto_0fr]',
              )}
            >
              <span>{activity.label}</span>
              <span
                className="min-h-0 overflow-hidden"
                aria-hidden={!isSelected}
              >
                <span
                  className={cn(
                    'text-body-medium-default text-foreground-neutral-subtle block transition-opacity duration-500',
                    ACTIVITY_EASE,
                    isSelected ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {activity.hint}
                </span>
              </span>
            </GlassChip>
          );
        })}
      </div>
      <SubmitReveal
        visible={rewind.isRewind ? rewind.isDirty : Boolean(selected)}
        className="mt-auto pb-2"
        onClick={() => rewind.confirm(onCommit)}
      >
        Continue
      </SubmitReveal>
    </div>
  );
}

export function DualActionTool({
  primary,
  secondary,
  selected,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  selected?: string | null;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const rewind = useRewindDraft(selected ?? null);

  function commit(label: string) {
    if (label === primary) onPrimary();
    else onSecondary();
  }

  return (
    <div className="mt-auto flex flex-col items-center gap-2 pb-2">
      <div
        className={cn(
          'w-full rounded-2xl',
          rewind.isRewind &&
            !rewind.isDirty &&
            rewind.value === primary &&
            'phoenix-rewind-selected',
        )}
      >
        <PrimaryAction onClick={() => rewind.choose(primary, commit)}>
          {primary}
        </PrimaryAction>
      </div>
      <SecondaryAction onClick={() => rewind.choose(secondary, commit)}>
        {secondary}
      </SecondaryAction>
      <SubmitReveal
        visible={rewind.isDirty}
        onClick={() => rewind.confirm(commit)}
      >
        Continue
      </SubmitReveal>
    </div>
  );
}

export function CallActions({
  selected,
  onYes,
  onNo,
}: {
  selected?: string | null;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <DualActionTool
      primary={CALL_YES_LABEL}
      secondary={CALL_NO_LABEL}
      selected={selected}
      onPrimary={onYes}
      onSecondary={onNo}
    />
  );
}

export function RemindActions({
  selected,
  onYes,
  onNo,
}: {
  selected?: string | null;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <DualActionTool
      primary={REMIND_YES_LABEL}
      secondary={REMIND_NO_LABEL}
      selected={selected}
      onPrimary={onYes}
      onSecondary={onNo}
    />
  );
}
