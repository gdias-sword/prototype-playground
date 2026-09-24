export interface Anchor {
  selector: string;
  x: number;
  y: number;
}

export interface StoredComment {
  id: string;
  body: string;
  authorName: string;
  tokenHash: string;
  createdAt: string;
}

export interface StoredThread {
  id: string;
  anchor: Anchor;
  resolved: boolean;
  comments: StoredComment[];
}

export interface CommentFile {
  version: number;
  threads: StoredThread[];
}

export interface PublicComment {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  mine: boolean;
}

export interface PublicThread {
  id: string;
  anchor: Anchor;
  resolved: boolean;
  comments: PublicComment[];
}

export type MutationResult =
  | { ok: true; file: CommentFile }
  | { ok: false; status: number; error: string };

const MAX_BODY_LENGTH = 2000;
const MAX_NAME_LENGTH = 40;
const MAX_THREADS = 200;
const MAX_COMMENTS = 50;
const ANCHOR_SELECTOR = /^body(?: > [a-z][a-z0-9-]*:nth-of-type\([1-9]\d*\))+$/;

export function emptyCommentFile(): CommentFile {
  return { version: 0, threads: [] };
}

export function isAnchorSelector(value: string): boolean {
  return value.length <= 2000 && ANCHOR_SELECTOR.test(value);
}

export function projectComments(
  file: CommentFile,
  tokenHash: string | null,
): { threads: PublicThread[] } {
  return {
    threads: file.threads.map((thread) => ({
      id: thread.id,
      anchor: thread.anchor,
      resolved: thread.resolved,
      comments: thread.comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        authorName: comment.authorName,
        createdAt: comment.createdAt,
        mine: tokenHash != null && comment.tokenHash === tokenHash,
      })),
    })),
  };
}

export function parseCommentFile(value: unknown): CommentFile {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid comment file');
  }
  const record = value as { version?: unknown; threads?: unknown };
  if (typeof record.version !== 'number' || !Array.isArray(record.threads)) {
    throw new Error('Invalid comment file');
  }
  return {
    version: record.version,
    threads: record.threads.map(parseThread),
  };
}

export function createThread(
  file: CommentFile,
  input: {
    anchor: Anchor;
    body: string;
    authorName: string;
    tokenHash: string;
  },
): MutationResult {
  if (file.threads.length >= MAX_THREADS) {
    return {
      ok: false,
      status: 400,
      error: 'This prototype has too many comments.',
    };
  }
  const body = readBody(input.body);
  const authorName = readAuthorName(input.authorName);
  const anchor = readAnchor(input.anchor);
  if (!body || !authorName || !anchor) {
    return { ok: false, status: 400, error: 'Enter a name and a comment.' };
  }
  const now = new Date().toISOString();
  const thread: StoredThread = {
    id: crypto.randomUUID(),
    anchor,
    resolved: false,
    comments: [
      {
        id: crypto.randomUUID(),
        body,
        authorName,
        tokenHash: input.tokenHash,
        createdAt: now,
      },
    ],
  };
  return {
    ok: true,
    file: { version: file.version + 1, threads: [...file.threads, thread] },
  };
}

export function replyToThread(
  file: CommentFile,
  input: {
    threadId: string;
    body: string;
    authorName: string;
    tokenHash: string;
  },
): MutationResult {
  const thread = file.threads.find((item) => item.id === input.threadId);
  if (!thread) {
    return { ok: false, status: 404, error: 'Thread not found.' };
  }
  if (thread.comments.length >= MAX_COMMENTS) {
    return {
      ok: false,
      status: 400,
      error: 'This thread has too many replies.',
    };
  }
  const body = readBody(input.body);
  const authorName = readAuthorName(input.authorName);
  if (!body || !authorName) {
    return { ok: false, status: 400, error: 'Enter a name and a comment.' };
  }
  const comment: StoredComment = {
    id: crypto.randomUUID(),
    body,
    authorName,
    tokenHash: input.tokenHash,
    createdAt: new Date().toISOString(),
  };
  return {
    ok: true,
    file: {
      version: file.version + 1,
      threads: file.threads.map((item) =>
        item.id === thread.id
          ? { ...item, comments: [...item.comments, comment] }
          : item,
      ),
    },
  };
}

export function setThreadResolved(
  file: CommentFile,
  threadId: string,
  resolved: boolean,
): MutationResult {
  const thread = file.threads.find((item) => item.id === threadId);
  if (!thread) {
    return { ok: false, status: 404, error: 'Thread not found.' };
  }
  if (thread.resolved === resolved) {
    return { ok: true, file };
  }
  return {
    ok: true,
    file: {
      version: file.version + 1,
      threads: file.threads.map((item) =>
        item.id === threadId ? { ...item, resolved } : item,
      ),
    },
  };
}

export function deleteComment(
  file: CommentFile,
  commentId: string,
  tokenHash: string,
): MutationResult {
  const thread = file.threads.find((item) =>
    item.comments.some((comment) => comment.id === commentId),
  );
  if (!thread) {
    return { ok: false, status: 404, error: 'Comment not found.' };
  }
  const index = thread.comments.findIndex(
    (comment) => comment.id === commentId,
  );
  const comment = thread.comments[index];
  if (!comment || comment.tokenHash !== tokenHash) {
    return {
      ok: false,
      status: 403,
      error: 'You can only delete your own comment.',
    };
  }
  const threads =
    index === 0
      ? file.threads.filter((item) => item.id !== thread.id)
      : file.threads.map((item) =>
          item.id === thread.id
            ? {
                ...item,
                comments: item.comments.filter(
                  (entry) => entry.id !== commentId,
                ),
              }
            : item,
        );
  return { ok: true, file: { version: file.version + 1, threads } };
}

function parseThread(value: unknown): StoredThread {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid comment file');
  }
  const thread = value as {
    id?: unknown;
    anchor?: unknown;
    resolved?: unknown;
    comments?: unknown;
  };
  if (
    typeof thread.id !== 'string' ||
    typeof thread.resolved !== 'boolean' ||
    !Array.isArray(thread.comments) ||
    !thread.anchor ||
    typeof thread.anchor !== 'object'
  ) {
    throw new Error('Invalid comment file');
  }
  const anchor = thread.anchor as {
    selector?: unknown;
    x?: unknown;
    y?: unknown;
  };
  if (
    typeof anchor.selector !== 'string' ||
    typeof anchor.x !== 'number' ||
    typeof anchor.y !== 'number'
  ) {
    throw new Error('Invalid comment file');
  }
  return {
    id: thread.id,
    resolved: thread.resolved,
    anchor: { selector: anchor.selector, x: anchor.x, y: anchor.y },
    comments: thread.comments.map(parseComment),
  };
}

function parseComment(value: unknown): StoredComment {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid comment file');
  }
  const comment = value as {
    id?: unknown;
    body?: unknown;
    authorName?: unknown;
    tokenHash?: unknown;
    createdAt?: unknown;
  };
  if (
    typeof comment.id !== 'string' ||
    typeof comment.body !== 'string' ||
    typeof comment.authorName !== 'string' ||
    typeof comment.tokenHash !== 'string' ||
    typeof comment.createdAt !== 'string'
  ) {
    throw new Error('Invalid comment file');
  }
  return {
    id: comment.id,
    body: comment.body,
    authorName: comment.authorName,
    tokenHash: comment.tokenHash,
    createdAt: comment.createdAt,
  };
}

function readBody(value: string): string | null {
  const body = value.trim();
  if (!body || body.length > MAX_BODY_LENGTH) return null;
  return body;
}

function readAuthorName(value: string): string | null {
  const authorName = value.trim();
  if (!authorName || authorName.length > MAX_NAME_LENGTH) return null;
  return authorName;
}

function readAnchor(value: Anchor): Anchor | null {
  if (!isAnchorSelector(value.selector)) return null;
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return null;
  if (value.x < -0.01 || value.x > 1.01 || value.y < -0.01 || value.y > 1.01) {
    return null;
  }
  return {
    selector: value.selector,
    x: Math.min(1, Math.max(0, value.x)),
    y: Math.min(1, Math.max(0, value.y)),
  };
}
