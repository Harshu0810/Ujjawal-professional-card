import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { rollbackToVersion } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { versionId } = await req.json();
    if (!versionId) {
      return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
    }

    const success = rollbackToVersion(versionId);
    if (!success) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, versionId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Rollback failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
