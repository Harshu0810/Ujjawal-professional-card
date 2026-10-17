import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, getCurrentAdminSession } from '@/lib/auth/session';

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}
