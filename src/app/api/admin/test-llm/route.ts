import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth/session';
import { callClaude, callGemini, callGroq, callOllama } from '@/lib/chatbot/claude';

export async function POST(req: NextRequest) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { provider, apiKey, model, baseUrl } = await req.json();
    const testPrompt = 'You are a diagnostic bot. Respond in 5 words or less: "Connection test successful."';
    const testMessages = [{ role: 'user', content: 'Ping' }];
    const startTime = Date.now();

    if (provider === 'claude') {
      const key = apiKey || process.env.ANTHROPIC_API_KEY;
      if (!key) {
        return NextResponse.json({ success: false, error: 'No Anthropic API Key provided.' });
      }
      const modelName = model || 'claude-haiku-5-5';
      const result = await callClaude(testPrompt, testMessages, modelName, key);
      const latencyMs = Date.now() - startTime;
      if (result) {
        return NextResponse.json({ success: true, reply: result.text, model: result.model, latencyMs });
      }
      return NextResponse.json({
        success: false,
        error: 'Claude API call returned null. Please check that the key starts with "sk-ant-" and has credits.'
      });
    }

    if (provider === 'gemini') {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        return NextResponse.json({ success: false, error: 'No Gemini API Key provided.' });
      }
      const modelName = model || 'gemini-2.5-flash';
      const result = await callGemini(testPrompt, testMessages, key, modelName);
      const latencyMs = Date.now() - startTime;
      if (result) {
        return NextResponse.json({ success: true, reply: result.text, model: result.model, latencyMs });
      }
      return NextResponse.json({
        success: false,
        error: 'Gemini API call failed. Verify your key from Google AI Studio and model name.'
      });
    }

    if (provider === 'groq') {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key) {
        return NextResponse.json({ success: false, error: 'No Groq API Key provided.' });
      }
      const modelName = model || 'llama-3.3-70b-versatile';
      const result = await callGroq(testPrompt, testMessages, key, modelName);
      const latencyMs = Date.now() - startTime;
      if (result) {
        return NextResponse.json({ success: true, reply: result.text, model: result.model, latencyMs });
      }
      return NextResponse.json({
        success: false,
        error: 'Groq API call failed. Verify your key from console.groq.com.'
      });
    }

    if (provider === 'ollama') {
      const targetUrl = baseUrl || process.env.OLLAMA_BASE_URL;
      if (!targetUrl) {
        return NextResponse.json({
          success: false,
          error: 'No Ollama serve URL provided. Provide an ngrok URL (e.g. https://xxx.ngrok-free.app) or local host.'
        });
      }
      const modelName = model || 'llama3.2';
      const result = await callOllama(testPrompt, testMessages, targetUrl, modelName);
      const latencyMs = Date.now() - startTime;
      if (result) {
        return NextResponse.json({ success: true, reply: result.text, model: result.model, latencyMs });
      }
      return NextResponse.json({
        success: false,
        error: `Could not connect to Ollama at ${targetUrl}. Ensure "ollama serve" is running and ngrok forwarding is active.`
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown provider requested.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Diagnostic test failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
