'use client';

import { mergeTailwindClasses as cn } from '@/design/utils';
import { useEffect, useMemo, useState } from 'react';
import { GlassChip, GlassField } from './glass';
import {
  BODY_AREAS,
  DOORS,
  type Answers,
  type DoorId,
  areaQuestion,
  durationQuestion,
  followUpQuestion,
  intensityQuestion,
  doorsLine,
  DURATIONS,
  GUIDE_LINES,
} from './script';

export type PhoenixStep =
  | { kind: 'guide'; index: 0 | 1 }
  | { kind: 'know'; index: 0 | 1 | 2 | 3 }
  | { kind: 'doors' };

function SpokenLine({
  text,
  faded,
  appearKey,
}: {
  text: string;
  faded?: boolean;
  appearKey: string;
}) {
  return (
    <p
      key={appearKey}
      className={cn(
        'text-foreground-neutral-default font-serif text-[26px] leading-[32px] font-medium tracking-[-0.04em]',
        faded && 'text-foreground-neutral-faded text-[18px] leading-6',
      )}
      style={{
        animation: faded
          ? 'line-out 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards'
          : 'line-in 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {text}
    </p>
  );
}

function ToolShell({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) {
  if (!show) return <div className="h-0" />;

  return (
    <div
      className="mt-6"
      style={{ animation: 'rise-in 600ms cubic-bezier(0.22, 1, 0.36, 1) both' }}
    >
      {children}
    </div>
  );
}

function AreaTool({ onCommit }: { onCommit: (area: string) => void }) {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BODY_AREAS.slice(0, 5);
    return BODY_AREAS.filter((area) => area.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <GlassField
        autoFocus
        value={query}
        placeholder="e.g. neck, shoulder…"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="flex flex-col gap-2">
        {matches.map((area) => (
          <GlassChip key={area} onClick={() => onCommit(area)}>
            {area}
          </GlassChip>
        ))}
      </div>
    </div>
  );
}

function DurationTool({ onCommit }: { onCommit: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {DURATIONS.map((item) => (
        <GlassChip key={item} onClick={() => onCommit(item)}>
          {item}
        </GlassChip>
      ))}
    </div>
  );
}

function IntensityTool({ onCommit }: { onCommit: (value: number) => void }) {
  const [value, setValue] = useState(5);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/45" />
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#c5d0ff,#ffb5a6)]"
            style={{ width: `${(value / 10) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={10}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="absolute inset-0 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-12 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/80 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_8px_24px_rgba(80,70,140,0.18)]"
          />
        </div>
        <div className="text-body-small-default text-foreground-neutral-faded mt-2 flex justify-between">
          <span>No pain</span>
          <span>Worst pain</span>
        </div>
      </div>
      <GlassChip
        className="text-center"
        onClick={() => onCommit(value)}
      >{`Continue · ${value}`}</GlassChip>
    </div>
  );
}

function YesNoTool({ onCommit }: { onCommit: (value: boolean) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <GlassChip onClick={() => onCommit(true)}>Yes</GlassChip>
      <GlassChip onClick={() => onCommit(false)}>No</GlassChip>
    </div>
  );
}

function DoorsTool({ onCommit }: { onCommit: (id: DoorId) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {DOORS.map((door) => (
        <GlassChip key={door.id} onClick={() => onCommit(door.id)}>
          {door.label}
        </GlassChip>
      ))}
    </div>
  );
}

export function PhoenixCopy({
  step,
  answers,
  toolReady,
  previous,
  onGuideAdvance,
  onArea,
  onDuration,
  onIntensity,
  onTingling,
  onDoor,
}: {
  step: PhoenixStep;
  answers: Answers;
  toolReady: boolean;
  previous: string | null;
  onGuideAdvance: () => void;
  onArea: (area: string) => void;
  onDuration: (value: string) => void;
  onIntensity: (value: number) => void;
  onTingling: (value: boolean) => void;
  onDoor: (id: DoorId) => void;
}) {
  const line =
    step.kind === 'guide'
      ? GUIDE_LINES[step.index]
      : step.kind === 'doors'
        ? doorsLine()
        : step.index === 0
          ? areaQuestion()
          : step.index === 1
            ? durationQuestion(answers.area ?? 'That')
            : step.index === 2
              ? intensityQuestion(answers.duration ?? 'Okay')
              : followUpQuestion(answers.area ?? 'Neck');

  const showTool = toolReady && step.kind !== 'guide';

  return (
    <div
      className="flex flex-1 flex-col px-5 pt-2"
      onClick={step.kind === 'guide' ? onGuideAdvance : undefined}
    >
      <div className="min-h-[92px]">
        {previous ? (
          <SpokenLine faded appearKey={`prev-${previous}`} text={previous} />
        ) : null}
        <SpokenLine appearKey={line} text={line} />
      </div>
      <ToolShell show={showTool}>
        {step.kind === 'know' && step.index === 0 ? (
          <AreaTool onCommit={onArea} />
        ) : null}
        {step.kind === 'know' && step.index === 1 ? (
          <DurationTool onCommit={onDuration} />
        ) : null}
        {step.kind === 'know' && step.index === 2 ? (
          <IntensityTool onCommit={onIntensity} />
        ) : null}
        {step.kind === 'know' && step.index === 3 ? (
          <YesNoTool onCommit={onTingling} />
        ) : null}
        {step.kind === 'doors' ? <DoorsTool onCommit={onDoor} /> : null}
      </ToolShell>
    </div>
  );
}

export function useDelayedTool(readyWhen: boolean, delay = 700) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!readyWhen) {
      setShow(false);
      return;
    }
    const id = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(id);
  }, [readyWhen, delay]);

  return show;
}
