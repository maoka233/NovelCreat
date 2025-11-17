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
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

export interface GeneratedContent {
  title: string;
  body: string;
}
