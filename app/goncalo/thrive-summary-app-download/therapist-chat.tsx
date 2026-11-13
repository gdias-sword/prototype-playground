'use client';

import { cn } from '@/design/utils';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import chatBg from './assets/chat-bg.svg';
import icAttach from './assets/ic-attach.svg';
import icGear from './assets/ic-gear.svg';
import icSend from './assets/ic-send.svg';
import lauren from './assets/lauren.png';

const MEMBER = 'Gonçalo';
const REPLY = 'I’ll start it now.';
const TIME = ['8:34', 'AM'] as const;

const OPENING = [
  {
    id: 'hello',
    name: true,
    text: `Hi ${MEMBER}! I’m Lauren, your physical therapist.`,
  },
  {
    id: 'guide',
    name: false,
    text: 'Your first session is ready. It’s about 5 minutes, and I’ll guide you through it.',
  },
] as const;

const CLOSING =
  'Open the app and tap your first session. I’ll be right here if you need me.';

function assetSrc(asset: string | { src: string }) {
  return typeof asset === 'string' ? asset : asset.src;
}

export function TherapistChat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative aspect-[280/544] h-full max-h-full w-auto max-w-full [container-type:size]',
        className,
      )}
    >
      <div
        className="absolute top-0 left-0 origin-top-left drop-shadow-[0_22px_36px_rgba(31,34,44,0.16)]"
        style={{
          width: 280,
          height: 544,
          transform: 'scale(calc(100cqh / 544px))',
        }}
      >
        <Phone />
      </div>
    </div>
  );
}

function Phone() {
  const reduced = useReducedMotion();
  const { shown, draft, typing } = useChatPlay(reduced);
  const thread = useRef<HTMLDivElement>(null);
  const opening = OPENING.slice(0, Math.min(shown, OPENING.length));
  const sent = shown >= 3;
  const closed = shown >= 4;

  useEffect(() => {
    const node = thread.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [shown, draft, typing]);

  return (
    <div className="flex h-full flex-col rounded-[44px] bg-[#14161c] p-2 select-none">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[36px] bg-[#f2f2f2]">
      <img
        alt=""
        src={assetSrc(chatBg)}
        draggable={false}
        className="pointer-events-none absolute bottom-0 left-1/2 max-w-none -translate-x-1/2"
      />
      <header className="relative z-1 flex items-center gap-2 border-b border-[#dbdbdb] bg-[#f2f2f2] px-3 pt-3 pb-2">
        <LaurenMark className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] leading-5 font-semibold text-[#0d0d0d]">
            Lauren
          </p>
          <p className="truncate text-[12px] leading-4 text-[#0d0d0d]">
            Physical therapist
          </p>
        </div>
        <img alt="" src={assetSrc(icGear)} draggable={false} />
      </header>
      <div
        ref={thread}
        className="relative z-1 flex min-h-0 flex-1 flex-col justify-end gap-3 overflow-y-auto px-0 py-3"
      >
        {opening.length > 0 ? (
          <div className="flex flex-col gap-2">
            {opening.map((message, index) => (
              <Received
                key={message.id}
                name={message.name}
                avatar={index === opening.length - 1}
                text={message.text}
              />
            ))}
          </div>
        ) : null}
        {sent ? <Sent text={REPLY} /> : null}
        {typing ? <Typing /> : null}
        {closed ? (
          <Received name avatar text={CLOSING} />
        ) : null}
      </div>
      <form
        className="relative z-1 flex items-center gap-2 px-3 pt-1 pb-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
          <img alt="" src={assetSrc(icAttach)} draggable={false} />
        </span>
        <div className="flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-3xl border border-white bg-white py-1 pr-1 pl-3">
          <p
            className={cn(
              'min-w-0 flex-1 text-[14px] leading-5 font-medium',
              draft ? 'text-[#0d0d0d]' : 'text-[#808080]',
            )}
          >
            {draft || 'Type to reply'}
            {draft && draft.length < REPLY.length ? <Caret /> : null}
          </p>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8e8e8]">
            <img alt="" src={assetSrc(icSend)} draggable={false} />
          </span>
        </div>
      </form>
      </div>
    </div>
  );
}

function useChatPlay(reduced: boolean | null) {
  const [shown, setShown] = useState(0);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduced == null) return;
    if (reduced) {
      setShown(4);
      setDraft('');
      setTyping(false);
      return;
    }

    setShown(0);
    setDraft('');
    setTyping(false);

    let typed = 0;
    let sent = false;
    const timers: number[] = [];
    const later = (ms: number, run: () => void) => {
      timers.push(window.setTimeout(run, ms));
    };

    later(500, () => setShown(1));
    later(1500, () => setShown(2));
    later(2300, () => {
      typed = window.setInterval(() => {
        if (sent) return;
        setDraft((current) => {
          if (sent) return current;
          const next = REPLY.slice(0, current.length + 1);
          if (next.length >= REPLY.length) window.clearInterval(typed);
          return next;
        });
      }, 70);
    });
    const sendAt = 2300 + REPLY.length * 70 + 280;
    later(sendAt, () => {
      sent = true;
      window.clearInterval(typed);
      setDraft('');
      setShown(3);
    });
    later(sendAt + 700, () => setTyping(true));
    later(sendAt + 1800, () => {
      setTyping(false);
      setShown(4);
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(typed);
    };
  }, [reduced]);

  return { shown, draft, typing };
}

function LaurenMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'block shrink-0 overflow-hidden rounded-full bg-[#c7ddfb]',
        className,
      )}
    >
      <img
        alt=""
        src={assetSrc(lauren)}
        draggable={false}
        className="size-full object-cover object-[center_18%]"
      />
    </span>
  );
}

function Received({
  name,
  avatar,
  text,
  children,
  meta = true,
}: {
  name?: boolean;
  avatar?: boolean;
  text?: string;
  children?: ReactNode;
  meta?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end gap-1.5 pr-6 pl-3"
    >
      {avatar ? (
        <LaurenMark className="size-5" />
      ) : (
        <span className="size-5 shrink-0" />
      )}
      <div
        className={cn(
          'relative min-w-16 rounded-xl bg-white px-1 pt-1',
          meta ? 'pb-5' : 'pb-1',
        )}
      >
        {name ? (
          <p className="px-1 text-[12px] leading-4 font-bold text-[#0d0d0d]">
            Lauren
          </p>
        ) : null}
        <div className="px-1 text-[13px] leading-[18px] font-medium text-pretty text-[#0d0d0d]">
          {children ?? text}
        </div>
        {meta ? <Stamp /> : null}
      </div>
    </motion.div>
  );
}

function Sent({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end pr-3 pl-10"
    >
      <div className="relative max-w-full min-w-16 rounded-xl bg-[rgba(166,201,248,0.6)] px-1 pt-1 pb-5">
        <p className="px-1 text-[13px] leading-[18px] font-medium text-pretty text-[#0d0d0d]">
          {text}
        </p>
        <Stamp />
      </div>
    </motion.div>
  );
}

function Typing() {
  return (
    <Received avatar meta={false}>
      <span className="flex h-[18px] items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1.5 rounded-full bg-[#8a93a3]"
            animate={{ y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: index * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </span>
    </Received>
  );
}

function Stamp() {
  return (
    <span className="absolute right-2 bottom-0.5 flex gap-1 text-[11px] leading-4 text-[#2e2e2e]">
      <span>{TIME[0]}</span>
      <span>{TIME[1]}</span>
    </span>
  );
}

function Caret() {
  return (
    <motion.span
      aria-hidden
      className="ml-px inline-block h-3.5 w-px translate-y-0.5 bg-[#0d0d0d]"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, times: [0, 0.45, 0.5, 1] }}
    />
  );
}
