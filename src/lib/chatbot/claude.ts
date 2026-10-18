import { buildSystemPrompt } from './prompt';
import { retrieveRelevantChunks } from '@/lib/rag';
import { readDatabase } from '@/lib/db';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  reply: string;
  modelUsed: string;
  providerUsed: string; // v4: which provider actually served the response
  retrievedSections: string[];
  isFallback: boolean;
}

// ─── Provider-Specific Callers ──────────────────────────────────────────────

/**
 * Call Anthropic Claude API (primary provider, v4 Section 2).
 * Returns null on failure so fallback chain can continue.
 */
export async function callClaude(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  modelName: string,
  apiKey: string
): Promise<{ text: string; model: string } | null> {
  if (!apiKey || apiKey.includes('placeholder')) return null;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 200,
        system: systemPrompt,
        messages
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (text) return { text, model: modelName };
    }

    console.warn(`[Claude] API error status ${res.status}`);
    return null;
  } catch (err) {
    console.error('[Claude] API call error:', err);
    return null;
  }
}

/**
 * Call Google Gemini API (first fallback, v4 Section 2).
 * Uses the free-tier generativelanguage.googleapis.com endpoint.
 */
export async function callGemini(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  apiKey?: string,
  modelName = 'gemini-2.5-flash'
): Promise<{ text: string; model: string } | null> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key.includes('placeholder')) return null;

  const model = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    // Convert messages to Gemini contents format
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7
          }
        })
      }
    );

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text, model };
    }

    console.warn(`[Gemini] API error status ${res.status}`);
    return null;
  } catch (err) {
    console.error('[Gemini] API call error:', err);
    return null;
  }
}

/**
 * Call Groq API (second fallback, v4 Section 2).
 * Uses OpenAI-compatible endpoint with fast inference.
 */
export async function callGroq(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  apiKey?: string,
  modelName = 'llama-3.3-70b-versatile'
): Promise<{ text: string; model: string } | null> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key || key.includes('placeholder')) return null;

  const model = modelName || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  try {
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text, model };
    }

    console.warn(`[Groq] API error status ${res.status}`);
    return null;
  } catch (err) {
    console.error('[Groq] API call error:', err);
    return null;
  }
}

/**
 * Call Local LLM via Ollama Serve (supports live ngrok tunnels and local network endpoints).
 * Supports both OpenAI-compatible `/v1/chat/completions` and native `/api/chat`.
 * Automatically sets 'ngrok-skip-browser-warning' to bypass free-tier ngrok splash screens.
 */
export async function callOllama(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  rawBaseUrl?: string,
  modelName = 'llama3.2'
): Promise<{ text: string; model: string } | null> {
  const baseUrl = (rawBaseUrl || process.env.OLLAMA_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!baseUrl) return null;

  const model = modelName || process.env.OLLAMA_MODEL || 'llama3.2';

  // 1. Try OpenAI-compatible endpoint (/v1/chat/completions)
  try {
    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for local model

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Ujjawal-AI-Assistant'
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        max_tokens: 200,
        temperature: 0.7
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return { text, model: `Ollama (${model})` };
    }
  } catch (err) {
    console.warn('[Ollama v1] Connection error:', err);
  }

  // 2. Fallback to native Ollama API (/api/chat)
  try {
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'User-Agent': 'Ujjawal-AI-Assistant'
      },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false,
        options: {
          num_predict: 200,
          temperature: 0.7
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const text = data.message?.content;
      if (text) return { text, model: `Ollama (${model})` };
    }
    console.warn(`[Ollama native] API error status ${res.status}`);
  } catch (err) {
    console.error('[Ollama native] Connection error:', err);
  }

  return null;
}

// ─── Unified Response Generator ─────────────────────────────────────────────

// Track last provider used for admin diagnostic (v4 Section 2)
let lastProviderDiagnostic: { provider: string; model: string; timestamp: string } | null = null;

export function getLastProviderDiagnostic() {
  return lastProviderDiagnostic;
}

export async function generateChatResponse(
  messages: ChatMessage[],
  latestQuery: string,
  exchangesUsed = 0,
  maxExchanges = 3
): Promise<ChatCompletionResult> {
  const db = readDatabase();
  const chatbotConfig = db.chatbotConfig.published;
  const siteConfig = db.siteConfig.published;

  // 1. Retrieve grounded context from knowledge document via RAG
  const relevantChunks = retrieveRelevantChunks(latestQuery, 3);
  const retrievedSections = relevantChunks.map((c) => c.sectionTitle);
  const contextText = relevantChunks.map((c) => c.content).join('\n\n');

  // 2. Build system prompt per v3 Section 2E + v4 anti-leakage
  const systemPrompt = buildSystemPrompt({
    ownerName: 'Ujjawal',
    contactMethod: siteConfig.contactLinks[0]?.url || 'WhatsApp (+91 98765 43210)',
    retrievedBusinessFacts: contextText,
    exchangesUsed,
    maxExchanges
  });

  const formattedMessages = messages.map((m) => ({
    role: m.role,
    content: m.content
  }));

  // 3. Multi-provider cascade: Claude → Gemini → Groq → Ollama/Local (v4 Section 2)

  // ── Step A: Try Claude first (Admin config or process.env)
  const claudeKey = chatbotConfig.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY;
  const claudeModel = chatbotConfig.modelName || process.env.CLAUDE_MODEL || 'claude-haiku-5-5';

  if (claudeKey && claudeKey.startsWith('sk-ant-') && !claudeKey.includes('placeholder')) {
    const result = await callClaude(systemPrompt, formattedMessages, claudeModel, claudeKey);
    if (result) {
      lastProviderDiagnostic = { provider: 'Claude', model: result.model, timestamp: new Date().toISOString() };
      return {
        reply: result.text,
        modelUsed: result.model,
        providerUsed: 'Claude',
        retrievedSections,
        isFallback: false
      };
    }
    console.warn('[Fallback] Claude call failed or returned null, cascading...');
  }

  // ── Step B: Try Gemini as first fallback (Admin config or process.env)
  const geminiKey = chatbotConfig.geminiApiKey?.trim() || process.env.GEMINI_API_KEY;
  const geminiModel = chatbotConfig.geminiModel?.trim() || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (geminiKey && !geminiKey.includes('placeholder')) {
    const geminiResult = await callGemini(systemPrompt, formattedMessages, geminiKey, geminiModel);
    if (geminiResult) {
      lastProviderDiagnostic = { provider: 'Gemini (fallback)', model: geminiResult.model, timestamp: new Date().toISOString() };
      return {
        reply: geminiResult.text,
        modelUsed: geminiResult.model,
        providerUsed: 'Gemini',
        retrievedSections,
        isFallback: false
      };
    }
    console.warn('[Fallback] Gemini failed or unavailable, cascading...');
  }

  // ── Step C: Try Groq as second fallback (Admin config or process.env)
  const groqKey = chatbotConfig.groqApiKey?.trim() || process.env.GROQ_API_KEY;
  const groqModel = chatbotConfig.groqModel?.trim() || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (groqKey && !groqKey.includes('placeholder')) {
    const groqResult = await callGroq(systemPrompt, formattedMessages, groqKey, groqModel);
    if (groqResult) {
      lastProviderDiagnostic = { provider: 'Groq (fallback)', model: groqResult.model, timestamp: new Date().toISOString() };
      return {
        reply: groqResult.text,
        modelUsed: groqResult.model,
        providerUsed: 'Groq',
        retrievedSections,
        isFallback: false
      };
    }
    console.warn('[Fallback] Groq failed or unavailable, cascading...');
  }

  // ── Step D: Try Ollama / Local LLM (Live ngrok tunnel URL or local host from Admin config)
  const ollamaBaseUrl = chatbotConfig.ollamaBaseUrl?.trim() || process.env.OLLAMA_BASE_URL;
  const ollamaModel = chatbotConfig.ollamaModel?.trim() || process.env.OLLAMA_MODEL || 'llama3.2';

  if (ollamaBaseUrl) {
    const ollamaResult = await callOllama(systemPrompt, formattedMessages, ollamaBaseUrl, ollamaModel);
    if (ollamaResult) {
      lastProviderDiagnostic = { provider: 'Ollama (Local/ngrok)', model: ollamaResult.model, timestamp: new Date().toISOString() };
      return {
        reply: ollamaResult.text,
        modelUsed: ollamaResult.model,
        providerUsed: 'Ollama',
        retrievedSections,
        isFallback: false
      };
    }
    console.warn('[Fallback] Ollama failed or unavailable, cascading...');
  }

  // 4. Grounded Local Sandbox Fallback Engine (all external/local providers exhausted)
  lastProviderDiagnostic = { provider: 'Local Sandbox (all providers unavailable)', model: 'grounded-rag-engine', timestamp: new Date().toISOString() };
  const queryLower = latestQuery.toLowerCase();

  if (queryLower.includes('who are you') || queryLower.includes('who is ujjawal') || queryLower.includes('about ujjawal') || queryLower.includes('intro')) {
    return {
      reply: `${chatbotConfig.introSummary} He combines AI workflows with performance marketing to scale customer acquisition. What industry or business do you run?`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  if (/^(hi|hello|hey|namaste|greetings)\b/i.test(latestQuery.trim())) {
    return {
      reply: `${chatbotConfig.greeting} Feel free to ask about our marketing systems, or ask me any general question to test my capabilities. What's on your mind today?`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  if (queryLower.includes('service') || queryLower.includes('what do you do') || queryLower.includes('offer')) {
    return {
      reply: `Ujjawal specializes in AI-accelerated ad creative loops (Meta & Google), conversion rate optimization (CRO) for landing pages, and automated lead routing. What is your current biggest marketing bottleneck?`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('fee') || queryLower.includes('rate') || queryLower.includes('retainer')) {
    return {
      reply: `Engagements are structured either as monthly performance growth retainers or fixed funnel audit sprints depending on ad spend volume. Would you like to connect directly on WhatsApp to discuss your specific goals?`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  if (queryLower.includes('weather') || queryLower.includes('joke') || queryLower.includes('trivia') || queryLower.includes('capital') || queryLower.includes('who wrote') || queryLower.includes('python') || queryLower.includes('code')) {
    return {
      reply: `I can answer general knowledge questions while representing Ujjawal's digital marketing practice. If you're also exploring customer acquisition or conversion funnels, I'd be happy to help!`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  if (relevantChunks.length > 0 && relevantChunks[0].content) {
    const snippet = relevantChunks[0].content.slice(0, 180).replace(/\s+/g, ' ');
    return {
      reply: `${snippet}... Feel free to ask more or reach out to Ujjawal on WhatsApp to review your funnels!`,
      modelUsed: 'grounded-rag-engine (local)',
      providerUsed: 'Local',
      retrievedSections,
      isFallback: true
    };
  }

  return {
    reply: chatbotConfig.fallbackResponse,
    modelUsed: 'grounded-rag-engine (local)',
    providerUsed: 'Local',
    retrievedSections,
    isFallback: true
  };
}
