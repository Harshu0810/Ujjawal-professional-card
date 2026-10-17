import { NextRequest, NextResponse } from 'next/server';
import { getAvatarAdapter } from '@/lib/avatar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const adapter = getAvatarAdapter(body.provider);

    const session = await adapter.createSession({
      provider: adapter.providerName,
      avatarId: body.avatarId,
      sourceImageUrl: body.sourceImageUrl,
      voiceId: body.voiceId,
      language: body.language || 'hinglish',
      playbackMode: body.playbackMode || 'autoplay-muted'
    });

    return NextResponse.json({
      success: true,
      session,
      isVoiceBundled: adapter.isVoiceBundled(),
      estimatedPerMinuteRate: adapter.getEstimatedPerMinuteRate()
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Session initialization error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId parameter' }, { status: 400 });
    }

    const adapter = getAvatarAdapter();
    const success = await adapter.closeSession(sessionId);

    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Session close error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
