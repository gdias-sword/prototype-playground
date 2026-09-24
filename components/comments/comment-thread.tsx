'use client';

import { useState } from 'react';

import { Button } from '@/design/components/button';
import { Input } from '@/design/components/input';
import { Textarea } from '@/design/components/textarea';
import type { PublicThread } from '@/playground/comment-model';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-small-subtle text-foreground-neutral-subtle">
          {thread.resolved ? 'Resolved' : 'Open'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="small"
          disabled={isSaving}
          onClick={() => onResolve(!thread.resolved)}
        >
          {thread.resolved ? 'Reopen' : 'Resolve'}
        </Button>
      </div>
      <ul className="flex flex-col gap-4">
        {thread.comments.map((comment) => (
          <li key={comment.id} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-body-small-strong text-foreground-neutral-default">
                {comment.authorName}
              </p>
              <time
                dateTime={comment.createdAt}
                className="text-body-small-subtle text-foreground-neutral-faded shrink-0"
              >
                {formatCommentTime(comment.createdAt)}
              </time>
            </div>
            <p className="text-body-medium-default text-foreground-neutral-default wrap-break-word whitespace-pre-wrap">
              {comment.body}
            </p>
            {comment.mine ? (
              <button
                type="button"
                className="text-body-small-subtle text-foreground-neutral-subtle self-start"
                disabled={isSaving}
                onClick={() => onDelete(comment.id)}
              >
                Delete
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <CommentComposer
        authorName={authorName}
        needsName={needsName}
        isSaving={isSaving}
        error={error}
        submitLabel="Reply"
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
  onAuthorNameChange,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [body, setBody] = useState('');
  const canSubmit =
    body.trim().length > 0 && authorName.trim().length > 0 && !isSaving;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!canSubmit) return;
        void onSubmit(body).then((saved) => {
          if (saved) setBody('');
        });
      }}
    >
      {needsName ? (
        <Input
          aria-label="Your name"
          placeholder="Your name"
          maxLength={40}
          value={authorName}
          onChange={(event) => onAuthorNameChange(event.target.value)}
        />
      ) : null}
      <Textarea
        aria-label="Comment"
        placeholder="Add a comment"
        rows={3}
        maxLength={2000}
        value={body}
        className="resize-none"
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />
      {error ? (
        <p className="text-body-small-default text-red-700">{error}</p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" size="small" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="small" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
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
