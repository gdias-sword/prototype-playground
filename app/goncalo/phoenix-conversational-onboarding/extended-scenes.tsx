'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import checkupPreview from './assets/checkup-preview.webp';
import icCalendar from './assets/ic-calendar.svg';
import icClock from './assets/ic-clock.svg';
import icGift from './assets/ic-gift.svg';
import icTagClock from './assets/ic-tag-clock.svg';
import icWorld from './assets/ic-world.svg';
import jessicaPortrait from './assets/jessica-portrait.png';
import sessionCard from './assets/session-card.png';
import { PhoenixOrb } from './phoenix-orb';
import { PhoenixLineText, streamDurationMs } from './phoenix-scene';
import {
  ACTIVITIES,
  CALL_NO_LABEL,
  CALL_YES_LABEL,
  LATER_LABEL,
  REMIND_NO_LABEL,
  REMIND_YES_LABEL,
  SAFETY_FLAGS,
  SAFETY_NONE_LABEL,
  SCHEDULE_DAYS,
  SCHEDULE_MONTH,
  SCHEDULE_ZONE,
  SPECIALIST,
  START_SESSION_LABEL,
  appointmentDayLabel,
  cameraLine,
  checkupTitle,
  confirmLine,
  offerLine,
  safetyHint,
  safetyLine,
  scheduleLine,
  scheduleTimesForDay,
  type ActivityId,
  type ScheduleDay,
  type StackTurn,
} from './script';
import { GlassCheckRow, GlassChip, glassSurfaceClasses } from './glass';
import { PanelHeaderStack } from './panel-header';
import { useScrollFade } from './use-scroll-fade';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const PANEL_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const PANEL_CONTENT_MS = 800;

export const CAMERA_HEADING_TURN: StackTurn = {
  id: 'camera-heading',
  role: 'phoenix',
  text: cameraLine(),
  kind: 'question',
};

export const OFFER_HEADING_TURN: StackTurn = {
  id: 'offer-heading',
  role: 'phoenix',
  text: offerLine(),
  kind: 'question',
};

export const SCHEDULE_HEADING_TURN: StackTurn = {
  id: 'schedule-heading',
  role: 'phoenix',
  text: scheduleLine(),
  kind: 'question',
};

export const CONFIRM_HEADING_TURN: StackTurn = {
  id: 'confirm-heading',
  role: 'phoenix',
  text: confirmLine(),
  kind: 'question',
};

export const SAFETY_HEADING_TURN: StackTurn = {
  id: 'safety-heading',
  role: 'phoenix',
  text: safetyLine(),
  kind: 'question',
};

const SPECIALIST_NAME_CLASS =
  'bg-gradient-to-r from-[#5f97f0] to-[#3a70c7] bg-clip-text text-transparent';

export function panelHeadingTurn(
  kind: 'camera' | 'offer' | 'schedule',
  turns: StackTurn[],
): StackTurn {
  if (kind === 'camera') return CAMERA_HEADING_TURN;
  if (kind === 'offer') return OFFER_HEADING_TURN;
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn.role === 'phoenix' && turn.text === scheduleLine()) {
      return turn;
    }
  }
  return SCHEDULE_HEADING_TURN;
}

export function ContinuityPanel({
  heading,
  hasStreamedTurn,
  instantStream,
  onTurnStreamComplete,
  children,
}: {
  heading: StackTurn;
  hasStreamedTurn?: (turnId: string) => boolean;
  instantStream?: boolean;
  onTurnStreamComplete: (turnId: string) => void;
  children: ReactNode;
}) {
  const [playLineIn] = useState(() => !hasStreamedTurn?.(heading.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <PanelHeaderStack>
        <p
          className="text-title-large-strong text-foreground-neutral-default text-left font-serif font-medium tracking-[-0.04em]"
          style={
            playLineIn && !instantStream
              ? { animation: `line-in 1300ms ${PANEL_EASE} backwards` }
              : undefined
          }
        >
          <PhoenixLineText
            key={heading.id}
            text={heading.text}
            kind={heading.kind}
            shouldStream={!hasStreamedTurn?.(heading.id)}
            instantStream={instantStream}
            onStreamComplete={() => onTurnStreamComplete(heading.id)}
          />
        </p>
      </PanelHeaderStack>
      {children}
    </div>
  );
}

export function PrimaryAction({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="text-body-large-strong bg-background-neutral-inverse text-foreground-neutral-inverse h-12 w-full cursor-pointer rounded-2xl disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
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

function SubmitReveal({
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
      className={cn(
        'grid w-full transition-[grid-template-rows] duration-500',
        SUBMIT_REVEAL_EASE,
        visible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        className,
      )}
    >
      <div className="overflow-hidden">
        <PrimaryAction onClick={onClick}>{children}</PrimaryAction>
      </div>
    </div>
  );
}

export function CameraPanel({
  onContinue,
  contentReady,
}: {
  onContinue: () => void;
  contentReady?: boolean;
}) {
  const [headlineReady, setHeadlineReady] = useState(Boolean(contentReady));

  useEffect(() => {
    if (contentReady) {
      setHeadlineReady(true);
      return;
    }
    // Fallback if the last stream character's animationend never fires.
    const count = Array.from(cameraLine()).length;
    const durationMs = count === 0 ? 0 : (count - 1) * 40 + 400;
    const id = window.setTimeout(() => setHeadlineReady(true), durationMs);
    return () => window.clearTimeout(id);
  }, [contentReady]);

  return (
    <button
      type="button"
      onClick={onContinue}
      className="mt-8 flex min-h-0 flex-1 cursor-pointer flex-col items-stretch text-left"
      inert={!headlineReady || undefined}
    >
      <OfferPiece
        index={0}
        ready={headlineReady}
        className="relative min-h-0 flex-1 overflow-hidden rounded-[36px] bg-white"
      >
        <img
          alt=""
          src={assetSrc(checkupPreview)}
          className="absolute inset-x-0 top-0 w-full rounded-[36px]"
        />
      </OfferPiece>
    </button>
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
  contentReady,
}: {
  area: string;
  onStart: () => void;
  onLater: () => void;
  contentReady?: boolean;
}) {
  const [headlineReady, setHeadlineReady] = useState(Boolean(contentReady));

  useEffect(() => {
    if (contentReady) {
      setHeadlineReady(true);
      return;
    }
    // Fallback if the last stream character's animationend never fires.
    // Timing matches streamDurationMs in phoenix-scene.tsx (40ms/char + 400ms).
    const count = Array.from(offerLine()).length;
    const durationMs = count === 0 ? 0 : (count - 1) * 40 + 400;
    const id = window.setTimeout(() => setHeadlineReady(true), durationMs);
    return () => window.clearTimeout(id);
  }, [contentReady]);

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
            Do your first session in 48 hours to unlock a reward
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
  contentReady,
}: {
  onContinue: (flags: string[]) => void;
  contentReady?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [headlineReady, setHeadlineReady] = useState(Boolean(contentReady));
  const { scrollerRef, fadeTop, fadeBottom, onScroll } = useScrollFade([
    headlineReady,
  ]);

  useEffect(() => {
    if (contentReady) {
      setHeadlineReady(true);
      return;
    }
    const id = window.setTimeout(
      () => setHeadlineReady(true),
      streamDurationMs(safetyLine()),
    );
    return () => window.clearTimeout(id);
  }, [contentReady]);

  function toggle(flag: string) {
    setSelected((current) => {
      if (flag === SAFETY_NONE_LABEL) {
        return current.includes(SAFETY_NONE_LABEL) ? [] : [SAFETY_NONE_LABEL];
      }
      const flags = current.filter((item) => item !== SAFETY_NONE_LABEL);
      return flags.includes(flag)
        ? flags.filter((item) => item !== flag)
        : [...flags, flag];
    });
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
          <GlassCheckRow
            selected={selected.includes(SAFETY_NONE_LABEL)}
            onClick={() => toggle(SAFETY_NONE_LABEL)}
            className="mt-1"
          >
            {SAFETY_NONE_LABEL}
          </GlassCheckRow>
        </div>
      </OfferPiece>
      <OfferPiece index={2} ready={headlineReady} className="mt-auto w-full pb-2">
        <SubmitReveal
          visible={selected.length > 0}
          onClick={() =>
            onContinue(
              selected.filter((item) => item !== SAFETY_NONE_LABEL),
            )
          }
        >
          Continue
        </SubmitReveal>
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
  contentReady,
  hasStreamedTurn,
  instantStream,
  onTurnStreamComplete,
}: {
  day: ScheduleDay;
  time: string;
  onConfirm: () => void;
  contentReady?: boolean;
  hasStreamedTurn?: (turnId: string) => boolean;
  instantStream?: boolean;
  onTurnStreamComplete: (turnId: string) => void;
}) {
  const heading = CONFIRM_HEADING_TURN;
  const [headlineReady, setHeadlineReady] = useState(Boolean(contentReady));

  useEffect(() => {
    if (contentReady) {
      setHeadlineReady(true);
      return;
    }
    const id = window.setTimeout(
      () => setHeadlineReady(true),
      streamDurationMs(heading.text),
    );
    return () => window.clearTimeout(id);
  }, [contentReady, heading.text]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-10">
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center">
          <div className="relative z-10 size-20">
            <PhoenixOrb mood="listen" className="h-full w-full" />
          </div>
          <div className="relative z-20 -ml-5 size-20 overflow-hidden rounded-full border-4 border-white bg-gradient-to-b from-[#eaf2fe] to-[#a6c9f8] shadow-[0_5px_5px_rgba(0,0,0,0.08)]">
            <img
              alt={SPECIALIST}
              src={assetSrc(jessicaPortrait)}
              className="size-full object-cover object-top"
            />
          </div>
        </div>
        <p className="text-title-large-strong text-foreground-neutral-default whitespace-pre-wrap text-center font-serif font-medium tracking-[-0.04em]">
          <PhoenixLineText
            key={heading.id}
            text={heading.text}
            kind={heading.kind}
            shouldStream={!hasStreamedTurn?.(heading.id)}
            instantStream={instantStream}
            onStreamComplete={() => onTurnStreamComplete(heading.id)}
            emphasis={{
              phrase: SPECIALIST,
              className: SPECIALIST_NAME_CLASS,
            }}
          />
        </p>
        <div
          className="flex w-full flex-col gap-3"
          inert={!headlineReady || undefined}
        >
          <SummaryRow
            ready={headlineReady}
            icon={icCalendar}
            label="Day"
            value={appointmentDayLabel(day)}
          />
          <SummaryRow
            ready={headlineReady}
            icon={icClock}
            label="Time"
            value={time}
          />
          <SummaryRow
            ready={headlineReady}
            icon={icWorld}
            label="Time Zone"
            value={SCHEDULE_ZONE}
          />
        </div>
      </div>
      <FooterActions>
        <PrimaryAction disabled={!headlineReady} onClick={onConfirm}>
          Confirm appointment
        </PrimaryAction>
      </FooterActions>
    </div>
  );
}

const ACTIVITY_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export function ActivityTool({
  onCommit,
}: {
  onCommit: (id: ActivityId) => void;
}) {
  const [selected, setSelected] = useState<ActivityId | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-2">
        {ACTIVITIES.map((activity) => {
          const isSelected = selected === activity.id;
          return (
            <GlassChip
              key={activity.id}
              selected={isSelected}
              onClick={() => setSelected(activity.id)}
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
        visible={Boolean(selected)}
        className="mt-auto pb-2"
        onClick={() => {
          if (selected) onCommit(selected);
        }}
      >
        Continue
      </SubmitReveal>
    </div>
  );
}

export function DualActionTool({
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="mt-auto flex flex-col items-center gap-2 pb-2">
      <PrimaryAction onClick={onPrimary}>{primary}</PrimaryAction>
      <SecondaryAction onClick={onSecondary}>{secondary}</SecondaryAction>
    </div>
  );
}

export function CallActions({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <DualActionTool
      primary={CALL_YES_LABEL}
      secondary={CALL_NO_LABEL}
      onPrimary={onYes}
      onSecondary={onNo}
    />
  );
}

export function RemindActions({
  onYes,
  onNo,
}: {
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <DualActionTool
      primary={REMIND_YES_LABEL}
      secondary={REMIND_NO_LABEL}
      onPrimary={onYes}
      onSecondary={onNo}
    />
  );
}
