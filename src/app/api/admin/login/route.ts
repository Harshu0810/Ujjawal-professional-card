import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { setAdminSessionCookie } from '@/lib/auth/session';
import { checkLoginRateLimit, recordFailedLogin, resetLoginAttempts } from '@/lib/auth/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkLoginRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const user = db.adminUsers.find((u) => u.username === username);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      recordFailedLogin(ip);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    user.lastLoginAt = new Date().toISOString();
    writeDatabase(db);
    resetLoginAttempts(ip);

    // Issue signed session cookie
    await setAdminSessionCookie(user.username);

    return NextResponse.json({
      success: true,
      username: user.username
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
