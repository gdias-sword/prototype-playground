'use client';

import { MessageSquare } from 'lucide-react';
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
  const [expandedThreadId, setExpandedThreadId] = useState<string | null>(null);
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
    setExpandedThreadId(null);
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
    if (
      !prototypePath ||
      (availability !== 'ready' && availability !== 'unconfigured')
    ) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'c' || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      toggleComments();
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [availability, prototypePath, toggleComments]);

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
      event.stopPropagation();
    }

    function handleClick(event: MouseEvent) {
      if (isCommentUi(event.target)) return;
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

  if (
    !prototypePath ||
    availability === 'loading' ||
    availability === 'missing'
  ) {
    return null;
  }

  const openCount = threads.filter((thread) => !thread.resolved).length;
  const openThread =
    threads.find((thread) => thread.id === openThreadId) ?? null;
  const openThreadPlacement = openThread ? placements[openThread.id] : null;
  const offScreen = threads.filter(
    (thread) => !thread.resolved && placements[thread.id]?.visible === false,
  );
  const resolved = threads.filter((thread) => thread.resolved);

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
          className="border-border-neutral-default bg-background-neutral-default fixed z-[10001] flex w-80 flex-col rounded-2xl border p-4 shadow-lg"
          style={popoverStyle(draft.left, draft.top)}
        >
          <CommentComposer
            authorName={authorName}
            needsName={needsName}
            isSaving={isSaving}
            error={actionError}
            submitLabel="Comment"
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
          className="border-border-neutral-default bg-background-neutral-default fixed z-[10001] max-h-[min(32rem,calc(100dvh-2rem))] w-80 overflow-y-auto rounded-2xl border p-4 shadow-lg"
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

      {isOpen ? (
        <div
          data-comment-ui
          className="border-border-neutral-default bg-background-neutral-default fixed right-4 bottom-20 z-[10001] flex max-h-[min(32rem,calc(100dvh-8rem))] w-80 flex-col gap-4 overflow-y-auto rounded-2xl border p-4 shadow-lg"
        >
          {availability === 'unconfigured' ? (
            <p className="text-body-medium-default text-foreground-neutral-default">
              Comments storage is not configured.
            </p>
          ) : (
            <ThreadList
              offScreen={offScreen}
              resolved={resolved}
              expandedThreadId={expandedThreadId}
              authorName={authorName}
              needsName={needsName}
              isSaving={isSaving}
              actionError={actionError}
              onToggle={(threadId) => {
                setOpenThreadId(null);
                setDraft(null);
                setActionError(null);
                setExpandedThreadId((current) =>
                  current === threadId ? null : threadId,
                );
              }}
              onAuthorNameChange={setAuthorName}
              onReply={(threadId, body) =>
                mutate({ action: 'reply', threadId, body, authorName })
              }
              onResolve={(threadId, resolvedNext) =>
                void mutate({
                  action: 'resolve',
                  threadId,
                  resolved: resolvedNext,
                })
              }
              onDelete={(commentId) =>
                void mutate({ action: 'delete', commentId })
              }
            />
          )}
          {loadError ? (
            <p className="text-body-small-default text-red-700">{loadError}</p>
          ) : null}
        </div>
      ) : null}

      <div
        data-comment-ui
        className="fixed right-4 bottom-4 z-[10002] flex items-center gap-2"
      >
        <button
          type="button"
          className={`bg-background-brand-default text-foreground-neutral-inverse relative flex size-12 cursor-pointer items-center justify-center rounded-full shadow-md ${
            isOpen
              ? 'outline-background-brand-default outline-2 outline-offset-2'
              : ''
          }`}
          aria-pressed={isOpen}
          aria-keyshortcuts="c"
          title="Toggle comments (C)"
          aria-label={
            openCount > 0 ? `Comments, ${openCount} open` : 'Comments'
          }
          onClick={toggleComments}
        >
          <MessageSquare className="size-5" />
          {availability === 'ready' && openCount > 0 ? (
            <span className="bg-background-neutral-default text-body-small-strong text-foreground-neutral-default absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1">
              {openCount > 99 ? '99+' : openCount}
            </span>
          ) : null}
        </button>
      </div>
    </>
  );
}

function ThreadList({
  offScreen,
  resolved,
  expandedThreadId,
  authorName,
  needsName,
  isSaving,
  actionError,
  onToggle,
  onAuthorNameChange,
  onReply,
  onResolve,
  onDelete,
}: {
  offScreen: PublicThread[];
  resolved: PublicThread[];
  expandedThreadId: string | null;
  authorName: string;
  needsName: boolean;
  isSaving: boolean;
  actionError: string | null;
  onToggle: (threadId: string) => void;
  onAuthorNameChange: (name: string) => void;
  onReply: (threadId: string, body: string) => Promise<boolean>;
  onResolve: (threadId: string, resolved: boolean) => void;
  onDelete: (commentId: string) => void;
}) {
  if (offScreen.length === 0 && resolved.length === 0) {
    return (
      <p className="text-body-medium-default text-foreground-neutral-subtle">
        Open threads on this screen stay on their pins. Threads for other steps,
        and resolved threads, show up here.
      </p>
    );
  }

  return (
    <>
      {offScreen.length > 0 ? (
        <ThreadSection
          title="Off this screen"
          threads={offScreen}
          expandedThreadId={expandedThreadId}
          authorName={authorName}
          needsName={needsName}
          isSaving={isSaving}
          actionError={actionError}
          onToggle={onToggle}
          onAuthorNameChange={onAuthorNameChange}
          onReply={onReply}
          onResolve={onResolve}
          onDelete={onDelete}
        />
      ) : null}
      {resolved.length > 0 ? (
        <ThreadSection
          title="Resolved"
          threads={[...resolved].reverse()}
          expandedThreadId={expandedThreadId}
          authorName={authorName}
          needsName={needsName}
          isSaving={isSaving}
          actionError={actionError}
          onToggle={onToggle}
          onAuthorNameChange={onAuthorNameChange}
          onReply={onReply}
          onResolve={onResolve}
          onDelete={onDelete}
        />
      ) : null}
    </>
  );
}

function ThreadSection({
  title,
  threads,
  expandedThreadId,
  authorName,
  needsName,
  isSaving,
  actionError,
  onToggle,
  onAuthorNameChange,
  onReply,
  onResolve,
  onDelete,
}: {
  title: string;
  threads: PublicThread[];
  expandedThreadId: string | null;
  authorName: string;
  needsName: boolean;
  isSaving: boolean;
  actionError: string | null;
  onToggle: (threadId: string) => void;
  onAuthorNameChange: (name: string) => void;
  onReply: (threadId: string, body: string) => Promise<boolean>;
  onResolve: (threadId: string, resolved: boolean) => void;
  onDelete: (commentId: string) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body-small-strong text-foreground-neutral-subtle">
        {title}
      </h2>
      {threads.map((thread) => {
        const root = thread.comments[0];
        const isExpanded = expandedThreadId === thread.id;
        return (
          <div key={thread.id} className="flex flex-col gap-3">
            <button
              type="button"
              className="hover:bg-background-neutral-subtle flex w-full cursor-pointer flex-col gap-1 rounded-xl px-2 py-2 text-left"
              aria-expanded={isExpanded}
              onClick={() => onToggle(thread.id)}
            >
              <span className="text-body-small-strong text-foreground-neutral-default">
                {root?.authorName}
              </span>
              <span className="text-body-small-default text-foreground-neutral-subtle line-clamp-2">
                {root?.body}
              </span>
            </button>
            {isExpanded ? (
              <CommentThread
                thread={thread}
                authorName={authorName}
                needsName={needsName}
                isSaving={isSaving}
                error={actionError}
                onAuthorNameChange={onAuthorNameChange}
                onReply={(body) => onReply(thread.id, body)}
                onResolve={(resolvedNext) => onResolve(thread.id, resolvedNext)}
                onDelete={onDelete}
              />
            ) : null}
          </div>
        );
      })}
    </section>
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
  const estimatedHeight = 280;
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
