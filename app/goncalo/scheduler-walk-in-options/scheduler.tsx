'use client';

import { SwordLogo } from '@/design/assets/logos/sword';
import { cn } from '@/design/utils';
import { Select } from '@base-ui/react/select';
import {
  Accessibility,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Globe,
  Menu,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DayId = 'today' | 'tomorrow' | 'pick';
type Period = 'best' | 'morning' | 'afternoon' | 'evening';
type LanguageId = 'en' | 'es' | 'pt';

const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Spanish' },
  { id: 'pt', label: 'Portuguese' },
];

const LANGUAGE_ITEMS: Record<LanguageId, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
};

const PERIODS: { id: Period; label: string }[] = [
  { id: 'best', label: 'Best times' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
];

const TODAY: Record<Period, string[]> = {
  best: [
    '10:45 AM',
    '11:15 AM',
    '12:30 PM',
    '1:00 PM',
    '2:45 PM',
    '3:45 PM',
    '4:15 PM',
    '4:30 PM',
  ],
  morning: ['8:45 AM', '9:30 AM', '10:30 AM', '11:30 AM'],
  afternoon: ['1:15 PM', '1:45 PM', '2:15 PM'],
  evening: ['5:15 PM', '6:00 PM', '6:45 PM'],
};

const LATER: Record<Period, string[]> = {
  best: [
    '9:15 AM',
    '10:00 AM',
    '11:30 AM',
    '1:15 PM',
    '2:00 PM',
    '3:30 PM',
    '5:00 PM',
    '6:15 PM',
  ],
  morning: ['8:30 AM', '9:00 AM', '10:15 AM', '11:45 AM'],
  afternoon: ['12:45 PM', '2:30 PM', '4:00 PM'],
  evening: ['5:30 PM', '6:30 PM', '7:15 PM'],
};

const SPANISH_TODAY: Record<Period, string[]> = {
  best: ['11:00 AM', '12:15 PM', '1:30 PM', '3:00 PM', '4:45 PM'],
  morning: ['9:15 AM', '10:45 AM', '11:45 AM'],
  afternoon: ['1:00 PM', '2:30 PM', '3:30 PM'],
  evening: ['5:45 PM', '6:30 PM'],
};

const SPANISH_LATER: Record<Period, string[]> = {
  best: ['9:45 AM', '11:15 AM', '1:00 PM', '2:45 PM', '4:30 PM', '6:00 PM'],
  morning: ['8:45 AM', '10:00 AM', '11:30 AM'],
  afternoon: ['1:30 PM', '3:15 PM'],
  evening: ['5:15 PM', '6:45 PM', '7:30 PM'],
};

const PORTUGUESE_TODAY: Record<Period, string[]> = {
  best: ['10:15 AM', '12:00 PM', '2:00 PM', '3:30 PM', '5:00 PM'],
  morning: ['9:00 AM', '10:30 AM', '11:15 AM'],
  afternoon: ['1:30 PM', '2:45 PM', '4:00 PM'],
  evening: ['5:30 PM', '6:15 PM'],
};

const PORTUGUESE_LATER: Record<Period, string[]> = {
  best: ['9:30 AM', '11:00 AM', '1:45 PM', '3:15 PM', '4:45 PM', '6:30 PM'],
  morning: ['8:15 AM', '9:45 AM', '11:15 AM'],
  afternoon: ['12:30 PM', '2:15 PM', '3:45 PM'],
  evening: ['5:45 PM', '7:00 PM'],
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(days: number) {
  const next = startOfDay(new Date());
  next.setDate(next.getDate() + days);
  return next;
}

const PICK_DATES = [2, 3, 4, 5, 6, 7].map(addDays);

function formatPickLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPickOption(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function dayLabel(day: DayId, picked: Date | null) {
  if (day === 'today') return 'today';
  if (day === 'tomorrow') return 'tomorrow';
  if (picked) return formatPickLabel(picked);
  return 'the day you picked';
}

function SpecialistAvailable() {
  return (
    <span className="text-positive-800 text-body-small-subtle inline-flex items-center gap-2 leading-4 font-medium">
      <span className="relative size-1.5 shrink-0" aria-hidden>
        <span className="bg-positive-800 absolute inset-0 rounded-full motion-safe:animate-[now-pulse_1.8s_ease-out_infinite]" />
        <span className="bg-positive-800 relative block size-1.5 rounded-full shadow-[0_0_0_3px_rgba(44,111,44,0.22)]" />
      </span>
      Specialist available
    </span>
  );
}

function PeriodSkeleton() {
  return (
    <div className="flex flex-wrap gap-6" aria-hidden>
      {['w-20', 'w-16', 'w-[72px]', 'w-14'].map((width) => (
        <div
          key={width}
          className={cn('h-5 animate-pulse rounded-full bg-[#f2f2f2]', width)}
        />
      ))}
    </div>
  );
}

function TimeSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'h-[62px] animate-pulse rounded-2xl bg-[#f2f2f2]',
        className,
      )}
    />
  );
}

function CallLanguage({
  value,
  onChange,
  className,
  align = 'start',
}: {
  value: LanguageId;
  onChange: (next: LanguageId) => void;
  className?: string;
  align?: 'start' | 'center';
}) {
  return (
    <p className={cn('text-[14px] leading-5 text-[#1f222c]', className)}>
      This call will be in{' '}
      <Select.Root
        value={value}
        items={LANGUAGE_ITEMS}
        modal={false}
        onValueChange={(next) => {
          if (next === 'en' || next === 'es' || next === 'pt') onChange(next);
        }}
      >
        <Select.Trigger
          aria-label="Call language"
          className="inline-flex cursor-pointer items-baseline gap-0.5 rounded-md px-1 font-medium text-[#1f222c] hover:bg-[#f2f2f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] data-popup-open:bg-[#f2f2f2]"
        >
          <Select.Value />
          <Select.Icon className="self-center">
            <ChevronDown
              className="size-3.5 text-[#5e5e5e]"
              strokeWidth={1.75}
              aria-hidden
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            side="top"
            align={align}
            sideOffset={8}
            alignItemWithTrigger={false}
          >
            <Select.Popup className="z-50 min-w-40 overflow-hidden rounded-xl border border-[#e8e8e8] bg-white p-1 shadow-[0_12px_40px_rgba(20,20,40,0.12)]">
              {LANGUAGES.map((language) => (
                <Select.Item
                  key={language.id}
                  value={language.id}
                  className="group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[14px] leading-5 text-[#0d0d0d] outline-none data-highlighted:bg-[#f2f2f2] data-selected:font-medium"
                >
                  <Select.ItemText>{language.label}</Select.ItemText>
                  <Check
                    className="ml-auto size-4 text-[#4a89e8] opacity-0 group-data-selected:opacity-100"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </p>
  );
}

function TimeChip({
  label,
  selected,
  now,
  onClick,
  className,
}: {
  label: string;
  selected: boolean;
  now?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex h-[62px] cursor-pointer items-center justify-center rounded-2xl border bg-white px-3 text-[14px] leading-5 text-[#0d0d0d] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]',
        now ? 'flex-col gap-0.5 font-semibold' : 'font-medium',
        selected
          ? 'border-2 border-[#4a89e8]'
          : 'border-[#c2c2c2] hover:border-[#8d8d8d]',
        className,
      )}
    >
      {label}
      {now ? <SpecialistAvailable /> : null}
    </button>
  );
}

export function Scheduler() {
  const [day, setDay] = useState<DayId>('today');
  const [picked, setPicked] = useState<Date | null>(null);
  const [pickOpen, setPickOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('best');
  const [selection, setSelection] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageId>('en');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [committed, setCommitted] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  const schedules: Record<LanguageId, Record<Period, string[]>> = {
    en: day === 'today' ? TODAY : LATER,
    es: day === 'today' ? SPANISH_TODAY : SPANISH_LATER,
    pt: day === 'today' ? PORTUGUESE_TODAY : PORTUGUESE_LATER,
  };
  const schedule = schedules[language];
  const showNow = day === 'today' && language === 'en';

  function chooseDay(next: DayId) {
    setDay(next);
    setSelection(null);
    setCommitted(false);
    setPickOpen(next === 'pick');
  }

  function chooseDate(date: Date) {
    setPicked(date);
    setDay('pick');
    setSelection(null);
    setCommitted(false);
    setPickOpen(false);
  }

  function chooseLanguage(next: LanguageId) {
    if (next === language) return;
    setLanguage(next);
    setSelection(null);
    setSlotsLoading(true);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => setSlotsLoading(false), 900);
  }

  const summary =
    selection === 'now'
      ? 'A specialist will start your call in under a minute.'
      : `Your specialist call is set for ${selection} ${dayLabel(day, picked)}.`;

  const dayOptions: { id: DayId; label: string; icon?: boolean }[] = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    {
      id: 'pick',
      label: day === 'pick' && picked ? formatPickLabel(picked) : 'Pick',
      icon: true,
    },
  ];

  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-white text-[#0d0d0d]">
      <style>{`
        @keyframes now-pulse {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.75); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(42% 36% at 8% 100%, rgba(255, 186, 198, 0.55), transparent 70%), radial-gradient(46% 40% at 92% 88%, rgba(168, 196, 255, 0.62), transparent 68%), radial-gradient(28% 24% at 62% 100%, rgba(214, 196, 255, 0.35), transparent 70%)',
        }}
      />

      <header className="flex items-center justify-between bg-white px-6 py-3 md:px-16 md:py-5">
        <SwordLogo className="h-6 w-auto" />
        <div className="hidden items-center gap-6 md:flex">
          <span className="inline-flex items-center gap-2 text-[14px] leading-5 text-black">
            <Globe className="size-6" strokeWidth={1.5} aria-hidden />
            <span className="font-semibold">
              US <span className="font-normal">(EN)</span>
            </span>
            <ChevronDown className="size-4" strokeWidth={1.5} aria-hidden />
          </span>
          <Accessibility className="size-6" strokeWidth={1.5} aria-hidden />
          <span className="inline-flex items-center gap-2 text-[14px] leading-5 font-semibold text-[#1f222c]">
            Account
            <ChevronDown className="size-5" strokeWidth={1.5} aria-hidden />
          </span>
        </div>
        <button
          type="button"
          aria-label="Menu"
          className="grid size-10 place-items-center md:hidden"
        >
          <Menu className="size-6" strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      <main className="mx-auto flex w-full flex-1 flex-col px-6 pt-6 pb-40 md:max-w-[560px] md:px-0 md:pt-8 md:pb-28">
        {committed && selection ? (
          <div className="pt-16 text-center">
            <h1 className="font-serif text-[26px] leading-8 font-normal">
              You&apos;re booked.
            </h1>
            <p className="mt-4 text-[16px] leading-[22px] text-[#1f222c]">
              {summary}
            </p>
            <button
              type="button"
              onClick={() => setCommitted(false)}
              className="mt-8 cursor-pointer text-[14px] leading-5 font-semibold text-[#4a89e8] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]"
            >
              Change time
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              <h1 className="font-serif text-[26px] leading-8 font-normal text-[#0d0d0d]">
                Pick a slot that works for you, or meet with your specialist
                now.
              </h1>
              <p className="text-[16px] leading-[22px] text-[#1f222c]">
                Your specialist will listen to your goals and build a plan
                together with you.
              </p>
            </div>

            <div className="relative mt-8 flex flex-wrap gap-2 md:mt-10">
              {dayOptions.map((option) => {
                const selected = day === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => chooseDay(option.id)}
                    className={cn(
                      'inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[16px] leading-[22px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]',
                      selected
                        ? 'bg-[#0d0d0d] text-white'
                        : 'bg-[#f2f2f2] text-[#0d0d0d] hover:bg-[#e8e8e8]',
                    )}
                  >
                    {option.icon ? (
                      <Calendar
                        className="size-5"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    ) : null}
                    {option.label}
                  </button>
                );
              })}
              {pickOpen ? (
                <div className="absolute top-12 left-0 z-10 w-56 rounded-2xl border border-[#e8e8e8] bg-white p-2 shadow-[0_12px_40px_rgba(20,20,40,0.12)]">
                  <p className="px-2 py-1.5 text-[12px] leading-[18px] font-semibold text-[#5e5e5e]">
                    Choose a date
                  </p>
                  {PICK_DATES.map((date) => {
                    const selected =
                      picked?.toDateString() === date.toDateString();
                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => chooseDate(date)}
                        className={cn(
                          'flex h-10 w-full cursor-pointer items-center rounded-xl px-2 text-left text-[14px] leading-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]',
                          selected
                            ? 'bg-[#0d0d0d] text-white'
                            : 'hover:bg-[#f2f2f2]',
                        )}
                      >
                        {formatPickOption(date)}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-8 hidden rounded-3xl border border-[#e8e8e8] bg-white p-6 md:block">
              {slotsLoading ? (
                <PeriodSkeleton />
              ) : (
                <div
                  className="flex flex-wrap gap-6"
                  role="group"
                  aria-label="Time of day"
                >
                  {PERIODS.map((item) => {
                    const selected = period === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setPeriod(item.id)}
                        className={cn(
                          'cursor-pointer text-[14px] leading-5 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414]',
                          selected
                            ? 'text-[#4a89e8]'
                            : 'text-[#0d0d0d] hover:text-[#4a89e8]',
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <div
                className="mt-6 grid grid-cols-3 gap-4"
                aria-busy={slotsLoading}
              >
                {slotsLoading ? (
                  Array.from({ length: 9 }, (_, index) => (
                    <TimeSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {showNow && period === 'best' ? (
                      <TimeChip
                        label="Now"
                        now
                        selected={selection === 'now'}
                        onClick={() => setSelection('now')}
                      />
                    ) : null}
                    {schedule[period].map((time) => (
                      <TimeChip
                        key={time}
                        label={time}
                        selected={selection === time}
                        onClick={() => setSelection(time)}
                      />
                    ))}
                  </>
                )}
              </div>
              <p className="sr-only" aria-live="polite">
                {slotsLoading
                  ? `Loading times for a ${LANGUAGE_ITEMS[language]} specialist.`
                  : ''}
              </p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <CallLanguage value={language} onChange={chooseLanguage} />
                <p className="inline-flex shrink-0 items-center gap-1.5 text-[12px] leading-[18px] text-[#5e5e5e]">
                  <Globe className="size-3.5" strokeWidth={1.5} aria-hidden />
                  Eastern Standard Time (EST)
                </p>
              </div>
            </div>

            <div
              className="mt-8 flex flex-col gap-6 md:hidden"
              aria-busy={slotsLoading}
            >
              {slotsLoading
                ? PERIODS.map((item) => (
                    <section
                      key={item.id}
                      className="flex flex-col gap-4"
                      aria-hidden
                    >
                      <div className="h-5 w-24 animate-pulse rounded-full bg-[#f2f2f2]" />
                      <div className="@container -mx-6 [scrollbar-width:none] overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden">
                        <div className="grid w-max auto-cols-[calc((100cqw-1.5rem)/3)] grid-flow-col gap-3">
                          {Array.from({ length: 3 }, (_, index) => (
                            <TimeSkeleton key={index} />
                          ))}
                        </div>
                      </div>
                    </section>
                  ))
                : PERIODS.map((item) => {
                    const times = schedule[item.id];
                    const includeNow = showNow && item.id === 'best';
                    if (times.length === 0 && !includeNow) return null;
                    return (
                      <section key={item.id} className="flex flex-col gap-4">
                        <h2 className="text-[14px] leading-5 font-semibold text-[#0d0d0d]">
                          {item.label}
                        </h2>
                        <div className="@container -mx-6 [scrollbar-width:none] overflow-x-auto px-6 [&::-webkit-scrollbar]:hidden">
                          <div className="grid w-max auto-cols-[calc((100cqw-1.5rem)/3)] grid-flow-col gap-3">
                            {includeNow ? (
                              <TimeChip
                                label="Now"
                                now
                                selected={selection === 'now'}
                                onClick={() => setSelection('now')}
                              />
                            ) : null}
                            {times.map((time) => (
                              <TimeChip
                                key={time}
                                label={time}
                                selected={selection === time}
                                onClick={() => setSelection(time)}
                              />
                            ))}
                          </div>
                        </div>
                      </section>
                    );
                  })}
              <p className="text-center text-[12px] leading-[18px] text-[#5e5e5e]">
                All times shown are Eastern Standard Time (EST)
              </p>
            </div>
          </>
        )}
      </main>

      {committed ? null : (
        <div className="fixed inset-x-0 bottom-0 z-20 px-6 py-6 md:static md:bg-transparent md:px-0 md:py-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 border-t border-white bg-linear-to-b from-white/64 to-white/80 backdrop-blur-[3px] md:hidden"
          />
          <div className="relative mx-auto flex w-full flex-col gap-4 md:max-w-none md:items-center">
            <CallLanguage
              value={language}
              onChange={chooseLanguage}
              align="center"
              className="text-center text-[#0d0d0d] md:hidden"
            />
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="hidden h-12 min-w-[180px] cursor-pointer items-center justify-center rounded-2xl bg-[#e8e8e8] px-8 text-[14px] leading-5 font-semibold text-[#0d0d0d] md:inline-flex"
              >
                Previous
              </button>
              <button
                type="button"
                aria-label="Previous"
                className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-[#e8e8e8] text-[#0d0d0d] md:hidden"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                disabled={!selection}
                onClick={() => setCommitted(true)}
                className={cn(
                  'h-12 min-w-[180px] flex-1 rounded-2xl px-8 text-[14px] leading-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141414] md:flex-none',
                  selection
                    ? 'cursor-pointer bg-[#4a89e8] hover:bg-[#3b78d6]'
                    : 'cursor-not-allowed bg-[#4a89e8]/50',
                )}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
