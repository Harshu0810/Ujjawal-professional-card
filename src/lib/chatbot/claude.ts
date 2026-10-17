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
  latestQuery: string
): Promise<ChatCompletionResult> {
  const db = readDatabase();
  const chatbotConfig = db.chatbotConfig.published;
  const siteConfig = db.siteConfig.published;

  // 1. Retrieve grounded context from knowledge document via RAG
  const relevantChunks = retrieveRelevantChunks(latestQuery, 3);
  const retrievedSections = relevantChunks.map((c) => c.sectionTitle);
  const contextText = relevantChunks.map((c) => `[SECTION: ${c.sectionTitle}]\n${c.content}`).join('\n\n');

  // 2. Build system prompt per Appendix D
  const systemPrompt = buildSystemPrompt({
    ownerName: 'Ujjawal',
    contactMethod: siteConfig.contactLinks[0]?.url || 'the contact form / WhatsApp',
    retrievedBusinessFacts: contextText
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
          max_tokens: chatbotConfig.maxOutputTokens || 350,
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

  // 4. Grounded Local RAG Engine (Zero-API-key sandbox fallback)
  // Ensures full conversational functionality and adherence to Appendix A/D rules
  const queryLower = latestQuery.toLowerCase();

  // Handle owner intro requests
  if (queryLower.includes('who are you') || queryLower.includes('who is ujjawal') || queryLower.includes('about ujjawal') || queryLower.includes('intro')) {
    return {
      reply: `${chatbotConfig.introSummary} He helps growth-focused brands scale with data-backed ad testing and conversion funnel optimization. May I ask what business you run or what marketing goals you're working on?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle greetings
  if (/^(hi|hello|hey|namaste|greetings)\b/i.test(latestQuery.trim())) {
    return {
      reply: `${chatbotConfig.greeting}`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle services inquiries
  if (queryLower.includes('service') || queryLower.includes('what do you do') || queryLower.includes('offer')) {
    return {
      reply: `Ujjawal specializes in: (1) AI-Accelerated Performance Ad Campaigns (Meta & Google), (2) Conversion Rate Optimization & Landing Page Funnels, and (3) Marketing Automation & Instant Lead Routing. What is the biggest marketing challenge your business is currently facing?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle pricing inquiries
  if (queryLower.includes('price') || queryLower.includes('cost') || queryLower.includes('fee') || queryLower.includes('rate') || queryLower.includes('retainer')) {
    return {
      reply: `Engagements are typically structured as either a continuous monthly growth retainer or scoped project fees for one-off funnel audits. Exact fees depend on your current ad spend volume and growth targets. Would you like to schedule an introductory 20-minute discovery call to discuss your numbers?`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Handle off-topic queries per Appendix D (redirect politely)
  if (queryLower.includes('weather') || queryLower.includes('code python') || queryLower.includes('recipe') || queryLower.includes('joke')) {
    return {
      reply: `I am dedicated specifically to Ujjawal's AI digital marketing business and lead qualification, so I can't assist with general trivia or unrelated topics. If you have questions about performance marketing, ad creatives, or funnels, I'd be glad to help!`,
      modelUsed: 'grounded-rag-engine (local)',
      retrievedSections,
      isFallback: true
    };
  }

  // Grounded context response based on top retrieved chunk
  if (relevantChunks.length > 0 && relevantChunks[0].content) {
    const primaryChunk = relevantChunks[0];
    return {
      reply: `Based on Ujjawal's business information regarding ${primaryChunk.sectionTitle}:\n\n${primaryChunk.content.slice(0, 240)}...\n\nWould you like more details on this, or shall we connect you directly?`,
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
