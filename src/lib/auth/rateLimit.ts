interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const attemptsStore = new Map<string, AttemptRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attemptsStore.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Check if window has expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    attemptsStore.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  const record = attemptsStore.get(identifier);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    attemptsStore.set(identifier, { count: 1, firstAttemptAt: now });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
  }
}

export function resetLoginAttempts(identifier: string): void {
  attemptsStore.delete(identifier);
}
