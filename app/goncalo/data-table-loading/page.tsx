'use client';

import { Avatar, AvatarFallback } from '@/design/components/avatar';
import { Input } from '@/design/components/input';
import { cn } from '@/design/utils';
import { Select } from '@base-ui/react/select';
import { Tabs } from '@base-ui/react/tabs';
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import {
  PAGE_SIZES,
  paginationItems,
  PROGRAMS,
  queryPatients,
  type Patient,
  type PatientQuery,
  type PatientResult,
  type ProgramFilter,
  type StatusFilter,
} from './data';

const FETCH_DELAY_MS = 700;
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'closed', label: 'Closed' },
];

const PROGRAM_ITEMS = {
  all: 'All programs',
  Thrive: 'Thrive',
  Bloom: 'Bloom',
  Pulse: 'Pulse',
  Mind: 'Mind',
} as const;

const INITIAL_QUERY: PatientQuery = {
  search: '',
  status: 'all',
  program: 'all',
  page: 1,
  pageSize: 10,
};

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function dash(value: string | number | null | undefined) {
  if (value == null || value === '') {
    return '–';
  }
  return value;
}

export default function DataTableLoading() {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<PatientQuery>(INITIAL_QUERY);
  const [result, setResult] = useState<PatientResult>(() =>
    queryPatients(INITIAL_QUERY),
  );
  const [pending, setPending] = useState(false);
  const lastFetchedKey = useRef(JSON.stringify(INITIAL_QUERY));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setQuery((current) =>
        current.search === searchInput
          ? current
          : { ...current, search: searchInput, page: 1 },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const key = JSON.stringify(query);
    if (key === lastFetchedKey.current) {
      return;
    }

    let cancelled = false;
    setPending(true);

    const timeout = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
      lastFetchedKey.current = key;
      setResult(queryPatients(query));
      setPending(false);
    }, FETCH_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const pageCount = Math.max(
    1,
    Math.ceil(result.total / query.pageSize) || 1,
    query.page,
  );

  function updateQuery(patch: Partial<PatientQuery>) {
    setQuery((current) => ({ ...current, ...patch }));
  }

  return (
    <div className="bg-background-neutral-default text-foreground-neutral-default min-h-dvh px-6 py-10 md:px-16">
      <div className="sr-only" aria-live="polite">
        {pending ? 'Loading patients' : null}
      </div>

      <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6">
        <div className="relative">
          <Search
            className="text-foreground-neutral-faded pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by patient name"
            aria-label="Search by patient name"
            className="rounded-2xl py-4 pr-4 pl-12"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <Tabs.Root
              value={query.status}
              onValueChange={(value) => {
                updateQuery({ status: value as StatusFilter, page: 1 });
              }}
              className="min-w-0 flex-1"
            >
              <Tabs.List className="flex items-center">
                {STATUS_TABS.map((tab) => (
                  <Tabs.Tab
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      'text-body-medium-strong text-foreground-neutral-faded relative cursor-pointer px-4 pb-3',
                      'data-active:text-foreground-neutral-default',
                      'after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-transparent',
                      'data-active:after:bg-background-brand-default',
                    )}
                  >
                    {tab.label}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.Root>

            <ProgramSelect
              value={query.program}
              onValueChange={(program) =>
                updateQuery({ program, page: 1 })
              }
            />
          </div>
          <div className="bg-border-neutral-subtle h-px w-full" />
        </div>

        <div className="border-border-neutral-subtle overflow-hidden rounded-2xl border bg-white">
          <div className="overflow-x-auto p-4">
            <table
              className="w-full min-w-[960px] table-fixed border-separate border-spacing-0"
              aria-busy={pending}
            >
              <colgroup>
                <col className="w-[240px]" />
                <col />
                <col />
                <col className="w-[120px]" />
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  {[
                    'Patient',
                    'Start Date',
                    'Time to Care',
                    'Sessions',
                    'PGIC',
                    'Mission Readiness',
                    'Therapy Area',
                  ].map((heading, index, headings) => (
                    <th
                      key={heading}
                      className={cn(
                        'bg-background-neutral-faded text-body-medium-strong text-foreground-neutral-faded border-border-neutral-subtle h-11 border-b px-6 py-3 text-left font-semibold whitespace-nowrap',
                        index === 0 && 'rounded-tl-lg',
                        index === headings.length - 1 && 'rounded-tr-lg',
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending ? (
                  Array.from({ length: query.pageSize }, (_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : result.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-body-medium-default text-foreground-neutral-faded px-6 py-16 text-center"
                    >
                      No patients match these filters
                    </td>
                  </tr>
                ) : (
                  result.rows.map((patient) => (
                    <PatientRow key={patient.id} patient={patient} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-4 px-4 pb-4">
            <div className="text-body-medium-subtle min-w-[88px]">
              {pending ? (
                <span className="bg-background-neutral-subtle inline-block h-4 w-16 animate-pulse rounded" />
              ) : (
                <p>
                  {result.total === 0 ? (
                    <>
                      <span>0 </span>
                      <span className="text-foreground-neutral-faded">of</span>
                      <span> 0</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {result.from}–{result.to}{' '}
                      </span>
                      <span className="text-foreground-neutral-faded">of</span>
                      <span> {result.total}</span>
                    </>
                  )}
                </p>
              )}
            </div>

            <Pagination
              page={query.page}
              pageCount={pageCount}
              onPageChange={(page) => updateQuery({ page })}
            />

            <div className="ml-auto flex items-center gap-2">
              <span className="text-body-medium-subtle">Show</span>
              <PageSizeSelect
                value={query.pageSize}
                onValueChange={(pageSize) =>
                  updateQuery({ pageSize, page: 1 })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientRow({ patient }: { patient: Patient }) {
  const invited = patient.status === 'invited';

  return (
    <tr className={invited ? 'bg-background-neutral-faded' : 'bg-white'}>
      <Cell>
        <div className="flex items-center gap-2">
          <Avatar
            className={cn(
              'size-8',
              invited && 'bg-[linear-gradient(to_right,#fff2f3,#eaf2fe)] text-[#4a89e8]',
            )}
          >
            <AvatarFallback className="text-body-small-strong">
              {initials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-body-medium-default truncate">{patient.name}</p>
            {patient.status === 'closed' && patient.closedOn ? (
              <p className="text-body-medium-default text-foreground-neutral-faded truncate">
                Closed {patient.closedOn}
              </p>
            ) : null}
            {invited && patient.invitedOn ? (
              <p className="text-body-medium-default text-foreground-neutral-faded truncate">
                Invited {patient.invitedOn}
              </p>
            ) : null}
          </div>
        </div>
      </Cell>
      <Cell>{dash(patient.startDate)}</Cell>
      <Cell>{dash(patient.timeToCare)}</Cell>
      <Cell>{dash(patient.sessions)}</Cell>
      <Cell>
        {patient.pgic == null ? (
          '–'
        ) : (
          <ScorePill value={patient.pgic} tone={patient.pgic >= 5 ? 'positive' : 'negative'} />
        )}
      </Cell>
      <Cell>
        {patient.missionReady == null ? (
          '–'
        ) : (
          <div className="flex items-center gap-1">
            <ScorePill
              value={`${patient.missionReady}%`}
              tone={patient.missionReady >= 50 ? 'positive' : 'negative'}
            />
            {patient.missionDelta != null ? (
              <span className="text-body-small-strong flex items-center gap-1 text-[#2c6f2c]">
                <ArrowUpRight className="size-3" strokeWidth={2.5} />
                {patient.missionDelta}%
              </span>
            ) : null}
          </div>
        )}
      </Cell>
      <Cell>
        {invited ? (
          <button
            type="button"
            className="bg-background-neutral-subtle text-body-small-strong h-8 rounded-lg px-4 whitespace-nowrap"
          >
            Resend invite
          </button>
        ) : (
          dash(patient.therapyArea)
        )}
      </Cell>
    </tr>
  );
}

function Cell({ children }: { children: ReactNode }) {
  return (
    <td className="text-body-medium-default border-border-neutral-subtle h-16 border-b px-6 py-4 align-middle whitespace-nowrap">
      {children}
    </td>
  );
}

function ScorePill({
  value,
  tone,
}: {
  value: string | number;
  tone: 'positive' | 'negative';
}) {
  return (
    <span
      className={cn(
        'text-body-medium-subtle inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5',
        tone === 'positive' && 'bg-[#e6f9e6] text-[#2c6f2c]',
        tone === 'negative' && 'bg-[#fff2f3] text-[#c52424]',
      )}
    >
      {value}
    </span>
  );
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'bg-background-neutral-subtle inline-block h-3.5 animate-pulse rounded',
        className,
      )}
    />
  );
}

function SkeletonRow() {
  return (
    <tr>
      <Cell>
        <div className="flex items-center gap-2">
          <span className="bg-background-neutral-subtle size-8 shrink-0 animate-pulse rounded-full" />
          <span className="flex flex-col gap-1.5">
            <SkeletonBar className="w-28" />
            <SkeletonBar className="h-3 w-20" />
          </span>
        </div>
      </Cell>
      <Cell>
        <SkeletonBar className="w-20" />
      </Cell>
      <Cell>
        <SkeletonBar className="w-14" />
      </Cell>
      <Cell>
        <SkeletonBar className="w-6" />
      </Cell>
      <Cell>
        <SkeletonBar className="h-5 w-8 rounded-full" />
      </Cell>
      <Cell>
        <SkeletonBar className="h-5 w-12 rounded-full" />
      </Cell>
      <Cell>
        <SkeletonBar className="w-16" />
      </Cell>
    </tr>
  );
}

function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const items = paginationItems(page, pageCount);

  return (
    <div className="flex flex-1 items-center justify-center gap-2">
      <PageButton
        label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-5" strokeWidth={1.5} />
      </PageButton>
      <div className="flex items-start gap-1">
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="text-body-medium-strong flex size-10 items-center justify-center"
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              label={`Page ${item}`}
              current={item === page}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}
      </div>
      <PageButton
        label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-5" strokeWidth={1.5} />
      </PageButton>
    </div>
  );
}

function PageButton({
  children,
  label,
  current = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'text-body-medium-strong flex size-10 items-center justify-center rounded-full',
        current && 'bg-background-neutral-subtle',
        disabled
          ? 'text-foreground-neutral-faded cursor-not-allowed'
          : 'hover:bg-background-neutral-subtle cursor-pointer',
      )}
    >
      {children}
    </button>
  );
}

function ProgramSelect({
  value,
  onValueChange,
}: {
  value: ProgramFilter;
  onValueChange: (value: ProgramFilter) => void;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) {
          onValueChange(next);
        }
      }}
      items={PROGRAM_ITEMS}
      modal={false}
    >
      <Select.Trigger className="border-border-neutral-default text-body-medium-subtle flex h-12 cursor-pointer items-center gap-4 rounded-2xl border px-4 whitespace-nowrap">
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-6" strokeWidth={1.5} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={8} align="end">
          <Select.Popup className="z-50 w-[200px] overflow-hidden rounded-2xl bg-white py-2 shadow-[0_6px_17px_rgba(31,34,44,0.07)]">
            <Select.Item
              value="all"
              className="text-body-medium-subtle data-highlighted:bg-background-neutral-faded flex cursor-pointer items-center px-4 py-3 outline-none"
            >
              <Select.ItemText>All programs</Select.ItemText>
            </Select.Item>
            {PROGRAMS.map((program) => (
              <Select.Item
                key={program}
                value={program}
                className="text-body-medium-subtle data-highlighted:bg-background-neutral-faded flex cursor-pointer items-center px-4 py-3 outline-none"
              >
                <Select.ItemText>{program}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function PageSizeSelect({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (typeof next === 'number') {
          onValueChange(next);
        }
      }}
      modal={false}
    >
      <Select.Trigger className="bg-background-neutral-subtle text-body-small-strong flex h-8 cursor-pointer items-center rounded-lg px-2">
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="size-5" strokeWidth={1.5} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={4} align="end">
          <Select.Popup className="z-50 min-w-16 overflow-hidden rounded-xl bg-white py-1 shadow-[0_6px_17px_rgba(31,34,44,0.07)]">
            {PAGE_SIZES.map((size) => (
              <Select.Item
                key={size}
                value={size}
                className="text-body-small-strong data-highlighted:bg-background-neutral-faded flex cursor-pointer justify-center px-3 py-2 outline-none"
              >
                <Select.ItemText>{size}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
