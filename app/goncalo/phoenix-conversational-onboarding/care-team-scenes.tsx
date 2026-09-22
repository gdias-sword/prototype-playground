'use client';

import { useEffect, useRef } from 'react';
import pt1 from './assets/pts/pt-1.png';
import pt2 from './assets/pts/pt-2.png';
import pt3 from './assets/pts/pt-3.png';
import pt4 from './assets/pts/pt-4.png';
import pt5 from './assets/pts/pt-5.png';
import pt6 from './assets/pts/pt-6.png';
import pt7 from './assets/pts/pt-7.png';
import pt8 from './assets/pts/pt-8.png';
import sessionCard from './assets/session-card.png';
import { PhoenixOrb } from './phoenix-orb';
import { PrimaryAction } from './extended-scenes';
import { LaurenPortrait } from './lauren-portrait';
import {
  CHAT_INTRO_BUBBLES,
  CHAT_INTRO_HINT,
  CHAT_INTRO_TITLE,
  NOTIFY_BODY,
  NOTIFY_PREVIEW,
  NOTIFY_SKIP,
  NOTIFY_TITLE,
  NOTIFY_YES,
  PT,
  PT_MEET_QUOTE,
  PT_MEET_STAT,
  PT_REVEAL_LINES,
  chatTransitionLine,
} from './script';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const RING = [
  { src: pt5, x: 240, y: 0, fade: 0.55 },
  { src: pt6, x: 400, y: 80, fade: 0.72 },
  { src: pt2, x: 440, y: 240, fade: 1 },
  { src: pt3, x: 400, y: 400, fade: 0.85 },
  { src: pt7, x: 240, y: 480, fade: 1 },
  { src: pt4, x: 80, y: 400, fade: 0.8 },
  { src: pt8, x: 40, y: 236, fade: 0.7 },
  { src: pt1, x: 80, y: 80, fade: 0.9 },
] as const;

export function OsPermissionDialog({
  title,
  body,
  onAllow,
  onDeny,
}: {
  title: string;
  body: string;
  onAllow: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 px-8">
      <div className="w-full max-w-[270px] rounded-[14px] bg-[#f2f2f7]/95 px-4 pt-4 pb-3 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <p className="text-[17px] leading-snug font-semibold tracking-[-0.02em] text-black">
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-snug text-black/80">{body}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onDeny}
            className="h-11 flex-1 cursor-pointer rounded-full bg-[#e5e5ea] text-[17px] text-black"
          >
            Don&apos;t allow
          </button>
          <button
            type="button"
            onClick={onAllow}
            className="h-11 flex-1 cursor-pointer rounded-full bg-[#007aff] text-[17px] font-semibold text-white"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}

function DualAvatar({ size = 80 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size + size * 0.75, height: size }}>
      <div
        className="absolute top-0 left-0 overflow-visible"
        style={{ width: size, height: size }}
      >
        <PhoenixOrb mood="breath" className="size-full" />
      </div>
      <div
        className="absolute top-0 overflow-hidden rounded-full bg-[#d7e8fb] ring-4 ring-white"
        style={{ left: size * 0.75, width: size, height: size }}
      >
        <LaurenPortrait decorative />
      </div>
    </div>
  );
}

function AvatarRing() {
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2 size-[560px] -translate-x-1/2 -translate-y-[46%]">
      {RING.map((avatar) => (
        <div
          key={`${avatar.x}-${avatar.y}`}
          className="absolute size-20 overflow-hidden rounded-full bg-[#d7e8fb]"
          style={{ left: avatar.x, top: avatar.y, opacity: avatar.fade }}
        >
          <img
            alt=""
            src={assetSrc(avatar.src)}
            className="size-full object-cover object-[center_18%]"
          />
        </div>
      ))}
    </div>
  );
}

export function PtRevealScene({
  beat,
  fastDemo,
  onAdvance,
  onContinue,
}: {
  beat: 0 | 1 | 2;
  fastDemo: boolean;
  onAdvance: () => void;
  onContinue: () => void;
}) {
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  useEffect(() => {
    if (beat === 2) return;
    const id = window.setTimeout(
      () => onAdvanceRef.current(),
      fastDemo ? 0 : 1700,
    );
    return () => window.clearTimeout(id);
  }, [beat, fastDemo]);

  if (beat === 2) {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-16">
        <div className="flex flex-1 flex-col items-center pt-6 text-center">
          <div className="size-[120px] overflow-hidden rounded-full bg-[#d7e8fb]">
            <img
              alt={PT}
              src={assetSrc(pt1)}
              className="size-full object-cover object-[center_18%]"
            />
          </div>
          <h1 className="text-display-small-strong text-foreground-neutral-default mt-8 font-serif font-medium tracking-[-0.04em]">
            Meet <span className="text-[#4a89e8]">{PT}</span>, your
            <br />
            Physical Therapist
          </h1>
          <p className="text-body-large-default text-foreground-neutral-default mt-3">
            {PT_MEET_STAT}
          </p>
          <p className="text-body-large-default text-foreground-neutral-faded mt-8 max-w-[280px] font-serif italic">
            {PT_MEET_QUOTE}
          </p>
        </div>
        <div className="mt-auto w-full pt-4 pb-2">
          <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <AvatarRing />
      <div className="relative z-10 flex w-[280px] flex-col items-center gap-4 text-center">
        <div className="size-10">
          <PhoenixOrb mood="breath" className="size-full" />
        </div>
        <h1 className="text-display-small-strong text-foreground-neutral-default font-serif font-medium tracking-[-0.04em]">
          {PT_REVEAL_LINES[beat]}
        </h1>
      </div>
    </div>
  );
}

function IntroBubble({
  from,
  text,
}: {
  from: 'member' | 'Phoenix' | 'Lauren';
  text: string;
}) {
  if (from === 'member') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[240px] rounded-2xl bg-[#d9e7ff] px-3 py-2 text-left text-[15px] leading-snug text-[#1c2430]">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      {from === 'Lauren' ? (
        <div className="size-9 shrink-0 overflow-hidden rounded-full">
          <LaurenPortrait decorative />
        </div>
      ) : (
        <div className="size-9 shrink-0">
          <PhoenixOrb mood="breath" className="size-full" />
        </div>
      )}
      <p className="max-w-[240px] rounded-2xl bg-white px-3 py-2 text-left text-[15px] leading-snug text-[#1c2430] shadow-[0_8px_24px_rgba(80,70,140,0.08)]">
        {from === 'Phoenix' ? (
          <>
            Thanks for telling me. I&apos;m sharing this with{' '}
            <span className="text-[#4a89e8]">{PT}</span> so she can review your
            session.
          </>
        ) : (
          text
        )}
      </p>
    </div>
  );
}

export function ChatIntroScene({
  beat,
  onContinue,
}: {
  beat: 0 | 1 | 2 | 3;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-2">
      <div className="flex flex-col items-center text-center">
        <DualAvatar />
        <h1 className="text-display-small-strong text-foreground-neutral-default mt-6 font-serif font-medium tracking-[-0.04em]">
          {CHAT_INTRO_TITLE}
        </h1>
        <p className="text-body-large-default text-foreground-neutral-default mt-3 max-w-[300px]">
          {CHAT_INTRO_HINT}
        </p>
      </div>
      <div className="mt-8 flex flex-1 flex-col justify-end gap-3 pb-4">
        {CHAT_INTRO_BUBBLES.slice(0, Math.min(beat + 1, 3)).map((bubble) => (
          <IntroBubble key={bubble.from} from={bubble.from} text={bubble.text} />
        ))}
        {beat === 3 ? (
          <div className="ml-11 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(80,70,140,0.08)]">
            <p className="px-3 pt-3 text-left text-[15px] leading-snug text-[#1c2430]">
              Ready to start your next session?
            </p>
            <div className="relative mx-3 mt-2 mb-3 h-[92px] overflow-hidden rounded-xl">
              <img
                alt=""
                src={assetSrc(sessionCard)}
                className="size-full object-cover"
              />
              <span className="absolute inset-x-3 bottom-2 text-left text-[15px] font-medium text-white">
                Start Session →
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-auto w-full pt-2 pb-2">
        <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
      </div>
    </div>
  );
}

export function NotifyScene({
  onYes,
  onSkip,
}: {
  onYes: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <div className="flex flex-col items-center text-center">
        <DualAvatar />
        <h1 className="text-display-small-strong text-foreground-neutral-default mt-8 font-serif font-medium tracking-[-0.04em]">
          {NOTIFY_TITLE}
        </h1>
        <p className="text-body-large-default text-foreground-neutral-default mt-3 max-w-[320px]">
          {NOTIFY_BODY}
        </p>
      </div>
      <div className="relative mx-auto mt-6 h-[220px] w-[220px]">
        <div className="absolute inset-x-6 top-2 h-[200px] rounded-[28px] border border-[#d5dbe6] bg-white/40" />
        <div className="absolute inset-x-10 top-8 flex justify-between">
          <span className="size-10 rounded-xl bg-[#e7ebf2]" />
          <span className="size-10 rounded-xl bg-[#e7ebf2]" />
          <span className="size-10 rounded-xl bg-[#e7ebf2]" />
        </div>
        <div className="absolute inset-x-2 top-[108px] flex items-center gap-2 rounded-2xl bg-white px-2.5 py-2 shadow-[0_10px_24px_rgba(40,50,80,0.12)]">
          <div className="size-9 shrink-0 overflow-hidden rounded-full">
            <LaurenPortrait decorative />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-[13px] font-semibold text-[#1c2430]">{PT}</p>
            <p className="truncate text-[12px] text-[#5c6570]">{NOTIFY_PREVIEW}</p>
          </div>
          <span className="ml-auto text-[11px] text-[#8b93a0]">now</span>
        </div>
      </div>
      <div className="mt-auto flex w-full flex-col items-center gap-3 pt-4 pb-2">
        <PrimaryAction onClick={onYes}>{NOTIFY_YES}</PrimaryAction>
        <button
          type="button"
          onClick={onSkip}
          className="text-body-large-strong text-foreground-neutral-default h-11 cursor-pointer"
        >
          {NOTIFY_SKIP}
        </button>
      </div>
    </div>
  );
}

export function ChatTransitionScene({
  fastDemo,
  onDone,
}: {
  fastDemo: boolean;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const id = window.setTimeout(() => onDoneRef.current(), fastDemo ? 400 : 1600);
    return () => window.clearTimeout(id);
  }, [fastDemo]);

  const [lead, trail] = chatTransitionLine().split('\n');

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
      <DualAvatar size={96} />
      <h1 className="text-display-small-strong text-foreground-neutral-default mt-8 font-serif font-medium tracking-[-0.04em]">
        {lead}
        <br />
        {trail}
      </h1>
    </div>
  );
}
