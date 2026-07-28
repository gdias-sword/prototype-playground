'use client';

import { useMemo, useState } from 'react';

// ── date helpers ─────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayMon(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface TimeSlot {
  display: string;
  range: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { display: '2:00 pm', range: '2:00–2:30pm' },
  { display: '2:15 pm', range: '2:15–2:45pm' },
  { display: '2:30 pm', range: '2:30–3:00pm' },
  { display: '2:45 pm', range: '2:45–3:15pm' },
  { display: '3:00 pm', range: '3:00–3:30pm' },
  { display: '3:15 pm', range: '3:15–3:45pm' },
  { display: '3:30 pm', range: '3:30–4:00pm' },
  { display: '3:45 pm', range: '3:45–4:15pm' },
  { display: '4:00 pm', range: '4:00–4:30pm' },
  { display: '4:15 pm', range: '4:15–4:45pm' },
  { display: '4:30 pm', range: '4:30–5:00pm' },
];

// April 2026 — available Mon–Sat days from the design
const AVAILABLE_DAYS = new Set([
  1, 3, 6, 7, 8, 9, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30,
]);
const TODAY = { year: 2026, month: 3, day: 1 }; // April 1 2026 = "today" in the design

interface DayCell {
  day: number;
  kind: 'prev' | 'current' | 'next';
  available: boolean;
  isToday: boolean;
}

function buildGrid(year: number, month: number): DayCell[][] {
  const firstDay = getFirstDayMon(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrev = getDaysInMonth(prevYear, prevMonth);

  const cells: DayCell[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrev - i,
      kind: 'prev',
      available: false,
      isToday: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isCurrentMonth = year === TODAY.year && month === TODAY.month;
    const available = isCurrentMonth
      ? AVAILABLE_DAYS.has(d)
      : new Date(year, month, d).getDay() !== 0 &&
        new Date(year, month, d).getDay() !== 6;
    cells.push({
      day: d,
      kind: 'current',
      available,
      isToday: d === TODAY.day && isCurrentMonth,
    });
  }

  const rem = cells.length % 7;
  if (rem !== 0) {
    for (let d = 1; d <= 7 - rem; d++) {
      cells.push({ day: d, kind: 'next', available: false, isToday: false });
    }
  }

  const rows: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

// ── icons ────────────────────────────────────────────────────────────────────

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect
        x="3"
        y="4"
        width="14"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 2v4M13 2v4M3 9h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.5V10l2.5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 3c-1.5 2.5-2 4.5-2 7s.5 4.5 2 7M10 3c1.5 2.5 2 4.5 2 7s-.5 4.5-2 7M3 10h14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 4L6 8l4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10l5 5 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function RescheduleFlowPredict() {
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(3);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const rows = useMemo(
    () => buildGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  function handlePrev() {
    setSelectedDay(null);
    setSelectedSlot(null);
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  }

  function handleNext() {
    setSelectedDay(null);
    setSelectedSlot(null);
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  }

  function handleDayClick(cell: DayCell) {
    if (cell.kind !== 'current' || !cell.available) return;
    setSelectedDay(cell.day);
    setSelectedSlot(null);
  }

  function handleConfirm() {
    setConfirmed(true);
  }

  const hasSelection = selectedDay !== null && selectedSlot !== null;
  const selectedDayName = selectedDay
    ? DAY_NAMES_LONG[new Date(viewYear, viewMonth, selectedDay).getDay()]
    : null;

  // ── sub-views ───────────────────────────────────────────────────────────────

  const eventInfoSection = (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <h1 className="text-title-large-strong text-foreground-neutral-default leading-tight">
        Sword concierge welcome call
      </h1>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <IconCalendar className="text-foreground-neutral-faded mt-0.5 size-5 shrink-0" />
          <span className="text-body-large-default text-foreground-neutral-default line-through">
            Thursday, April 2, 2026,
            <br />
            11:30 am – 12:00 pm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconClock className="text-foreground-neutral-faded size-5 shrink-0" />
          <span className="text-body-large-default text-foreground-neutral-default">
            30 min
          </span>
        </div>
        <div className="flex items-center gap-2">
          <IconGlobe className="text-foreground-neutral-faded size-5 shrink-0" />
          <span className="text-body-large-default text-foreground-neutral-default">
            Europe/Lisbon
          </span>
        </div>
      </div>
    </div>
  );

  const calendarSection = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-body-large-strong text-foreground-neutral-default">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            aria-label="Previous month"
            className="text-foreground-neutral-default hover:bg-background-neutral-subtle flex size-8 items-center justify-center rounded-lg transition-colors duration-[0.12s]"
          >
            <IconChevronLeft className="size-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next month"
            className="text-foreground-neutral-default hover:bg-background-neutral-subtle flex size-8 items-center justify-center rounded-lg transition-colors duration-[0.12s]"
          >
            <IconChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((wd) => (
          <span
            key={wd}
            className="text-body-small-subtle text-foreground-neutral-faded"
          >
            {wd}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((cell, ci) => {
              const isSelected =
                cell.kind === 'current' && cell.day === selectedDay;
              const isOther = cell.kind !== 'current';
              return (
                <div
                  key={ci}
                  className="flex h-12 flex-col items-center justify-center gap-1"
                >
                  <button
                    onClick={() => handleDayClick(cell)}
                    disabled={!cell.available || isOther}
                    className={[
                      'text-body-medium-strong flex size-8 items-center justify-center rounded-full transition-all duration-[0.12s]',
                      isSelected
                        ? 'bg-background-brand-default text-foreground-neutral-inverse'
                        : cell.available && !isOther
                          ? 'bg-background-brand-faded text-foreground-brand-default hover:bg-background-brand-subtle cursor-pointer'
                          : isOther
                            ? 'text-foreground-neutral-faded cursor-default'
                            : 'text-foreground-neutral-default cursor-default',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {cell.day}
                  </button>
                  <div
                    className={[
                      'size-1 rounded-full',
                      cell.isToday ? 'bg-background-brand-default' : '',
                    ].join(' ')}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const timeSlotsSection = (
    <div className="flex flex-col gap-3">
      <span className="text-body-large-strong text-foreground-neutral-default">
        {selectedDayName}, {MONTHS[viewMonth]} {selectedDay}
      </span>
      <div className="flex flex-col gap-2 md:max-h-[380px] md:overflow-y-auto md:pr-1">
        {TIME_SLOTS.map((slot) => {
          const isSelected = slot.display === selectedSlot?.display;
          return (
            <button
              key={slot.display}
              onClick={() => setSelectedSlot(slot)}
              className={[
                'text-body-large-strong w-full rounded-md border py-2 transition-all duration-[0.12s]',
                isSelected
                  ? 'bg-background-brand-default border-background-brand-default text-white'
                  : 'border-background-brand-default text-foreground-brand-default hover:bg-background-brand-faded bg-background-neutral-default',
              ].join(' ')}
            >
              {slot.display}
            </button>
          );
        })}
      </div>
    </div>
  );

  const bottomBar = (
    <div
      className={[
        'border-border-neutral-faded overflow-hidden border-t transition-all duration-200',
        hasSelection
          ? 'max-h-24 opacity-100'
          : 'pointer-events-none max-h-0 opacity-0',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-8 py-3">
        <p className="text-body-medium-default text-foreground-neutral-faded min-w-0 flex-1">
          Your appointment will be scheduled for{' '}
          <strong className="text-foreground-neutral-default">
            {selectedDayName}, {MONTHS[viewMonth]} {selectedDay},{' '}
            {selectedSlot?.range}
          </strong>
        </p>
        <button
          onClick={handleConfirm}
          className="bg-background-brand-default hover:bg-background-brand-strong text-body-medium-strong shrink-0 rounded-2xl px-8 py-3 text-white transition-colors duration-[0.12s]"
        >
          Reschedule call
        </button>
      </div>
    </div>
  );

  if (confirmed) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center p-8">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="bg-background-brand-faded flex size-16 items-center justify-center rounded-full">
            <IconCheck className="text-foreground-brand-default size-8" />
          </div>
          <h2 className="text-title-large-strong text-foreground-neutral-default">
            All set!
          </h2>
          <p className="text-body-large-default text-foreground-neutral-faded">
            Your Sword concierge welcome call has been moved to{' '}
            <strong className="text-foreground-neutral-default">
              {selectedDayName}, {MONTHS[viewMonth]} {selectedDay},{' '}
              {selectedSlot?.range}
            </strong>
            .
          </p>
          <button
            onClick={() => {
              setConfirmed(false);
              setSelectedDay(null);
              setSelectedSlot(null);
            }}
            className="bg-background-brand-default hover:bg-background-brand-strong text-body-large-strong mt-2 rounded-xl px-6 py-3 text-white transition-colors duration-[0.12s]"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m-auto flex min-h-dvh w-full max-w-(--breakpoint-xl) items-center justify-center p-8">
      {/* Scheduler card — fixed 960px width so layout stays stable */}
      <div className="border-border-neutral-faded bg-background-neutral-default w-full shrink-0 overflow-hidden rounded-2xl border shadow-[0px_6px_17px_rgba(31,34,44,0.07)]">
        {/* ── Desktop: 3-column ────────────────────────────────────────────── */}
        <div className="hidden md:flex">
          {/* Col 1: event info */}
          <div className="flex w-72 shrink-0 flex-col">{eventInfoSection}</div>

          <div className="bg-border-neutral-faded w-px shrink-0" />

          {/* Col 2+3: calendar + time + bottom bar */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-border-neutral-faded border-b px-8 py-4">
              <span className="text-title-small-strong text-foreground-neutral-default">
                Select a date &amp; time
              </span>
            </div>
            <div className="flex min-h-[420px] gap-10 px-8 pt-6">
              <div className="min-w-0 flex-1">{calendarSection}</div>
              <div className="relative w-60 shrink-0">
                <p
                  className={[
                    'text-body-medium-default text-foreground-neutral-faded absolute inset-x-0 top-0 pt-1 transition-opacity duration-[0.16s]',
                    selectedDay
                      ? 'pointer-events-none opacity-0'
                      : 'opacity-100',
                  ].join(' ')}
                >
                  Select a date to see available times
                </p>
                <div
                  aria-hidden={!selectedDay}
                  className={[
                    'transition-opacity duration-[0.16s]',
                    selectedDay
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0',
                  ].join(' ')}
                >
                  {timeSlotsSection}
                </div>
              </div>
            </div>
            {bottomBar}
          </div>
        </div>

        {/* ── Mobile: stacked ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:hidden">
          {eventInfoSection}

          <div className="bg-border-neutral-faded h-px" />

          <div className="px-6 pt-6 pb-2">
            <span className="text-title-small-strong text-foreground-neutral-default">
              Select a date &amp; time
            </span>
          </div>
          <div className="p-6">{calendarSection}</div>

          <div
            className={[
              'overflow-hidden transition-all duration-200',
              selectedDay
                ? 'max-h-[999px] opacity-100'
                : 'pointer-events-none max-h-0 opacity-0',
            ].join(' ')}
          >
            <div className="bg-border-neutral-faded h-px" />
            <div className="p-6">{selectedDay ? timeSlotsSection : null}</div>
          </div>

          {bottomBar}
        </div>
      </div>
    </div>
  );
}
