import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, ChatMessage } from '@/lib/chatbot/claude';
import { readDatabase } from '@/lib/db';

// Rate limiter per IP to prevent spam attacks
const chatRateLimits = new Map<string, { count: number; firstRequestAt: number }>();
const MAX_MESSAGES_PER_MINUTE = 15;
const RATE_WINDOW_MS = 60 * 1000;

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = chatRateLimits.get(ip);

  if (!record || now - record.firstRequestAt > RATE_WINDOW_MS) {
    chatRateLimits.set(ip, { count: 1, firstRequestAt: now });
    return true;
  }

  if (record.count >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }

  record.count += 1;
  return true;
}

// Server-side session exchange counter (v3 Section 2B)
// Enforces 3 questions per session strictly on the server to prevent client-side bypass.
interface SessionRecord {
  count: number;
  lastActiveAt: number;
}
const sessionStore = new Map<string, SessionRecord>();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, rec] of sessionStore.entries()) {
    if (now - rec.lastActiveAt > SESSION_TTL_MS) {
      sessionStore.delete(id);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkChatRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    cleanExpiredSessions();

    const body = await req.json();
    const message: string = (body.message || '').trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];
    const sessionId: string = (body.sessionId || req.headers.get('x-session-id') || ip).trim();

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message length exceeds the maximum 1,000 character limit.' },
        { status: 400 }
      );
    }

    // Retrieve active chatbot config to check configured max exchanges
    const db = readDatabase();
    const maxExchanges = db.chatbotConfig?.published?.maxSessionExchanges || 3;

    // Check server-side session quota
    const now = Date.now();
    const sessionRecord = sessionStore.get(sessionId) || { count: 0, lastActiveAt: now };

    if (sessionRecord.count >= maxExchanges) {
      // v3 Section 2B: Don't silently fail. Plainly tell the visitor they've reached quota and point to contact channels.
      return NextResponse.json({
        success: false,
        quotaExceeded: true,
        reply: `You have reached this session's ${maxExchanges}-question preview limit. To discuss your marketing bottlenecks in detail, review live funnels, or explore an engagement, please connect with Ujjawal directly on WhatsApp or book a 20-minute strategy call!`,
        exchangesUsed: sessionRecord.count,
        maxExchanges,
        remainingExchanges: 0
      });
    }

    // Increment server session counter
    const nextCount = sessionRecord.count + 1;
    sessionStore.set(sessionId, { count: nextCount, lastActiveAt: now });

    // Append latest query to formatted conversation
    const formattedHistory: ChatMessage[] = [
      ...history.slice(-6),
      { role: 'user', content: message }
    ];

    const result = await generateChatResponse(formattedHistory, message, nextCount, maxExchanges);

    return NextResponse.json({
      success: true,
      quotaExceeded: false,
      reply: result.reply,
      modelUsed: result.modelUsed,
      retrievedSections: result.retrievedSections,
      isFallback: result.isFallback,
      exchangesUsed: nextCount,
      maxExchanges,
      remainingExchanges: Math.max(0, maxExchanges - nextCount)
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error in chat pipeline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
