import { KnowledgeBase, NovelOutline } from '../types';

export class KnowledgeManager {
  constructor(private storage: StorageService) {}

  async loadKnowledgeBase(): Promise<KnowledgeBase> {
    const stored = await this.storage.load();
    return stored || this.createEmptyKnowledgeBase();
  }

  async saveKnowledgeBase(knowledgeBase: KnowledgeBase): Promise<void> {
    await this.storage.save(knowledgeBase);
  }

  async updateOutline(outline: NovelOutline): Promise<KnowledgeBase> {
    const kb = await this.loadKnowledgeBase();
    const updated = { ...kb, outline };
    await this.saveKnowledgeBase(updated);
    return updated;
  }

  private createEmptyKnowledgeBase(): KnowledgeBase {
    return {
      outline: null,
      characterCards: [],
      worldSettings: [],
      chapterSummaries: [],
      plotPoints: [],
      consistencyRules: []
    };
  }
}

export interface StorageService {
  save(data: KnowledgeBase): Promise<void>;
  load(): Promise<KnowledgeBase | null>;
}
