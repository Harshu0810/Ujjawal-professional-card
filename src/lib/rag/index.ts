import { readDatabase } from '@/lib/db';

export interface KnowledgeChunk {
  id: string;
  sectionTitle: string;
  content: string;
  keywords: string[];
}

let cachedChunks: KnowledgeChunk[] | null = null;
let lastIndexedTimestamp: string | null = null;

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

    // Extract keywords for TF-IDF / term frequency matching
    const tokens = (title + ' ' + body)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    chunks.push({
      id: `chunk-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      sectionTitle: title,
      content: `${title}\n${body}`,
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

  // Return top K chunks with positive score, or fallback to first 2
  const top = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (top.length === 0) {
    return chunks.slice(0, Math.min(topK, 2));
  }
  return top.slice(0, topK);
}
