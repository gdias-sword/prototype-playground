'use client';

import { useRef, useState } from 'react';

import { Input } from '@/design/components/input';
import { Textarea } from '@/design/components/textarea';
import { cn } from '@/design/utils';
import type { PublicThread } from '@/playground/comment-model';
import { ArrowUp, Check, Trash2, X } from 'lucide-react';

interface CommentThreadProps {
  thread: PublicThread;
  authorName: string;
  needsName: boolean;
  isSaving: boolean;
  error: string | null;
  onAuthorNameChange: (name: string) => void;
  onReply: (body: string) => Promise<boolean>;
  onResolve: (resolved: boolean) => void;
  onDelete: (commentId: string) => void;
}

export function CommentThread({
  thread,
  authorName,
  needsName,
  isSaving,
  error,
  onAuthorNameChange,
  onReply,
  onResolve,
  onDelete,
}: CommentThreadProps) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {thread.comments.map((comment, index) => (
          <li key={comment.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-body-small-strong text-foreground-neutral-default min-w-0 truncate">
                {comment.authorName}
              </p>
              <div className="flex shrink-0 items-center gap-0.5">
                <time
                  dateTime={comment.createdAt}
                  className="text-body-small-subtle text-foreground-neutral-faded px-1"
                >
                  {formatCommentTime(comment.createdAt)}
                </time>
                {index === 0 ? (
                  <button
                    type="button"
                    className="text-foreground-neutral-subtle hover:bg-background-neutral-subtle flex size-7 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
                    aria-pressed={thread.resolved}
                    aria-label={
                      thread.resolved ? 'Reopen comment' : 'Resolve comment'
                    }
                    disabled={isSaving}
                    onClick={() => onResolve(!thread.resolved)}
                  >
                    <span
                      className={cn(
                        'flex size-4 items-center justify-center rounded-[4px] border',
                        thread.resolved
                          ? 'border-background-brand-default bg-background-brand-default text-foreground-neutral-inverse'
                          : 'border-border-neutral-strong',
                      )}
                    >
                      {thread.resolved ? (
                        <Check className="size-3" strokeWidth={3} />
                      ) : null}
                    </span>
                  </button>
                ) : null}
                {comment.mine ? (
                  <button
                    type="button"
                    className="text-foreground-neutral-subtle hover:bg-background-neutral-subtle hover:text-foreground-neutral-default flex size-7 cursor-pointer items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Delete comment"
                    disabled={isSaving}
                    onClick={() => onDelete(comment.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <p className="text-body-medium-default text-foreground-neutral-default wrap-break-word whitespace-pre-wrap">
              {comment.body}
            </p>
          </li>
        ))}
      </ul>
      <CommentComposer
        authorName={authorName}
        needsName={needsName}
        isSaving={isSaving}
        error={error}
        submitLabel="Reply"
        placeholder="Reply"
        onAuthorNameChange={onAuthorNameChange}
        onSubmit={onReply}
      />
    </div>
  );
}

interface CommentComposerProps {
  authorName: string;
  needsName: boolean;
  isSaving: boolean;
  error: string | null;
  submitLabel: string;
  placeholder: string;
  onAuthorNameChange: (name: string) => void;
  onSubmit: (body: string) => Promise<boolean>;
  onCancel?: () => void;
}

export function CommentComposer({
  authorName,
  needsName,
  isSaving,
  error,
  submitLabel,
  placeholder,
  onAuthorNameChange,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [body, setBody] = useState('');
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit =
    body.trim().length > 0 && authorName.trim().length > 0 && !isSaving;

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        void onSubmit(body).then((saved) => {
          if (!saved) return;
          setBody('');
          const field = fieldRef.current;
          if (!field) return;
          field.style.height = 'auto';
        });
      }}
    >
      {needsName ? (
        <Input
          aria-label="Your name"
          placeholder="Your name"
          maxLength={40}
          value={authorName}
          className="py-2"
          onChange={(event) => onAuthorNameChange(event.target.value)}
        />
      ) : null}
      <div className="flex items-end gap-1">
        <div className="relative min-w-0 flex-1">
          <Textarea
            ref={fieldRef}
            aria-label={submitLabel}
            placeholder={placeholder}
            rows={1}
            maxLength={2000}
            value={body}
            className="block max-h-24 min-h-10 resize-none py-2 pr-11"
            onChange={(event) => {
              setBody(event.target.value);
              const field = event.currentTarget;
              field.style.height = 'auto';
              field.style.height = `${Math.min(field.scrollHeight, 96)}px`;
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.shiftKey) return;
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }}
          />
          <button
            type="submit"
            aria-label={submitLabel}
            disabled={!canSubmit}
            className={cn(
              'absolute right-1.5 bottom-1.5 flex size-7 items-center justify-center rounded-full',
              canSubmit
                ? 'bg-background-brand-default text-foreground-neutral-inverse cursor-pointer'
                : 'bg-background-neutral-subtle text-foreground-neutral-faded cursor-not-allowed',
            )}
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        {onCancel ? (
          <button
            type="button"
            aria-label="Cancel"
            className="text-foreground-neutral-subtle hover:bg-background-neutral-subtle hover:text-foreground-neutral-default mb-1.5 flex size-7 cursor-pointer items-center justify-center rounded-lg"
            onClick={onCancel}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-body-small-default text-red-700">{error}</p>
      ) : null}
    </form>
  );
}

function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
