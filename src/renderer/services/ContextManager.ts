import {
  ChapterSummary,
  CompressedContext,
  FullContext,
  GenerationContext,
  KnowledgeBase,
  ValidationResult
} from '../types';

interface RelevantHistory {
  summaries: ChapterSummary[];
  extractedEntities: string[];
}

export class ContextManager {
  async buildGenerationContext(
    knowledgeBase: KnowledgeBase,
    currentChapterIndex: number
  ): Promise<GenerationContext> {
    const fullContext: FullContext = {
      core: this.composeCoreContext(knowledgeBase),
      dynamic: this.composeDynamicContext(knowledgeBase, currentChapterIndex)
    };

    const compressed = this.compressContext(fullContext);
    return {
      coreContext: compressed.core,
      dynamicContext: compressed.dynamic,
      tokenBudget: 1600
    };
  }

  private composeCoreContext(knowledgeBase: KnowledgeBase): string {
    const outline = knowledgeBase.outline;
    const outlineText = outline
      ? `${outline.title}\n${outline.premise}\n${outline.worldbuilding}`
      : 'No outline yet';
    const characterText = knowledgeBase.characterCards
      .map(c => `${c.name} (${c.role}): ${c.traits.join(', ')}`)
      .join('\n');
    return `${outlineText}\nCharacters:\n${characterText}`;
  }

  private composeDynamicContext(knowledgeBase: KnowledgeBase, currentChapterIndex: number): string {
    const relevantSummaries = knowledgeBase.chapterSummaries.filter(
      summary => summary.chapterIndex < currentChapterIndex
    );
    const entitySet = new Set(
      relevantSummaries.flatMap(summary => this.extractKeyEntities(summary.summary))
    );
    const related = this.findRelatedHistory(Array.from(entitySet), knowledgeBase);
    return `${relevantSummaries.map(s => s.summary).join('\n')}\nRelated:${related.summaries
      .map(s => s.summary)
      .join('\n')}`;
  }

  private compressContext(fullContext: FullContext): CompressedContext {
    const limit = 800; // naive compression placeholder
    const trim = (text: string) => (text.length > limit ? `${text.slice(0, limit)}...` : text);
    return { core: trim(fullContext.core), dynamic: trim(fullContext.dynamic) };
  }

  private extractKeyEntities(content: string): string[] {
    const matches = content.match(/[A-Z][a-z]+/g) || [];
    return Array.from(new Set(matches)).slice(0, 10);
  }

  private findRelatedHistory(entities: string[], knowledgeBase: KnowledgeBase): RelevantHistory {
    const summaries = knowledgeBase.chapterSummaries.filter(summary =>
      entities.some(entity => summary.summary.includes(entity))
    );
    return { summaries, extractedEntities: entities };
  }

  validateOutlineConsistency(outline: KnowledgeBase['outline']): ValidationResult {
    if (!outline) return { valid: false, issues: ['缺少大纲'] };
    const issues: string[] = [];
    if (!outline.premise) issues.push('缺少故事前提');
    if (outline.mainCharacters.length === 0) issues.push('至少需要一个角色');
    return { valid: issues.length === 0, issues };
  }
}

// Export CompressedContext type used internally
export type { RelevantHistory, CompressedContext };
