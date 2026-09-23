'use client';

import { Mic, Plus, Settings } from 'lucide-react';
import { useEffect, useRef } from 'react';
import sessionCard from './assets/session-card.png';
import { HomeIndicatorSpace } from './device-frame';
import { PairSlot } from './care-team-scenes';
import { LaurenPortrait } from './lauren-portrait';
import { PhoenixOrb } from './phoenix-orb';
import {
  CARE_TEAM_CHAT,
  PT,
  currentArea,
  type Answers,
  type CareTeamMessage,
  type DoorId,
  type StackTurn,
  chatIntro,
  enrollmentChatHistory,
} from './script';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

function messagesFor(
  door: DoorId,
  answers: Answers,
  afterReward: boolean,
): CareTeamMessage[] {
  if (afterReward) return CARE_TEAM_CHAT;

  return chatIntro(door, answers).map((message) => ({
    from: message.from,
    text: message.text,
    time: '8:34 AM',
  }));
}

function SenderMark({ from }: { from: CareTeamMessage['from'] }) {
  if (from === 'Lauren') {
    return (
      <div className="size-6 shrink-0 overflow-hidden rounded-full">
        <LaurenPortrait decorative />
      </div>
    );
  }

  return (
    <div className="size-6 shrink-0">
      <PhoenixOrb mood="breath" className="size-full" />
    </div>
  );
}

function CareBubble({
  message,
  animate = false,
  area = 'Shoulder',
}: {
  message: CareTeamMessage;
  animate?: boolean;
  area?: string;
}) {
  if (message.from === 'member') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-[18px] bg-[#d7e6ff] px-3.5 py-2 text-[#1c2430]">
          <p className="text-[15px] leading-snug">{message.text}</p>
          <p className="mt-1 text-right text-[11px] text-[#5d6b82]">
            {message.time} ✓
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={animate ? 'chat-intro-enter flex items-end gap-2' : 'flex items-end gap-2'}>
      <SenderMark from={message.from} />
      <div className="max-w-[82%] rounded-[18px] bg-white px-3.5 py-2.5 text-[#1c2430] shadow-[0_8px_24px_rgba(80,70,140,0.06)]">
        <p className="text-[13px] font-semibold">{message.from}</p>
        <p className="mt-0.5 text-[15px] leading-snug">{message.text}</p>
        {message.card ? (
          <div className="relative mt-2 h-[132px] overflow-hidden rounded-xl">
            <img
              alt=""
              src={assetSrc(sessionCard)}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-3 top-2 flex items-center justify-between text-[12px] text-white">
              <span>{area}</span>
              <span>Day 1</span>
            </div>
            <p className="absolute inset-x-3 bottom-2 text-[15px] font-medium text-white">
              Your discovery score →
            </p>
          </div>
        ) : null}
        <p className="mt-1 text-right text-[11px] text-[#8b93a0]">{message.time}</p>
      </div>
    </div>
  );
}

export function ChatScene({
  door,
  answers,
  history,
  avatarSlot = false,
  visibleCount,
  afterReward = false,
  sharedPair = false,
}: {
  door: DoorId;
  answers: Answers;
  history: StackTurn[];
  avatarSlot?: boolean;
  visibleCount: number;
  afterReward?: boolean;
  sharedPair?: boolean;
}) {
  const messages = messagesFor(door, answers, afterReward);
  const shown = messages.slice(0, visibleCount);
  const settled = afterReward ? enrollmentChatHistory(answers) : [];
  const area = currentArea(answers);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [shown.length]);

  return (
    <div className="flex h-full flex-col bg-[#f4f7ff]">
      <div className="flex h-[104px] items-end justify-between px-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          {sharedPair ? (
            <PairSlot pose="header" size={32} />
          ) : (
            <div className="flex items-center">
              <div className="relative z-10 size-8">
                {avatarSlot ? null : (
                  <PhoenixOrb mood="breath" className="size-full" />
                )}
              </div>
              <div className="relative -ml-2 size-8 overflow-hidden rounded-full ring-2 ring-[#f4f7ff]">
                <LaurenPortrait decorative />
              </div>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-[#1c2430]">
              Your Care Team
            </p>
            <p className="text-[13px] text-[#6b7280]">
              {PT}, Phoenix, You
            </p>
          </div>
        </div>
        <Settings className="size-5 text-[#6b7280]" aria-hidden />
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
        <p className="text-center text-[13px] text-[#8b93a0]">— Today —</p>
        {afterReward
          ? settled.map((message, index) => (
              <CareBubble
                key={`enrollment-${message.from}-${index}`}
                message={message}
                area={area}
              />
            ))
          : history
              .filter((turn) => turn.role === 'member')
              .slice(-2)
              .map((turn) => (
                <CareBubble
                  key={turn.id}
                  message={{
                    from: 'member',
                    text: turn.text,
                    time: '8:34 AM',
                  }}
                  area={area}
                />
              ))}
        {shown.map((message, index) => (
          <CareBubble
            key={`${message.from}-${index}`}
            message={message}
            animate={afterReward}
            area={area}
          />
        ))}
      </div>
      <div className="px-3 pt-2 pb-1">
        <div className="flex h-12 items-center gap-2 rounded-full bg-white px-3 shadow-[0_8px_24px_rgba(80,70,140,0.08)]">
          <Plus className="size-5 text-[#1c2430]" aria-hidden />
          <span className="flex-1 text-[15px] text-[#8b93a0]">
            Talk with Phoenix
          </span>
          <Mic className="size-5 text-[#1c2430]" aria-hidden />
          <span className="flex size-8 items-center justify-center rounded-full bg-[#eceff4] text-[#1c2430]">
            ↑
          </span>
        </div>
      </div>
      <HomeIndicatorSpace />
    </div>
  );
}
