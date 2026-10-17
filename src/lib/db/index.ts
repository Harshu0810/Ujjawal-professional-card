import fs from 'node:fs';
import path from 'node:path';
import {
  SiteConfig,
  BenefitCard,
  UseCaseVisual,
  ReferenceVisual,
  AvatarConfig,
  CaptionTrack,
  KnowledgeDocument,
  ChatbotConfig,
  AdminUser,
  ContentVersion
} from '@/types/content';
import {
  DUMMY_SITE_CONFIG,
  DUMMY_BENEFITS,
  DUMMY_USE_CASES,
  DUMMY_REFERENCE_VISUALS,
  DUMMY_AVATAR_CONFIG,
  DUMMY_CAPTION_TRACK,
  DUMMY_CHATBOT_CONFIG
} from '@/data/dummyContent';
import { hashPassword } from '@/lib/auth/password';

export interface DatabaseSchema {
  siteConfig: {
    published: SiteConfig;
    draft: SiteConfig;
  };
  benefits: {
    published: BenefitCard[];
    draft: BenefitCard[];
  };
  useCases: {
    published: UseCaseVisual[];
    draft: UseCaseVisual[];
  };
  referenceVisuals: {
    published: ReferenceVisual[];
    draft: ReferenceVisual[];
  };
  avatarConfig: {
    published: AvatarConfig;
    draft: AvatarConfig;
  };
  captionTrack: {
    published: CaptionTrack;
    draft: CaptionTrack;
  };
  knowledgeDocument: {
    published: KnowledgeDocument;
    draft: KnowledgeDocument;
  };
  chatbotConfig: {
    published: ChatbotConfig;
    draft: ChatbotConfig;
  };
  adminUsers: AdminUser[];
  versions: ContentVersion[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'content_store.json');

function getInitialDatabase(): DatabaseSchema {
  const initialUsername = process.env.ADMIN_USERNAME || process.env.INITIAL_ADMIN_USERNAME || 'ujjawal_admin';
  const initialPassword = process.env.ADMIN_PASSWORD || process.env.INITIAL_ADMIN_PASSWORD || 'AdminPass2026!Secure';

  const defaultKnowledgeDoc: KnowledgeDocument = {
    id: 'kb-default-v1',
    versionNumber: 1,
    content: `# [DRAFT / DUMMY PLACEHOLDER] Business Knowledge Document (Appendix A RAG Source)\n**Status:** DRAFT / DUMMY CONTENT ONLY\n- Legal / Working Name: [DUMMY PLACEHOLDER: Ujjawal - AI Digital Marketer]\n- Positioning: Helping brands scale customer acquisition with AI marketing systems.`,
    lastIndexedAt: new Date().toISOString(),
    ownerApproved: false
  };

  const initialSchema: DatabaseSchema = {
    siteConfig: {
      published: { ...DUMMY_SITE_CONFIG },
      draft: { ...DUMMY_SITE_CONFIG }
    },
    benefits: {
      published: [...DUMMY_BENEFITS],
      draft: [...DUMMY_BENEFITS]
    },
    useCases: {
      published: [...DUMMY_USE_CASES],
      draft: [...DUMMY_USE_CASES]
    },
    referenceVisuals: {
      published: [...DUMMY_REFERENCE_VISUALS],
      draft: [...DUMMY_REFERENCE_VISUALS]
    },
    avatarConfig: {
      published: { ...DUMMY_AVATAR_CONFIG },
      draft: { ...DUMMY_AVATAR_CONFIG }
    },
    captionTrack: {
      published: { ...DUMMY_CAPTION_TRACK },
      draft: { ...DUMMY_CAPTION_TRACK }
    },
    knowledgeDocument: {
      published: { ...defaultKnowledgeDoc },
      draft: { ...defaultKnowledgeDoc }
    },
    chatbotConfig: {
      published: { ...DUMMY_CHATBOT_CONFIG },
      draft: { ...DUMMY_CHATBOT_CONFIG }
    },
    adminUsers: [
      {
        id: 'admin-1',
        username: initialUsername,
        passwordHash: hashPassword(initialPassword),
        lastLoginAt: undefined
      }
    ],
    versions: [
      {
        id: 'v-initial-1',
        targetEntity: 'all',
        snapshot: {
          siteConfig: DUMMY_SITE_CONFIG,
          benefits: DUMMY_BENEFITS,
          useCases: DUMMY_USE_CASES,
          referenceVisuals: DUMMY_REFERENCE_VISUALS,
          avatarConfig: DUMMY_AVATAR_CONFIG,
          captionTrack: DUMMY_CAPTION_TRACK
        },
        publishedAt: new Date().toISOString(),
        publishedBy: 'system'
      }
    ]
  };

  return initialSchema;
}

export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch {
        // Ignored if read-only
      }
    }

    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      writeDatabase(initial);
      return initial;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;

    // Ensure adminUsers array is present and populated
    if (!parsed.adminUsers || !Array.isArray(parsed.adminUsers) || parsed.adminUsers.length === 0) {
      const initial = getInitialDatabase();
      parsed.adminUsers = initial.adminUsers;
    }

    return parsed;
  } catch (err) {
    console.error('Error reading database, falling back to seed:', err);
    return getInitialDatabase();
  }
}

export function writeDatabase(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn('Filesystem write not permitted (serverless lambda), continuing in-memory:', err);
  }
}

// Helper query operations
export function getPublishedContent() {
  const db = readDatabase();
  return {
    siteConfig: db.siteConfig.published,
    benefits: db.benefits.published,
    useCases: db.useCases.published,
    referenceVisuals: db.referenceVisuals.published,
    avatarConfig: db.avatarConfig.published,
    captionTrack: db.captionTrack.published,
    knowledgeDocument: db.knowledgeDocument.published,
    chatbotConfig: db.chatbotConfig.published
  };
}

export function getDraftContent() {
  const db = readDatabase();
  return {
    siteConfig: db.siteConfig.draft,
    benefits: db.benefits.draft,
    useCases: db.useCases.draft,
    referenceVisuals: db.referenceVisuals.draft,
    avatarConfig: db.avatarConfig.draft,
    captionTrack: db.captionTrack.draft,
    knowledgeDocument: db.knowledgeDocument.draft,
    chatbotConfig: db.chatbotConfig.draft,
    versions: db.versions
  };
}

export function saveDraftContent(partialDraft: Partial<{
  siteConfig: SiteConfig;
  benefits: BenefitCard[];
  useCases: UseCaseVisual[];
  referenceVisuals: ReferenceVisual[];
  avatarConfig: AvatarConfig;
  captionTrack: CaptionTrack;
  knowledgeDocument: KnowledgeDocument;
  chatbotConfig: ChatbotConfig;
}>) {
  const db = readDatabase();
  if (partialDraft.siteConfig) db.siteConfig.draft = partialDraft.siteConfig;
  if (partialDraft.benefits) db.benefits.draft = partialDraft.benefits;
  if (partialDraft.useCases) db.useCases.draft = partialDraft.useCases;
  if (partialDraft.referenceVisuals) db.referenceVisuals.draft = partialDraft.referenceVisuals;
  if (partialDraft.avatarConfig) db.avatarConfig.draft = partialDraft.avatarConfig;
  if (partialDraft.captionTrack) db.captionTrack.draft = partialDraft.captionTrack;
  if (partialDraft.knowledgeDocument) db.knowledgeDocument.draft = partialDraft.knowledgeDocument;
  if (partialDraft.chatbotConfig) db.chatbotConfig.draft = partialDraft.chatbotConfig;

  writeDatabase(db);
  return getDraftContent();
}

export function publishAllDrafts(publishedBy: string): ContentVersion {
  const db = readDatabase();

  // Create snapshot before publishing
  const newVersion: ContentVersion = {
    id: `ver-${Date.now()}`,
    targetEntity: 'all',
    snapshot: {
      siteConfig: { ...db.siteConfig.draft },
      benefits: [...db.benefits.draft],
      useCases: [...db.useCases.draft],
      referenceVisuals: [...db.referenceVisuals.draft],
      avatarConfig: { ...db.avatarConfig.draft },
      captionTrack: { ...db.captionTrack.draft },
      knowledgeDocument: { ...db.knowledgeDocument.draft },
      chatbotConfig: { ...db.chatbotConfig.draft }
    },
    publishedAt: new Date().toISOString(),
    publishedBy
  };

  // Promote draft to published
  db.siteConfig.published = { ...db.siteConfig.draft };
  db.benefits.published = [...db.benefits.draft];
  db.useCases.published = [...db.useCases.draft];
  db.referenceVisuals.published = [...db.referenceVisuals.draft];
  db.avatarConfig.published = { ...db.avatarConfig.draft };
  db.captionTrack.published = { ...db.captionTrack.draft };
  db.knowledgeDocument.published = { ...db.knowledgeDocument.draft };
  db.chatbotConfig.published = { ...db.chatbotConfig.draft };

  db.versions.unshift(newVersion);
  if (db.versions.length > 20) {
    db.versions = db.versions.slice(0, 20); // Keep last 20 versions
  }

  writeDatabase(db);
  return newVersion;
}

export function rollbackToVersion(versionId: string): boolean {
  const db = readDatabase();
  const target = db.versions.find((v) => v.id === versionId);
  if (!target) return false;

  const snapshot = target.snapshot as {
    siteConfig?: SiteConfig;
    benefits?: BenefitCard[];
    useCases?: UseCaseVisual[];
    referenceVisuals?: ReferenceVisual[];
    avatarConfig?: AvatarConfig;
    captionTrack?: CaptionTrack;
    knowledgeDocument?: KnowledgeDocument;
    chatbotConfig?: ChatbotConfig;
  };

  if (snapshot.siteConfig) {
    db.siteConfig.draft = { ...snapshot.siteConfig };
    db.siteConfig.published = { ...snapshot.siteConfig };
  }
  if (snapshot.benefits) {
    db.benefits.draft = [...snapshot.benefits];
    db.benefits.published = [...snapshot.benefits];
  }
  if (snapshot.useCases) {
    db.useCases.draft = [...snapshot.useCases];
    db.useCases.published = [...snapshot.useCases];
  }
  if (snapshot.referenceVisuals) {
    db.referenceVisuals.draft = [...snapshot.referenceVisuals];
    db.referenceVisuals.published = [...snapshot.referenceVisuals];
  }
  if (snapshot.avatarConfig) {
    db.avatarConfig.draft = { ...snapshot.avatarConfig };
    db.avatarConfig.published = { ...snapshot.avatarConfig };
  }
  if (snapshot.captionTrack) {
    db.captionTrack.draft = { ...snapshot.captionTrack };
    db.captionTrack.published = { ...snapshot.captionTrack };
  }
  if (snapshot.knowledgeDocument) {
    db.knowledgeDocument.draft = { ...snapshot.knowledgeDocument };
    db.knowledgeDocument.published = { ...snapshot.knowledgeDocument };
  }
  if (snapshot.chatbotConfig) {
    db.chatbotConfig.draft = { ...snapshot.chatbotConfig };
    db.chatbotConfig.published = { ...snapshot.chatbotConfig };
  }

  writeDatabase(db);
  return true;
}
