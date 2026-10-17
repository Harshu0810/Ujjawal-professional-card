import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, ChatMessage } from '@/lib/chatbot/claude';

// Simple in-memory sliding window rate limiter for chat requests
const chatLimits = new Map<string, { count: number; firstRequestAt: number }>();
const MAX_MESSAGES_PER_MINUTE = 12;
const WINDOW_MS = 60 * 1000;

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = chatLimits.get(ip);

  if (!record || now - record.firstRequestAt > WINDOW_MS) {
    chatLimits.set(ip, { count: 1, firstRequestAt: now });
    return true;
  }

  if (record.count >= MAX_MESSAGES_PER_MINUTE) {
    return false;
  }

  record.count += 1;
  return true;
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

    const body = await req.json();
    const message: string = (body.message || '').trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message length exceeds the maximum 1,000 character limit.' },
        { status: 400 }
      );
    }

    // Append latest query to formatted conversation
    const formattedHistory: ChatMessage[] = [
      ...history.slice(-6), // Keep recent turns for context window efficiency
      { role: 'user', content: message }
    ];

    const result = await generateChatResponse(formattedHistory, message);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed,
      retrievedSections: result.retrievedSections,
      isFallback: result.isFallback
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error in chat pipeline';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
