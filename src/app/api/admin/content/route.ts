import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { getDraftContent, getPublishedContent, saveDraftContent } from '@/lib/db';

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const draft = getDraftContent();
  const published = getPublishedContent();
  return NextResponse.json({ draft, published });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const partialDraft = await req.json();
    const updatedDraft = saveDraftContent(partialDraft);
    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Save draft failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
