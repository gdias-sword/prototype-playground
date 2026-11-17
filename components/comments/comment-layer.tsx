'use client';

import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  anchorFromClick,
  pinPosition,
  type DraftAnchor,
} from '@/components/comments/anchor';
import {
  ensureCommentToken,
  readAuthorName,
  readCommentToken,
  saveAuthorName,
} from '@/components/comments/identity';
import {
  CommentComposer,
  CommentThread,
} from '@/components/comments/comment-thread';
import { PrototypeToolbar } from '@/components/prototype-toolbar';
import type { PublicThread } from '@/playground/comment-model';

const POLL_INTERVAL_MS = 4000;

type Availability = 'loading' | 'ready' | 'missing' | 'unconfigured';

interface PinPlacement {
  left: number;
  top: number;
  visible: boolean;
}

export function CommentLayer() {
  const pathname = usePathname();
  const prototypePath = prototypePathname(pathname);
  const [availability, setAvailability] = useState<Availability>('loading');
  const [threads, setThreads] = useState<PublicThread[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DraftAnchor | null>(null);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [needsName, setNeedsName] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, PinPlacement>>(
    {},
  );
  const generation = useRef(0);
  const isSavingRef = useRef(false);
  const draftRef = useRef<DraftAnchor | null>(null);
  const openThreadIdRef = useRef<string | null>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    openThreadIdRef.current = openThreadId;
  }, [openThreadId]);

  useEffect(() => {
    setIsOpen(false);
    setDraft(null);
    setOpenThreadId(null);
    setActionError(null);
    setThreads([]);
    setAvailability(prototypePath ? 'loading' : 'missing');
  }, [prototypePath]);

  useEffect(() => {
    setAuthorName(readAuthorName());
    setNeedsName(readAuthorName().trim().length === 0);
  }, []);

  const applyThreads = useCallback((next: PublicThread[]) => {
    setThreads(next);
    setAvailability('ready');
    setLoadError(null);
  }, []);

  useEffect(() => {
    if (!prototypePath) return;
    let cancelled = false;

    async function load() {
      if (isSavingRef.current) return;
      const seen = generation.current;
      try {
        const response = await fetch(
          `/api/comments?path=${encodeURIComponent(prototypePath!)}`,
          { cache: 'no-store', headers: commentHeaders() },
        );
        if (cancelled || seen !== generation.current) return;
        if (response.status === 404) {
          setAvailability('missing');
          return;
        }
        if (response.status === 503) {
          setAvailability('unconfigured');
          return;
        }
        const payload = (await response.json()) as {
          threads?: PublicThread[];
          error?: string;
        };
        if (cancelled || seen !== generation.current) return;
        if (!response.ok || !payload.threads) {
          setLoadError(payload.error ?? 'Could not load comments.');
          setAvailability('ready');
          return;
        }
        applyThreads(payload.threads);
      } catch {
        if (!cancelled && seen === generation.current) {
          setLoadError('Could not load comments.');
          setAvailability('ready');
        }
      }
    }

    void load();
    if (!isOpen || availability === 'unconfigured') {
      return () => {
        cancelled = true;
      };
    }
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [applyThreads, availability, isOpen, prototypePath]);

  useEffect(() => {
    if (!isOpen || availability !== 'ready') return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
    return () => {
      document.body.style.cursor = previous;
    };
  }, [availability, isOpen]);

  const toggleComments = useCallback(() => {
    setIsOpen((open) => {
      if (open) {
        setDraft(null);
        setOpenThreadId(null);
        setActionError(null);
      }
      return !open;
    });
  }, []);

  useEffect(() => {
    if (!isOpen || availability !== 'ready') return;

    function isCommentUi(target: EventTarget | null) {
      return (
        target instanceof Element &&
        Boolean(target.closest('[data-comment-ui]'))
      );
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 || isCommentUi(event.target)) return;
      if (isXrayClaim(event)) return;
      event.stopPropagation();
    }

    function handleClick(event: MouseEvent) {
      if (isCommentUi(event.target) || isXrayClaim(event)) return;
      event.preventDefault();
      event.stopPropagation();
      if (draftRef.current || openThreadIdRef.current) {
        setDraft(null);
        setOpenThreadId(null);
        setActionError(null);
        return;
      }
      const anchor = anchorFromClick(event);
      if (!anchor) return;
      setActionError(null);
      setDraft(anchor);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (document.documentElement.dataset.xrayGesture === '1') return;
      event.preventDefault();
      event.stopPropagation();
      if (draftRef.current) {
        setDraft(null);
        setActionError(null);
        return;
      }
      if (openThreadIdRef.current) {
        setOpenThreadId(null);
        setActionError(null);
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [availability, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    function measure() {
      const next: Record<string, PinPlacement> = {};
      for (const thread of threads) {
        if (thread.resolved) continue;
        const position = pinPosition(thread.anchor);
        next[thread.id] = position
          ? { ...position, visible: true }
          : { left: 0, top: 0, visible: false };
      }
      setPlacements((current) => {
        const ids = Object.keys(next);
        const same =
          ids.length === Object.keys(current).length &&
          ids.every((id) => {
            const previous = current[id];
            const placement = next[id];
            return (
              previous &&
              placement &&
              previous.visible === placement.visible &&
              previous.left === placement.left &&
              previous.top === placement.top
            );
          });
        return same ? current : next;
      });
      const currentDraft = draftRef.current;
      if (!currentDraft) return;
      const position = pinPosition(currentDraft);
      if (
        !position ||
        (Math.round(position.left) === Math.round(currentDraft.left) &&
          Math.round(position.top) === Math.round(currentDraft.top))
      ) {
        return;
      }
      setDraft({ ...currentDraft, left: position.left, top: position.top });
    }

    measure();
    let frame = 0;
    function schedule() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    }
    const observer = new MutationObserver((mutations) => {
      const changed = mutations.some((mutation) => {
        const target = mutation.target;
        return (
          !(target instanceof Element) || !target.closest('[data-comment-ui]')
        );
      });
      if (changed) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [isOpen, threads]);

  async function mutate(body: Record<string, unknown>): Promise<boolean> {
    if (!prototypePath) return false;
    setIsSaving(true);
    isSavingRef.current = true;
    generation.current += 1;
    setActionError(null);
    try {
      const token = ensureCommentToken();
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-comment-token': token,
        },
        body: JSON.stringify({ ...body, path: prototypePath, token }),
      });
      const payload = (await response.json()) as {
        threads?: PublicThread[];
        error?: string;
      };
      generation.current += 1;
      if (!response.ok || !payload.threads) {
        setActionError(
          payload.error ?? 'Could not save the comment. Try again.',
        );
        return false;
      }
      const trimmedName = authorName.trim();
      if (trimmedName) {
        saveAuthorName(trimmedName);
        setAuthorName(trimmedName);
        setNeedsName(false);
      }
      applyThreads(payload.threads);
      setDraft(null);
      return true;
    } catch {
      generation.current += 1;
      setActionError('Could not save the comment. Try again.');
      return false;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  if (!prototypePath || availability === 'missing') {
    return null;
  }

  const openCount = threads.filter((thread) => !thread.resolved).length;
  const openThread =
    threads.find((thread) => thread.id === openThreadId) ?? null;
  const openThreadPlacement = openThread ? placements[openThread.id] : null;
  const statusMessage =
    availability === 'unconfigured'
      ? 'Comments storage is not configured.'
      : loadError;

  return (
    <>
      {isOpen && availability === 'ready'
        ? threads.map((thread) => {
            if (thread.resolved) return null;
            const placement = placements[thread.id];
            if (!placement?.visible) return null;
            const initial =
              thread.comments[0]?.authorName.charAt(0).toUpperCase() || '?';
            return (
              <button
                key={thread.id}
                type="button"
                data-comment-ui
                className={`bg-background-brand-default text-body-small-strong text-foreground-neutral-inverse fixed z-[10000] flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full shadow-md ${
                  openThreadId === thread.id
                    ? 'outline-background-brand-default outline-2 outline-offset-2'
                    : ''
                }`}
                style={{ left: placement.left, top: placement.top }}
                aria-label={`Comment from ${thread.comments[0]?.authorName ?? 'someone'}`}
                onClick={() => {
                  setDraft(null);
                  setActionError(null);
                  setOpenThreadId(thread.id);
                }}
              >
                {initial}
              </button>
            );
          })
        : null}

      {draft ? (
        <span
          data-comment-ui
          className="bg-background-brand-default fixed z-[10000] size-7 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md"
          style={{ left: draft.left, top: draft.top }}
        />
      ) : null}

      {draft ? (
        <div
          data-comment-ui
          className="border-border-neutral-default bg-background-neutral-default fixed z-[10001] flex w-80 flex-col rounded-2xl border p-3 shadow-lg"
          style={popoverStyle(draft.left, draft.top)}
        >
          <CommentComposer
            authorName={authorName}
            needsName={needsName}
            isSaving={isSaving}
            error={actionError}
            submitLabel="Comment"
            placeholder="Add a comment"
            onAuthorNameChange={setAuthorName}
            onCancel={() => {
              setDraft(null);
              setActionError(null);
            }}
            onSubmit={(body) =>
              mutate({
                action: 'create',
                anchor: { selector: draft.selector, x: draft.x, y: draft.y },
                body,
                authorName,
              })
            }
          />
        </div>
      ) : null}

      {openThread && openThreadPlacement?.visible ? (
        <div
          data-comment-ui
          className="border-border-neutral-default bg-background-neutral-default fixed z-[10001] max-h-[min(32rem,calc(100dvh-2rem))] w-80 overflow-y-auto rounded-2xl border p-3 shadow-lg"
          style={popoverStyle(
            openThreadPlacement.left,
            openThreadPlacement.top,
          )}
        >
          <CommentThread
            thread={openThread}
            authorName={authorName}
            needsName={needsName}
            isSaving={isSaving}
            error={actionError}
            onAuthorNameChange={setAuthorName}
            onReply={(body) =>
              mutate({
                action: 'reply',
                threadId: openThread.id,
                body,
                authorName,
              })
            }
            onResolve={(resolvedNext) =>
              void mutate({
                action: 'resolve',
                threadId: openThread.id,
                resolved: resolvedNext,
              })
            }
            onDelete={(commentId) =>
              void mutate({ action: 'delete', commentId })
            }
          />
        </div>
      ) : null}

      {isOpen && statusMessage ? (
        <p
          data-comment-ui
          className="border-border-neutral-default bg-background-neutral-default text-body-small-default text-foreground-neutral-default fixed bottom-20 left-1/2 z-[10001] w-80 -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-lg"
        >
          {statusMessage}
        </p>
      ) : null}

      <PrototypeToolbar
        path={prototypePath}
        comments={{
          availability,
          isOpen,
          openCount,
          onToggle: toggleComments,
        }}
      />
    </>
  );
}

function isXrayClaim(event: MouseEvent | PointerEvent) {
  return (
    document.documentElement.dataset.xray === 'armed' ||
    document.documentElement.dataset.xrayGesture === '1' ||
    event.altKey
  );
}

function prototypePathname(pathname: string): string | null {
  const match = /^\/([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(pathname);
  if (!match || match[1] === 'api') return null;
  return pathname;
}

function commentHeaders(): HeadersInit {
  const token = readCommentToken();
  return token ? { 'x-comment-token': token } : {};
}

function popoverStyle(
  left: number,
  top: number,
): { left: number; top: number } {
  const width = 320;
  const margin = 16;
  const estimatedHeight = 200;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(
    margin,
    window.innerHeight - estimatedHeight - margin,
  );
  return {
    left: Math.min(maxLeft, Math.max(margin, left + 20)),
    top: Math.min(maxTop, Math.max(margin, top + 16)),
  };
}
