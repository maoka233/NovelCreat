import { DeepSeekService } from './DeepSeekService';
import { NovelOutline, ValidationResult } from '../types';

export class OutlineGenerator {
  constructor(private llm: DeepSeekService) {}

  async generateFromDescription(userInput: string, style: string): Promise<NovelOutline> {
    return this.llm.generateOutline(userInput, style);
  }

  async refineOutline(original: NovelOutline, feedback: string): Promise<NovelOutline> {
    const refinedPremise = await this.llm.polishChapter(`${original.premise}\nFeedback:${feedback}`);
    return { ...original, premise: refinedPremise };
  }

  validateOutlineConsistency(outline: NovelOutline): ValidationResult {
    const issues: string[] = [];
    if (!outline.title) issues.push('缺少标题');
    if (!outline.premise) issues.push('缺少核心前提');
    if (outline.mainCharacters.length === 0) issues.push('缺少主要角色');
    return { valid: issues.length === 0, issues };
  }
}
