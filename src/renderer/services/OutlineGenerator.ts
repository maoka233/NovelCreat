import { NovelOutline, ValidationResult } from '../types';
import { DeepSeekService } from './DeepSeekService';

export class OutlineGenerator {
  private llm: DeepSeekService;

  constructor(llm: DeepSeekService) {
    this.llm = llm;
  }

  async generateFromDescription(description: string, style: string): Promise<NovelOutline> {
    // DeepSeekService.generateOutline 里把 style 当 WritingStyle，用 string 强转即可
    return this.llm.generateOutline(description, style as any);
  }

  validateOutline(outline: NovelOutline | null): ValidationResult {
    if (!outline) {
      return { valid: false, issues: ['大纲为空'] };
    }
    const issues: string[] = [];
    if (!outline.title) issues.push('缺少标题');
    if (!outline.premise) issues.push('缺少故事前提');
    if (outline.chapters.length === 0) issues.push('至少需要一个章节');
    return { valid: issues.length === 0, issues };
  }

  /**
   * 细化大纲：优先调用 DeepSeek 对前提做润色，失败时本地降级处理
   */
  async refineOutline(original: NovelOutline, feedback: string): Promise<NovelOutline> {
    try {
      const refinedPremise = await this.llm.polishChapter(
        `${original.premise}\n\n【编辑建议】${feedback}`
      );
      return { ...original, premise: refinedPremise };
    } catch (error) {
      console.warn('[OutlineGenerator] refineOutline failed, fallback to local update:', error);
      // 降级策略：不丢失原始前提，只是附加一条提示，保证功能可用
      return {
        ...original,
        premise: `${original.premise}\n\n（细化提示：${feedback}）`
      };
    }
  }
}
