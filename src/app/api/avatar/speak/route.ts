import { NextRequest, NextResponse } from 'next/server';
import { getAvatarAdapter } from '@/lib/avatar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.scriptText) {
      return NextResponse.json({ error: 'Missing scriptText' }, { status: 400 });
    }

    const adapter = getAvatarAdapter(body.provider);
    const result = await adapter.speak({
      sessionId: body.sessionId || 'active-session',
      scriptText: body.scriptText,
      language: body.language || 'hinglish',
      speedMultiplier: body.speedMultiplier || 1.0
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Speech synthesis error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
