import type { NextRequest } from 'next/server';

import {
  VersionError,
  loadVersions,
  recordVersion,
} from '@/playground/versions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('path') ?? '';
  try {
    return json(await loadVersions(pathname), 200);
  } catch (error) {
    return failure(error, 'Could not load versions.');
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Unknown commit.' }, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'Unknown commit.' }, 400);
  }
  const body = payload as { path?: unknown; sha?: unknown };
  if (typeof body.path !== 'string' || typeof body.sha !== 'string') {
    return json({ error: 'Unknown commit.' }, 400);
  }
  try {
    const versions = await recordVersion(body.path, body.sha);
    return json({ versions }, 200);
  } catch (error) {
    return failure(error, 'Could not save this version.');
  }
}

function failure(error: unknown, fallback: string) {
  if (error instanceof VersionError) {
    return json({ error: error.message }, error.status);
  }
  return json({ error: fallback }, 500);
}

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}
