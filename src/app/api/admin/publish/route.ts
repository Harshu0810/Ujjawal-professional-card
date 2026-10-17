import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { publishAllDrafts } from '@/lib/db';

export async function POST() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const version = publishAllDrafts(session.username);
    return NextResponse.json({ success: true, version });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
