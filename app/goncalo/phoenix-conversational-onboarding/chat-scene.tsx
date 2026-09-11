'use client';

import { cn } from '@/design/utils';
import { useEffect, useRef } from 'react';
import {
  MEMBER,
  PT,
  type Answers,
  type DoorId,
  type StackTurn,
  chatIntro,
} from './script';
import { HomeIndicatorSpace } from './device-frame';
import { GlassField } from './glass';
import { LaurenPortrait } from './lauren-portrait';

function Avatar({
  kind,
  className,
}: {
  kind: 'lauren' | 'alex' | 'slot';
  className?: string;
}) {
  if (kind === 'slot')
    return <div className={cn('size-8 shrink-0', className)} />;

  if (kind === 'lauren') {
    return (
      <div
        className={cn(
          'size-8 shrink-0 overflow-hidden rounded-full',
          className,
        )}
      >
        <LaurenPortrait />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e8eef6] text-[12px] font-semibold text-[#4a5568]',
        className,
      )}
    >
      {MEMBER[0]}
    </div>
  );
}

function HistoryTurn({
  turn,
  avatarSlot,
  index,
}: {
  turn: StackTurn;
  avatarSlot: boolean;
  index: number;
}) {
  if (turn.role === 'member') {
    return (
      <div
        className="flex justify-end"
        style={{
          animation: 'rise-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
          animationDelay: `${index * 30}ms`,
        }}
      >
        <div className="text-body-medium-default text-foreground-neutral-strong max-w-[80%] rounded-[20px] bg-[#e8f0ff] px-3.5 py-2.5">
          {turn.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-end gap-2"
      style={{
        animation: 'rise-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        animationDelay: `${index * 30}ms`,
      }}
    >
      {avatarSlot ? (
        <div className="size-6" />
      ) : (
        <div className="size-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffb3a4,#8ea2f5)]" />
      )}
      <div className="max-w-[82%] rounded-[20px] bg-white/80 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(80,70,140,0.06)] backdrop-blur-xl">
        <p className="text-body-small-subtle text-foreground-neutral-faded">
          Phoenix
        </p>
        <p className="text-body-medium-default text-foreground-neutral-strong">
          {turn.text}
        </p>
      </div>
    </div>
  );
}

export function ChatScene({
  door,
  answers,
  history,
  avatarSlot,
  visibleCount,
  afterReward = false,
}: {
  door: DoorId;
  answers: Answers;
  history: StackTurn[];
  avatarSlot: boolean;
  visibleCount: number;
  afterReward?: boolean;
}) {
  const messages = chatIntro(door, answers, { afterReward });
  const shown = messages.slice(0, visibleCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [shown.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[104px] items-end gap-3 px-4 pb-3">
        <div className="flex items-center">
          <Avatar kind="lauren" className="relative z-20" />
          {avatarSlot ? (
            <div className="relative z-10 -ml-2 size-8" />
          ) : (
            <div className="relative z-10 -ml-2 size-8 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffb3a4,#8ea2f5)]" />
          )}
          <Avatar kind="alex" className="relative -ml-2" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-body-medium-strong text-foreground-neutral-default">
            Your Care Team
          </p>
          <p className="text-body-small-default text-foreground-neutral-faded">
            {PT}, Phoenix, You
          </p>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 pt-2 pb-2"
      >
        <p className="text-body-small-default text-foreground-neutral-faded text-center">
          Today
        </p>
        {history.map((turn, index) => (
          <HistoryTurn
            key={turn.id}
            turn={turn}
            avatarSlot={avatarSlot}
            index={index}
          />
        ))}
        {shown.map((message, index) => (
          <div
            key={`${message.from}-${index}`}
            className="flex items-end gap-2"
            style={{
              animation: 'rise-in 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
              animationDelay: `${80 + index * 80}ms`,
            }}
          >
            {message.from === 'Phoenix' ? (
              avatarSlot ? (
                <div className="size-6" />
              ) : (
                <div className="size-6 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffb3a4,#8ea2f5)]" />
              )
            ) : (
              <Avatar kind="lauren" className="size-6 text-[10px]" />
            )}
            <div className="max-w-[82%] rounded-[20px] bg-white/80 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(80,70,140,0.06)] backdrop-blur-xl">
              <p className="text-body-small-subtle text-foreground-neutral-faded">
                {message.from}
              </p>
              <p className="text-body-medium-default text-foreground-neutral-strong">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 pt-4 pb-2">
        <GlassField readOnly placeholder="Talk with Phoenix" />
      </div>
      <HomeIndicatorSpace />
    </div>
  );
}
