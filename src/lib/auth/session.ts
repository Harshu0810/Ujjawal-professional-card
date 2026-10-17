import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'default_dev_session_secret_change_in_production_12345';
const SESSION_TTL_SECONDS = 86400; // 24 hours

export interface SessionPayload {
  username: string;
  role: 'admin';
  expiresAt: number;
}

export function createSessionToken(username: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload: SessionPayload = { username, role: 'admin', expiresAt };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature);

    if (expectedBuffer.length !== actualBuffer.length) return null;
    if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadBase64, 'base64url').toString('utf-8')
    );

    if (payload.expiresAt < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  return verifySessionToken(sessionCookie.value);
}

export async function setAdminSessionCookie(username: string): Promise<string> {
  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  });
  return token;
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
