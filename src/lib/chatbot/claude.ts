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
  retrievedSections: string[];
  isFallback: boolean;
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
  const contextText = relevantChunks.map((c) => `[SECTION: ${c.sectionTitle}]\n${c.content}`).join('\n\n');

  // 2. Build system prompt per v3 Section 2E
  const systemPrompt = buildSystemPrompt({
    ownerName: 'Ujjawal',
    contactMethod: siteConfig.contactLinks[0]?.url || 'WhatsApp (+91 98765 43210)',
    retrievedBusinessFacts: contextText,
    exchangesUsed,
    maxExchanges
  });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelName = process.env.CLAUDE_MODEL || chatbotConfig.modelName || 'claude-haiku-5-5';

  // 3. Call Anthropic Claude API if key exists and isn't placeholder
  if (apiKey && apiKey.startsWith('sk-ant-') && !apiKey.includes('placeholder')) {
    try {
      const formattedMessages = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 200, // Enforce strict brevity cost control (v3 Section 2D)
          system: systemPrompt,
          messages: formattedMessages
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.content?.[0]?.text || chatbotConfig.fallbackResponse;
        return {
          reply: replyText,
          modelUsed: modelName,
          retrievedSections,
          isFallback: false
        };
      } else {
        console.warn(`Claude API error status ${res.status}: fallback to grounded RAG engine.`);
      }
    } catch (err) {
      console.error('Claude API call error:', err);
    }
  }

  // 4. Grounded Local Sandbox Fallback Engine
  const queryLower = latestQuery.toLowerCase();

  // Handle owner intro requests
  if (queryLower.includes('who are you') || queryLower.includes('who is ujjawal') || queryLower.includes('about ujjawal') || queryLower.includes('intro')) {
    return {
      reply: `${chatbotConfig.introSummary} He combines AI workflows with performance marketing to scale customer acquisition. What industry or business do you run?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle greetings
  if (/^(hi|hello|hey|namaste|greetings)\b/i.test(latestQuery.trim())) {
    return {
      reply: `${chatbotConfig.greeting} Feel free to ask about our marketing systems, or ask me any general question to test my capabilities. What's on your mind today?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle services inquiries
  if (queryLower.includes('service') || queryLower.includes('what do you do') || queryLower.includes('offer')) {
    return {
      reply: `Ujjawal specializes in AI-accelerated ad creative loops (Meta & Google), conversion rate optimization (CRO) for landing pages, and automated lead routing. What is your current biggest marketing bottleneck?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle pricing inquiries
  if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('fee') || queryLower.includes('rate') || queryLower.includes('retainer')) {
    return {
      reply: `Engagements are structured either as monthly performance growth retainers or fixed funnel audit sprints depending on ad spend volume. Would you like to connect directly on WhatsApp to discuss your specific goals?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle brief general knowledge / testing questions (v3 Section 2A)
  if (queryLower.includes('weather') || queryLower.includes('joke') || queryLower.includes('trivia') || queryLower.includes('capital') || queryLower.includes('who wrote') || queryLower.includes('python') || queryLower.includes('code')) {
    if (queryLower.includes('joke')) {
      return {
        reply: `Why do performance marketers love testing creatives in parallel? Because single-variable experiments never go out of style! How is your current creative testing performing?`,
        modelUsed: 'grounded-rag-engine (local)',
        retrievedSections,
        isFallback: true
      };
    }
    return {
      reply: `I can gladly answer general knowledge questions while representing Ujjawal's digital marketing practice. If you are also exploring customer acquisition or conversion funnels, I can audit your current setup!`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Grounded context response based on top retrieved chunk
  if (relevantChunks.length > 0 && relevantChunks[0].content) {
    const primaryChunk = relevantChunks[0];
    return {
      reply: `Regarding ${primaryChunk.sectionTitle}: ${primaryChunk.content.slice(0, 180)}... Feel free to ask more or reach out to Ujjawal on WhatsApp to review your funnels!`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  return {
    reply: chatbotConfig.fallbackResponse,
    modelUsed: 'grounded-rag-engine (local)',
    retrievedSections,
    isFallback: true
  };
}
