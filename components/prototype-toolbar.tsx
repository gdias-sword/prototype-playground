'use client';

import { cn } from '@/design/utils';
import { MessageSquare, Scan } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { VersionHistory } from '@/components/version-history';
import { XrayLayer } from '@/components/xray-layer';

const STORAGE_KEY = 'prototype-toolbar-hidden';
const EASE = [0.4, 0.8, 0, 1] as const;

interface PrototypeToolbarProps {
  path: string;
  comments: {
    availability: 'loading' | 'ready' | 'missing' | 'unconfigured';
    isOpen: boolean;
    openCount: number;
    onToggle: () => void;
  };
}

export function PrototypeToolbar({ path, comments }: PrototypeToolbarProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const skipAnimation = useRef(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsHidden(localStorage.getItem(STORAGE_KEY) === '1');
    const frame = requestAnimationFrame(() => {
      skipAnimation.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === 'x') {
        event.preventDefault();
        event.stopPropagation();
        setIsArmed((armed) => !armed);
        return;
      }
      if (event.key !== '\\') return;
      event.preventDefault();
      event.stopPropagation();
      setIsHidden((current) => {
        const next = !current;
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
        return next;
      });
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  function handleToggleHidden() {
    setIsHidden((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }

  const instant = skipAnimation.current || reduceMotion;

  return (
    <>
      <XrayLayer isArmed={isArmed} />
      <div
        data-prototype-chrome
        data-comment-ui
        className="fixed inset-x-0 bottom-4 z-[10002] flex justify-center"
      >
        <div className="relative">
          <motion.div
            layout
            initial={false}
            transition={{
              layout: { duration: instant ? 0 : 4, ease: EASE },
            }}
            style={{ originX: 0.5, originY: 1 }}
            className="border-border-neutral-subtle bg-background-neutral-default relative overflow-hidden rounded-full border shadow-lg"
            role={isHidden ? undefined : 'toolbar'}
            aria-label={isHidden ? undefined : 'Prototype tools'}
          >
            {isHidden ? <div className="h-1 w-10" /> : null}
            <AnimatePresence initial={false} mode="popLayout">
              {!isHidden ? (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      duration: instant ? 0 : 0.18,
                      delay: instant ? 0 : 0.12,
                      ease: EASE,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: instant ? 0 : 0.12, ease: EASE },
                  }}
                  className="relative flex items-center gap-1 p-1"
                >
                  <ToolbarButton
                    label="Measure layout"
                    shortcut="X"
                    pressed={isArmed}
                    title="Measure layout (X). Hold Option and drag to measure without leaving it on."
                    onClick={() => setIsArmed((armed) => !armed)}
                  >
                    <Scan className="size-4" />
                  </ToolbarButton>
                  <ToolbarButton
                    label={
                      comments.openCount > 0
                        ? `Comments, ${comments.openCount} open`
                        : 'Comments'
                    }
                    shortcut="C"
                    pressed={comments.isOpen}
                    disabled={comments.availability === 'loading'}
                    onClick={comments.onToggle}
                  >
                    <MessageSquare className="size-4" />
                    {comments.availability === 'ready' &&
                    comments.openCount > 0 ? (
                      <span className="bg-background-brand-default text-body-small-strong text-foreground-neutral-inverse absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full px-1">
                        {comments.openCount > 99 ? '99+' : comments.openCount}
                      </span>
                    ) : null}
                  </ToolbarButton>
                  <VersionHistory path={path} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
          {isHidden ? (
            <button
              type="button"
              className="absolute -inset-x-5 top-[-8px] -bottom-4 cursor-pointer rounded-full"
              aria-label="Show toolbar"
              aria-expanded={false}
              aria-keyshortcuts="\\"
              title="Show toolbar (\)"
              onClick={handleToggleHidden}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

function ToolbarButton({
  label,
  shortcut,
  pressed,
  title,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  pressed?: boolean;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        'text-foreground-neutral-faded hover:bg-background-neutral-subtle hover:text-foreground-neutral-default relative flex size-9 cursor-pointer items-center justify-center rounded-xl transition-colors disabled:cursor-default disabled:opacity-40',
        pressed &&
          'bg-background-brand-default text-foreground-neutral-inverse hover:bg-background-brand-strong hover:text-foreground-neutral-inverse',
      )}
      aria-pressed={pressed}
      aria-keyshortcuts={shortcut}
      title={title ?? (shortcut ? `${label} (${shortcut})` : label)}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  );
}
