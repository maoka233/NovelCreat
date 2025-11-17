import { GenerationContext, GeneratedContent, NovelOutline } from '../types';

const TOKEN_LIMIT = 1600;

export class DeepSeekService {
  constructor(private apiKey?: string) {}

  private async callApi(prompt: string): Promise<string> {
    // Placeholder implementation to keep the template self contained.
    // Real integration should call the DeepSeek API endpoint with proper headers.
    return Promise.resolve(`AI Response for: ${prompt.substring(0, 80)}...`);
  }

  async generateChapter(prompt: string, context: GenerationContext): Promise<GeneratedContent> {
    const mergedPrompt = `${prompt}\nCore:\n${context.coreContext}\nDynamic:\n${context.dynamicContext}`;
    const body = await this.callApi(mergedPrompt);
    return { title: prompt.split('\n')[0] || 'Generated Chapter', body };
  }

  async rewriteChapter(content: string, instruction: string): Promise<string> {
    return this.callApi(`Rewrite with instruction: ${instruction}\n${content}`);
  }

  async polishChapter(content: string): Promise<string> {
    return this.callApi(`Polish narrative tone and clarity:\n${content}`);
  }

  async generateOutline(description: string, style: string): Promise<NovelOutline> {
    const outlineText = await this.callApi(`Outline for ${description} in ${style} style`);
    return {
      title: `${description} (${style})`,
      genre: style,
      premise: outlineText,
      mainCharacters: [],
      plotStructure: ['Act I', 'Act II', 'Act III'],
      worldbuilding: 'Generated world details',
      chapters: []
    };
  }

  countTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  enforceTokenLimit(context: GenerationContext): GenerationContext {
    const totalTokens =
      this.countTokens(context.coreContext) + this.countTokens(context.dynamicContext);
    if (totalTokens <= TOKEN_LIMIT) return context;

    const ratio = TOKEN_LIMIT / totalTokens;
    const trim = (text: string) => text.slice(0, Math.floor(text.length * ratio));

    return {
      ...context,
      coreContext: trim(context.coreContext),
      dynamicContext: trim(context.dynamicContext)
    };
  }
}
