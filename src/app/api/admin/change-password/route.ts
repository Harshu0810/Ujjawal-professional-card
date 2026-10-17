import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { readDatabase, writeDatabase } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const db = readDatabase();
    const user = db.adminUsers.find((u) => u.username === session.username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    user.passwordHash = hashPassword(newPassword);
    writeDatabase(db);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
