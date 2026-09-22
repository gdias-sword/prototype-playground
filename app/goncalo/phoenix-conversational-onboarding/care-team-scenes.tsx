'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import arrowRight from './assets/ic-arrow-narrow-right.svg';
import phoneChrome from './assets/phone-chrome.svg';
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
import { ptQuoteLines } from './pt-quote-paths';
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
  PT_REVEAL_LINES,
  chatTransitionLine,
} from './script';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

const RING = [
  { src: pt1, hero: true },
  { src: pt3, hero: false },
  { src: pt7, hero: false },
  { src: pt4, hero: false },
  { src: pt8, hero: false },
  { src: pt6, hero: false },
  { src: pt5, hero: false },
  { src: pt2, hero: false },
] as const;

const ORBIT_RADIUS = 198;
const SPIN_DEG_PER_MS = 0.05;
const SEARCH_BEAT_MS = 2300;
const GATHER_MS = 920;

const MEET_WORDS = [
  [
    { text: 'Meet', accent: false },
    { text: 'Lauren', accent: true },
    { text: ', your', accent: false },
  ],
  [
    { text: 'Physical', accent: false },
    { text: 'Therapist', accent: false },
  ],
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

type OrbitPose = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  z: number;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function orbitPose(index: number, angle: number): OrbitPose {
  const theta = ((index / RING.length) * 360 + angle) * (Math.PI / 180);
  const front = (Math.sin(theta) + 1) / 2;
  return {
    x: Math.cos(theta) * ORBIT_RADIUS,
    y: Math.sin(theta) * ORBIT_RADIUS,
    scale: 0.88 + front * 0.14,
    opacity: 0.22 + front * 0.78,
    z: Math.round(front * 6),
  };
}

function applyPose(
  el: HTMLDivElement,
  x: number,
  y: number,
  scale: number,
  opacity: number,
  z: number,
  ring: number,
) {
  el.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  el.style.opacity = String(opacity);
  el.style.zIndex = String(z);
  el.style.setProperty('--pt-ring', String(ring));
}

function RevealLine({ text, instant }: { text: string; instant: boolean }) {
  const [shown, setShown] = useState(text);
  const [leaving, setLeaving] = useState<string | null>(null);

  useEffect(() => {
    if (text === shown) return;
    if (instant) {
      setLeaving(null);
      setShown(text);
      return;
    }
    setLeaving(shown);
    setShown(text);
    const id = window.setTimeout(() => setLeaving(null), 640);
    return () => window.clearTimeout(id);
  }, [instant, shown, text]);

  const copy = (line: string) =>
    line === 'Finding your perfect match' ? (
      <>
        Finding your
        <br />
        perfect match
      </>
    ) : (
      line
    );

  return (
    <div className="pt-cycle" aria-live="polite">
      {leaving ? (
        <p className="font-sans text-title-large-subtle text-foreground-neutral-default pt-cycle-out">
          {copy(leaving)}
        </p>
      ) : null}
      <p
        className={
          instant
            ? 'font-sans text-title-large-subtle text-foreground-neutral-default'
            : 'font-sans text-title-large-subtle text-foreground-neutral-default pt-cycle-in'
        }
      >
        {copy(shown)}
      </p>
    </div>
  );
}

function MeetTitle({ play }: { play: boolean }) {
  let delay = 0;
  return (
    <h1 className="font-sans text-title-large-subtle text-foreground-neutral-default mt-8">
      {MEET_WORDS.map((line) => (
        <span key={line.map((word) => word.text).join('')} className="block">
            {line.map((word, index) => {
            const wordDelay = delay;
            delay += 55;
            return (
              <span
                key={word.text}
                className={
                  word.accent
                    ? 'pt-meet-word text-[#4a89e8]'
                    : 'pt-meet-word'
                }
                style={{
                  animationDelay: play ? `${wordDelay}ms` : undefined,
                  marginLeft:
                    index > 0 && !word.text.startsWith(',') ? '0.28em' : undefined,
                }}
                data-play={play ? '' : undefined}
              >
                {word.text}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function HandwrittenQuote({ play }: { play: boolean }) {
  const width = 320;
  let glyphIndex = 0;
  const lineOneCount = ptQuoteLines[0].glyphs.length;

  return (
    <svg
      viewBox="-16 -4 352 86"
      role="img"
      aria-label={PT_MEET_QUOTE}
      className="mt-8 w-full max-w-[320px] overflow-visible"
    >
      {ptQuoteLines.map((line, lineIndex) => {
        const x = (width - line.width) / 2;
        const y = lineIndex === 0 ? 2 : 42;
        return (
          <g key={line.width} transform={`translate(${x} ${y})`}>
            {line.glyphs.map((d) => {
              const order = glyphIndex;
              glyphIndex += 1;
              const delay =
                lineIndex === 0
                  ? order * 42
                  : Math.round(lineOneCount * 42 * 0.58) +
                    (order - lineOneCount) * 42;
              return (
                <path
                  key={`${lineIndex}-${order}`}
                  d={d}
                  pathLength={1}
                  className={play ? 'pt-ink' : 'pt-ink pt-ink-still'}
                  style={play ? { animationDelay: `${680 + delay}ms` } : undefined}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function Portrait({ alt = '' }: { alt?: string }) {
  return (
    <img
      alt={alt}
      src={assetSrc(pt1)}
      className="size-full object-cover object-[center_18%]"
    />
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
  const sceneRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bornRef = useRef(0);
  const motionRef = useRef({
    mode: 'spin' as 'spin' | 'decel' | 'gather' | 'done',
    angle: 0,
    decel: null as null | {
      from: number;
      to: number;
      start: number;
      duration: number;
    },
    gatherStart: 0,
    from: [] as OrbitPose[],
    target: { x: 0, y: -160 },
  });
  const [live, setLive] = useState(beat < 2);
  const [showCopy, setShowCopy] = useState(false);
  const [searchGone, setSearchGone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (beat < 2) {
      setLive(true);
      setSearchGone(false);
      setShowCopy(false);
    }
  }, [beat]);

  const instant = fastDemo || reduced || !live;
  const showOrbit = beat < 2 || (live && !instant);
  const revealCopy = beat === 2 && (instant || showCopy);

  useEffect(() => {
    if (beat === 2) return;
    const id = window.setTimeout(
      () => onAdvanceRef.current(),
      fastDemo ? 0 : SEARCH_BEAT_MS,
    );
    return () => window.clearTimeout(id);
  }, [beat, fastDemo]);

  useLayoutEffect(() => {
    if (!showOrbit) return;
    const motion = motionRef.current;
    const nodes = () => nodeRefs.current;

    const paintOrbit = (angle: number, intro: number, heroBoost: number) => {
      RING.forEach((avatar, index) => {
        const el = nodes()[index];
        if (!el) return;
        const pose = orbitPose(index, angle);
        const opacity = avatar.hero
          ? Math.min(1, pose.opacity + heroBoost * (1 - pose.opacity))
          : pose.opacity;
        applyPose(
          el,
          pose.x,
          pose.y,
          pose.scale * (0.72 + 0.28 * intro),
          opacity * intro,
          pose.z,
          0,
        );
      });
    };

    const paintGather = (t: number) => {
      RING.forEach((avatar, index) => {
        const el = nodes()[index];
        const from = motion.from[index];
        if (!el || !from) return;
        if (avatar.hero) {
          const arc = Math.sin(Math.PI * t) * 16;
          applyPose(
            el,
            lerp(from.x, motion.target.x, t),
            lerp(from.y, motion.target.y, t) - arc,
            lerp(from.scale, 1.5, t),
            1,
            8,
            Math.min(1, t * 1.35),
          );
          return;
        }
        const drift = 1 + t * 0.14;
        applyPose(
          el,
          from.x * drift,
          from.y * drift,
          lerp(from.scale, from.scale * 0.92, t),
          from.opacity * (1 - t),
          1,
          0,
        );
      });
    };

    if (instant) {
      paintOrbit(0, 1, 0);
      return;
    }

    if (bornRef.current === 0) bornRef.current = performance.now();

    if (beat >= 2 && motion.mode === 'spin') {
      const mod = ((motion.angle % 360) + 360) % 360;
      let delta = (360 - mod) % 360;
      if (delta < 12) delta += 360;
      motion.mode = 'decel';
      motion.decel = {
        from: motion.angle,
        to: motion.angle + delta,
        start: performance.now(),
        duration: 520 + delta * 6.5,
      };
    }

    if (beat < 2) {
      motion.mode = 'spin';
      motion.decel = null;
    }

    let frame = 0;
    let last = performance.now();
    let cancelled = false;

    const tick = (now: number) => {
      const dt = Math.min(34, now - last);
      last = now;
      const intro = easeOutExpo(clamp01((now - bornRef.current) / 700));

      if (motion.mode === 'spin') {
        motion.angle += SPIN_DEG_PER_MS * dt;
        paintOrbit(motion.angle, intro, 0);
      } else if (motion.mode === 'decel' && motion.decel) {
        const t = clamp01((now - motion.decel.start) / motion.decel.duration);
        const eased = easeOutExpo(t);
        motion.angle = lerp(motion.decel.from, motion.decel.to, eased);
        paintOrbit(motion.angle, 1, eased);
        if (t >= 1) {
          motion.from = RING.map((avatar, index) => {
            const pose = orbitPose(index, motion.angle);
            return avatar.hero ? { ...pose, opacity: 1, scale: pose.scale } : pose;
          });
          const scene = sceneRef.current;
          const origin = originRef.current;
          const pad = padRef.current;
          if (scene && origin && pad) {
            const sceneBox = scene.getBoundingClientRect();
            const scale = scene.offsetWidth
              ? sceneBox.width / scene.offsetWidth
              : 1;
            const originBox = origin.getBoundingClientRect();
            const padBox = pad.getBoundingClientRect();
            motion.target = {
              x:
                (padBox.left +
                  padBox.width / 2 -
                  (originBox.left + originBox.width / 2)) /
                scale,
              y:
                (padBox.top +
                  padBox.height / 2 -
                  (originBox.top + originBox.height / 2)) /
                scale,
            };
          }
          motion.gatherStart = now;
          motion.mode = 'gather';
          if (!cancelled) setShowCopy(true);
        }
      } else if (motion.mode === 'gather') {
        const t = easeOutExpo(clamp01((now - motion.gatherStart) / GATHER_MS));
        paintGather(t);
        if (t >= 1) {
          motion.mode = 'done';
          paintGather(1);
          return;
        }
      }

      if (motion.mode !== 'done') frame = window.requestAnimationFrame(tick);
    };

    const introNow =
      beat >= 2
        ? 1
        : easeOutExpo(clamp01((performance.now() - bornRef.current) / 700));
    paintOrbit(motion.angle, introNow, 0);
    frame = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [beat, instant, showOrbit]);

  return (
    <div
      ref={sceneRef}
      className={
        instant
          ? 'pt-reveal-instant relative min-h-0 flex-1 overflow-hidden'
          : 'relative min-h-0 flex-1 overflow-hidden'
      }
    >
      <div ref={originRef} className="absolute top-1/2 left-1/2 size-0">
        {showOrbit
          ? RING.map((avatar, index) => (
              <div
                key={assetSrc(avatar.src)}
                ref={(node) => {
                  nodeRefs.current[index] = node;
                }}
                className="pt-orbit-avatar absolute top-0 left-0"
              >
                <div className="relative size-20 -translate-x-1/2 -translate-y-1/2">
                  <div className="pt-avatar-ring absolute -inset-[3px] rounded-full bg-gradient-to-b from-[#e0ecfd] to-[#a6c9f8]" />
                  <div className="relative size-full overflow-hidden rounded-full bg-[#d7e8fb]">
                    <img
                      alt=""
                      src={assetSrc(avatar.src)}
                      className="size-full object-cover object-[center_18%]"
                    />
                  </div>
                </div>
              </div>
            ))
          : null}
        {beat < 2 || (!instant && !searchGone) ? (
          <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div
              className={showCopy ? 'pt-search-out' : 'pt-search-in'}
              onAnimationEnd={(event) => {
                if (event.animationName === 'pt-search-out') setSearchGone(true);
              }}
            >
              <div className="flex w-[280px] flex-col items-center gap-6 text-center">
                <div className="size-10">
                  <PhoenixOrb mood="breath" className="size-full" />
                </div>
                <RevealLine
                  text={PT_REVEAL_LINES[beat === 2 ? 1 : beat]}
                  instant={instant}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-4 top-[18%] z-[2] flex flex-col items-center text-center">
        <div ref={padRef} className="size-[120px]">
          {beat === 2 && !showOrbit ? (
            <div className="size-full rounded-full bg-gradient-to-b from-[#e0ecfd] to-[#a6c9f8] p-[3px]">
              <div className="size-full overflow-hidden rounded-full bg-[#d7e8fb]">
                <Portrait alt={PT} />
              </div>
            </div>
          ) : null}
        </div>
        {revealCopy ? (
          <>
            <MeetTitle play={!instant} />
            <p
              className={
                instant
                  ? 'text-body-large-default text-foreground-neutral-default mt-3'
                  : 'text-body-large-default text-foreground-neutral-default pt-meet-stat mt-3'
              }
            >
              Helped <span className="font-medium text-[#0d0d0d]">340 members</span>{' '}
              recover from pain
            </p>
            <HandwrittenQuote play={!instant} />
          </>
        ) : null}
      </div>

      {revealCopy ? (
        <div
          className={
            instant
              ? 'absolute inset-x-4 bottom-2 z-20'
              : 'pt-meet-cta absolute inset-x-4 bottom-2 z-20'
          }
        >
          <PrimaryAction onClick={onContinue}>Continue</PrimaryAction>
        </div>
      ) : null}
    </div>
  );
}

const CHAT_INTRO_STEPS = 4;
const CHAT_INTRO_FIRST_MS = 640;
const CHAT_INTRO_STEP_MS = 1700;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function IntroAvatar({ from }: { from: 'Phoenix' | 'Lauren' }) {
  if (from === 'Lauren') {
    return (
      <div className="size-9 shrink-0 overflow-hidden rounded-full">
        <LaurenPortrait decorative />
      </div>
    );
  }

  return (
    <div className="size-9 shrink-0">
      <PhoenixOrb mood="breath" className="size-full" />
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
      <div className="chat-intro-bubble chat-intro-bubble-member flex justify-end">
        <p
          className="w-[240px] rounded-xl px-3 py-2 text-left text-[16px] leading-[22px] font-medium text-[#0d0d0d]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(166, 201, 248, 0.6), rgba(166, 201, 248, 0.6)), linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
          }}
        >
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="chat-intro-bubble chat-intro-bubble-care flex items-end gap-2">
      <IntroAvatar from={from} />
      <p className="w-[240px] rounded-xl bg-white px-3 py-2 text-left text-[16px] leading-[22px] font-medium text-[#0d0d0d] shadow-[0_6px_17px_rgba(31,34,44,0.07)]">
        {from === 'Phoenix' ? (
          <>
            Thanks for telling me. I&apos;m sharing this with{' '}
            <span className="font-semibold text-[#4a89e8]">{PT}</span> so she
            can review your session.
          </>
        ) : (
          text
        )}
      </p>
    </div>
  );
}

function SessionCardBubble() {
  return (
    <div className="chat-intro-bubble chat-intro-bubble-care flex items-end gap-2">
      <IntroAvatar from="Lauren" />
      <div className="w-[240px] rounded-xl bg-white p-2 shadow-[0_6px_17px_rgba(31,34,44,0.07)]">
        <p className="px-1 text-left text-[16px] leading-[22px] font-medium text-[#1f222c]">
          Ready to start your next session?
        </p>
        <div className="relative mt-3 h-[120px] overflow-hidden rounded-lg">
          <img
            alt=""
            src={assetSrc(sessionCard)}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
            <span className="text-[16px] leading-[22px] font-semibold text-white">
              Start Session
            </span>
            <img alt="" src={assetSrc(arrowRight)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatIntroScene({
  fastDemo = false,
  onContinue,
}: {
  beat?: 0 | 1 | 2 | 3;
  fastDemo?: boolean;
  onContinue: () => void;
}) {
  const [visible, setVisible] = useState(fastDemo ? CHAT_INTRO_STEPS : 0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    if (fastDemo || prefersReducedMotion()) {
      setVisible(CHAT_INTRO_STEPS);
      return;
    }
    if (visible >= CHAT_INTRO_STEPS) return;
    const delay = visible === 0 ? CHAT_INTRO_FIRST_MS : CHAT_INTRO_STEP_MS;
    const id = window.setTimeout(() => setVisible((count) => count + 1), delay);
    return () => window.clearTimeout(id);
  }, [visible, fastDemo]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const stack = stackRef.current;
    if (!viewport || !stack) return;
    const overflow = Math.max(0, stack.scrollHeight - viewport.clientHeight);
    const frame = window.requestAnimationFrame(() => setShift(overflow));
    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-2">
      <div className="flex shrink-0 flex-col items-center text-center">
        <DualAvatar />
        <h1 className="font-sans text-title-large-subtle text-foreground-neutral-default mt-6">
          {CHAT_INTRO_TITLE}
        </h1>
        <p className="text-body-large-default text-foreground-neutral-default mt-3 max-w-[300px]">
          {CHAT_INTRO_HINT}
        </p>
      </div>
      <div className="relative mx-auto mt-6 min-h-0 w-full max-w-[343px] flex-1 overflow-hidden">
        <img
          alt=""
          src={assetSrc(phoneChrome)}
          className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2"
        />
        <div ref={viewportRef} className="chat-intro-viewport absolute inset-0">
          <div
            ref={stackRef}
            className="chat-intro-stack absolute inset-x-0 top-0 flex flex-col gap-4 pt-12 pb-10"
            style={{ transform: `translateY(-${shift}px)` }}
          >
            <div className="mx-auto flex w-[284px] flex-col gap-4">
              {CHAT_INTRO_BUBBLES.slice(0, Math.min(visible, 3)).map(
                (bubble) => (
                  <IntroBubble
                    key={bubble.from}
                    from={bubble.from}
                    text={bubble.text}
                  />
                ),
              )}
              {visible >= 4 ? <SessionCardBubble /> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto w-full shrink-0 pt-2 pb-2">
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
        <h1 className="font-sans text-title-large-subtle text-foreground-neutral-default mt-8">
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
      <h1 className="font-sans text-title-large-subtle text-foreground-neutral-default mt-8">
        {lead}
        <br />
        {trail}
      </h1>
    </div>
  );
}
