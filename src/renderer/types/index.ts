export interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
  goals: string;
}

export interface WorldSetting {
  id: string;
  name: string;
  description: string;
  rules: string;
}

export interface ChapterSummary {
  chapterIndex: number;
  title: string;
  summary: string;
  keyEntities: string[];
}

export interface PlotPoint {
  id: string;
  description: string;
  impact: string;
}

export interface ConsistencyRule {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary?: ChapterSummary;
}

export interface NovelOutline {
  title: string;
  genre: string;
  premise: string;
  mainCharacters: Character[];
  plotStructure: string[];
  worldbuilding: string;
  chapters: ChapterSummary[];
}

export interface KnowledgeBase {
  outline: NovelOutline | null;
  characterCards: Character[];
  worldSettings: WorldSetting[];
  chapterSummaries: ChapterSummary[];
  plotPoints: PlotPoint[];
  consistencyRules: ConsistencyRule[];
}

export interface FullContext {
  core: string;
  dynamic: string;
}

export interface CompressedContext {
  core: string;
  dynamic: string;
}

export interface GenerationContext {
  coreContext: string;
  dynamicContext: string;
  tokenBudget: number;
  // 新增：当前章节索引，供 DeepSeekService 生成标题等使用
  currentChapterIndex: number;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface GeneratedContent {
  title: string;
  body: string;
}

// Novel type for complete novel information
export interface Novel {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  chapters: Chapter[];
  outline?: NovelOutline;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  status: 'draft' | 'writing' | 'completed';
}

// 写作风格类型，DeepSeekService 会用到
export type WritingStyle = string;

// AI Request types
export interface AIRequest {
  prompt: string;
  context?: GenerationContext;

  // 旧字段（文档中的示例用法）
  maxTokens?: number;

  // 现在 DeepSeekService.callApi / callApiStream 实际使用的字段
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;

  stream?: boolean;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

// AI Response types
export interface AIResponse {
  content: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
}

export interface AIError {
  code: string;
  message: string;
  details?: unknown;
}

// Export formats
export type ExportFormat = 'txt' | 'markdown' | 'html' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeOutline?: boolean;
  includeMetadata?: boolean;
  chapterSeparator?: string;
}

// Backup types
export interface Backup {
  id: string;
  timestamp: Date;
  name: string;
  size: number;
  novelData: Novel;
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  name: string;
  size: number;
}
