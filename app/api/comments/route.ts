import type { NextRequest } from 'next/server';

import {
  createThread,
  deleteComment,
  projectComments,
  replyToThread,
  setThreadResolved,
  type Anchor,
} from '@/playground/comment-model';
import {
  commentsConfigured,
  hashCommentToken,
  isCommentConfigError,
  isCommentToken,
  prototypeBlobPath,
  readComments,
  updateComments,
} from '@/playground/comment-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('path') ?? '';
  const blobPath = prototypeBlobPath(pathname);
  if (!blobPath) {
    return json({ error: 'Prototype not found.' }, 404);
  }
  if (!commentsConfigured()) {
    return json({ error: 'Comments storage is not configured.' }, 503);
  }
  const token = request.headers.get('x-comment-token');
  const tokenHash = isCommentToken(token) ? hashCommentToken(token) : null;
  try {
    const file = await readComments(blobPath);
    return json(projectComments(file, tokenHash), 200);
  } catch (error) {
    if (isCommentConfigError(error)) {
      return json({ error: 'Comments storage is not configured.' }, 503);
    }
    return json({ error: 'Could not load comments.' }, 500);
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Enter a name and a comment.' }, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Enter a name and a comment.' }, 400);
  }
  const body = payload as {
    action?: unknown;
    path?: unknown;
    anchor?: Anchor;
    threadId?: unknown;
    commentId?: unknown;
    resolved?: unknown;
    body?: unknown;
    authorName?: unknown;
    token?: unknown;
  };
  if (typeof body.path !== 'string') {
    return json({ error: 'Prototype not found.' }, 404);
  }
  const blobPath = prototypeBlobPath(body.path);
  if (!blobPath) {
    return json({ error: 'Prototype not found.' }, 404);
  }
  if (!commentsConfigured()) {
    return json({ error: 'Comments storage is not configured.' }, 503);
  }

  const tokenHash = isCommentToken(body.token)
    ? hashCommentToken(body.token)
    : null;

  try {
    const result = await updateComments(blobPath, (file) => {
      switch (body.action) {
        case 'create':
          if (
            !tokenHash ||
            !body.anchor ||
            typeof body.body !== 'string' ||
            typeof body.authorName !== 'string'
          ) {
            return {
              ok: false,
              status: 400,
              error: 'Enter a name and a comment.',
            };
          }
          return createThread(file, {
            anchor: body.anchor,
            body: body.body,
            authorName: body.authorName,
            tokenHash,
          });
        case 'reply':
          if (
            !tokenHash ||
            typeof body.threadId !== 'string' ||
            typeof body.body !== 'string' ||
            typeof body.authorName !== 'string'
          ) {
            return {
              ok: false,
              status: 400,
              error: 'Enter a name and a comment.',
            };
          }
          return replyToThread(file, {
            threadId: body.threadId,
            body: body.body,
            authorName: body.authorName,
            tokenHash,
          });
        case 'resolve':
          if (
            typeof body.threadId !== 'string' ||
            typeof body.resolved !== 'boolean'
          ) {
            return { ok: false, status: 400, error: 'Thread not found.' };
          }
          return setThreadResolved(file, body.threadId, body.resolved);
        case 'delete':
          if (!tokenHash || typeof body.commentId !== 'string') {
            return {
              ok: false,
              status: 403,
              error: 'You can only delete your own comment.',
            };
          }
          return deleteComment(file, body.commentId, tokenHash);
        default:
          return {
            ok: false,
            status: 400,
            error: 'Enter a name and a comment.',
          };
      }
    });
    if (!result.ok) {
      return json({ error: result.error }, result.status);
    }
    return json(projectComments(result.file, tokenHash), 200);
  } catch (error) {
    if (isCommentConfigError(error)) {
      return json({ error: 'Comments storage is not configured.' }, 503);
    }
    return json({ error: 'Could not save the comment. Try again.' }, 500);
  }
}

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
