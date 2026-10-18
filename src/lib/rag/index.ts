import { readDatabase } from '@/lib/db';

export interface KnowledgeChunk {
  id: string;
  sectionTitle: string;
  content: string;
  keywords: string[];
}

let cachedChunks: KnowledgeChunk[] | null = null;
let lastIndexedTimestamp: string | null = null;

/**
 * Strips document-management metadata, placeholder markers, status labels,
 * and internal scaffolding from raw knowledge text so none of it can leak
 * into model-visible context (v4 Section 1 urgent bug fix).
 */
function sanitizeForRetrieval(text: string): string {
  let cleaned = text;

  // Remove placeholder bracket markers like [DRAFT / DUMMY PLACEHOLDER], [DUMMY PLACEHOLDER: ...], [TODO: ...]
  cleaned = cleaned.replace(/\[(?:DRAFT|DUMMY|PLACEHOLDER|TODO|NOTE|INTERNAL|MOCK)[^\]]*\]/gi, '');
  cleaned = cleaned.replace(/\[[A-Z0-9\s/_:-]{4,}\]/g, '');

  // Remove Status: lines (e.g. "Status: DRAFT / DUMMY CONTENT ONLY")
  cleaned = cleaned.replace(/^\*?\*?Status:\*?\*?\s*.+$/gim, '');

  // Remove lines that are purely internal headings referencing Appendix / RAG Source / Spec
  cleaned = cleaned.replace(/^.*(?:Appendix\s+[A-Z]|RAG\s+Source|Build\s+Plan|Document\s+Overview).*$/gim, '');

  // Remove lines with "DUMMY" or "PLACEHOLDER" as standalone markers
  cleaned = cleaned.replace(/^.*(?:DUMMY|PLACEHOLDER)\s+(?:CONTENT|TEXT|DATA|VALUE).*$/gim, '');

  // Clean dangling empty labels like "- Legal / Working Name: \n" or "- Positioning: "
  cleaned = cleaned.replace(/^[*-]\s*[^:\n]+:\s*$/gm, '');

  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

export function parseKnowledgeDocument(markdownContent: string): KnowledgeChunk[] {
  const sections = markdownContent.split(/\n##\s+/);
  const chunks: KnowledgeChunk[] = [];

  for (let i = 0; i < sections.length; i++) {
    const rawSection = sections[i].trim();
    if (!rawSection) continue;

    const firstLineEnd = rawSection.indexOf('\n');
    let title = 'General Information';
    let body = rawSection;

    if (firstLineEnd !== -1) {
      title = rawSection.slice(0, firstLineEnd).trim().replace(/^#+\s*/, '');
      body = rawSection.slice(firstLineEnd).trim();
    }

    // Sanitize both title and body to strip metadata scaffolding
    const cleanTitle = sanitizeForRetrieval(title) || 'General Information';
    const cleanBody = sanitizeForRetrieval(body);

    // Skip chunks that are empty after sanitization
    if (!cleanBody || cleanBody.length < 10) continue;

    // Extract keywords for TF-IDF / term frequency matching
    const tokens = (cleanTitle + ' ' + cleanBody)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    chunks.push({
      id: `chunk-${i}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      sectionTitle: cleanTitle,
      content: cleanBody, // Only sanitized content — no metadata leaks
      keywords: Array.from(new Set(tokens))
    });
  }

  return chunks;
}

export function getIndexedKnowledge(): KnowledgeChunk[] {
  const db = readDatabase();
  const currentDoc = db.knowledgeDocument.published;

  if (cachedChunks && lastIndexedTimestamp === currentDoc.lastIndexedAt) {
    return cachedChunks;
  }

  cachedChunks = parseKnowledgeDocument(currentDoc.content);
  lastIndexedTimestamp = currentDoc.lastIndexedAt || new Date().toISOString();
  return cachedChunks;
}

export function retrieveRelevantChunks(query: string, topK = 3): KnowledgeChunk[] {
  const chunks = getIndexedKnowledge();
  if (chunks.length === 0) return [];

  const queryTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  // Score chunks by keyword match frequency
  const scored = chunks.map((chunk) => {
    let score = 0;
    for (const token of queryTokens) {
      if (chunk.sectionTitle.toLowerCase().includes(token)) {
        score += 5; // Title match has high weight
      }
      if (chunk.keywords.includes(token)) {
        score += 2;
      }
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Return top K chunks with positive score.
  // CRITICAL (v4 Section 1): Do NOT fallback to random chunks if score is 0!
  // Off-topic or general queries must get [] so no business scaffolding is passed to model.
  const top = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (top.length === 0) {
    return [];
  }
  return top.slice(0, topK);
}
