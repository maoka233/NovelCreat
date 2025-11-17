import {
  GenerationContext,
  GeneratedContent,
  NovelOutline,
  AIRequest,
  AIResponse,
  AIStreamChunk
} from '../types';

const TOKEN_LIMIT = 1600;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Enhanced DeepSeek API Service with stream support, error handling, and retry mechanism
 */
export class DeepSeekService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string, apiBaseUrl?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    this.apiBaseUrl = apiBaseUrl || process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com';
  }

  /**
   * Validate API key is configured
   */
  validateApiKey(): { valid: boolean; error?: string } {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      return { valid: false, error: 'API Key is not configured' };
    }
    if (this.apiKey === 'your_api_key_here') {
      return { valid: false, error: 'Please replace placeholder API Key with your actual key' };
    }
    return { valid: true };
  }

  /**
   * Call DeepSeek API with retry mechanism
   */
  private async callApi(prompt: string, options: Partial<AIRequest> = {}): Promise<AIResponse> {
    const validation = this.validateApiKey();
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const request: AIRequest = {
      prompt,
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      stream: options.stream || false,
      context: options.context
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Placeholder implementation - replace with actual API call
        // In real implementation, this would make an HTTP request to DeepSeek API
        const response = await this.mockApiCall(request);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`[DeepSeekService] Attempt ${attempt}/${MAX_RETRIES} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY * attempt);
        }
      }
    }

    throw new Error(`API call failed after ${MAX_RETRIES} retries: ${lastError?.message}`);
  }

  /**
   * Call API with streaming response
   */
  async callApiStream(
    prompt: string,
    onChunk: (chunk: AIStreamChunk) => void,
    options: Partial<AIRequest> = {}
  ): Promise<void> {
    const validation = this.validateApiKey();
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Placeholder implementation for streaming
    // In real implementation, this would handle Server-Sent Events (SSE) or similar
    const response = await this.callApi(prompt, { ...options, stream: true });

    // Simulate streaming by chunking the response
    const words = response.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk: AIStreamChunk = {
        content: words[i] + ' ',
        done: i === words.length - 1
      };
      onChunk(chunk);
      await this.delay(50); // Simulate streaming delay
    }
  }

  /**
   * Generate chapter content with context
   */
  async generateChapter(prompt: string, context: GenerationContext): Promise<GeneratedContent> {
    const mergedPrompt = this.buildPromptWithContext(prompt, context);
    const response = await this.callApi(mergedPrompt);

    return {
      title: this.extractTitle(prompt) || 'Generated Chapter',
      body: response.content
    };
  }

  /**
   * Generate chapter with streaming
   */
  async generateChapterStream(
    prompt: string,
    context: GenerationContext,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<void> {
    const mergedPrompt = this.buildPromptWithContext(prompt, context);
    await this.callApiStream(mergedPrompt, onChunk);
  }

  /**
   * Rewrite chapter with specific instructions
   */
  async rewriteChapter(content: string, instruction: string): Promise<string> {
    const prompt = `请按以下要求改写内容：\n${instruction}\n\n原始内容：\n${content}`;
    const response = await this.callApi(prompt);
    return response.content;
  }

  /**
   * Polish chapter content
   */
  async polishChapter(content: string): Promise<string> {
    const prompt = `请优化以下内容的叙事语调和清晰度，使其更加流畅易读：\n\n${content}`;
    const response = await this.callApi(prompt);
    return response.content;
  }

  /**
   * Generate novel outline
   */
  async generateOutline(description: string, style: string): Promise<NovelOutline> {
    const prompt = `请为以下小说创意生成详细大纲：\n描述：${description}\n风格：${style}\n\n请包含：\n1. 故事前提\n2. 主要角色（至少3个）\n3. 情节结构（三幕式）\n4. 世界观设定\n5. 章节规划（至少10章）`;

    const response = await this.callApi(prompt);

    // Parse the response into structured outline
    // This is a simplified version - real implementation would have better parsing
    return {
      title: description,
      genre: style,
      premise: response.content,
      mainCharacters: [],
      plotStructure: ['第一幕：开端', '第二幕：发展', '第三幕：高潮与结局'],
      worldbuilding: '世界观设定待完善',
      chapters: []
    };
  }

  /**
   * Count tokens in text (approximate)
   */
  countTokens(text: string): number {
    // Simplified token counting - real implementation should use proper tokenizer
    return Math.ceil(text.length / 4);
  }

  /**
   * Enforce token limit on context
   */
  enforceTokenLimit(context: GenerationContext): GenerationContext {
    const totalTokens =
      this.countTokens(context.coreContext) + this.countTokens(context.dynamicContext);

    if (totalTokens <= TOKEN_LIMIT) {
      return context;
    }

    const ratio = TOKEN_LIMIT / totalTokens;
    const trim = (text: string) => text.slice(0, Math.floor(text.length * ratio));

    return {
      ...context,
      coreContext: trim(context.coreContext),
      dynamicContext: trim(context.dynamicContext),
      tokenBudget: TOKEN_LIMIT
    };
  }

  /**
   * Build prompt with context
   */
  private buildPromptWithContext(prompt: string, context: GenerationContext): string {
    return `
核心背景：
${context.coreContext}

最近发展：
${context.dynamicContext}

任务：
${prompt}
`.trim();
  }

  /**
   * Extract title from prompt
   */
  private extractTitle(prompt: string): string | null {
    const lines = prompt.split('\n');
    return lines[0]?.trim() || null;
  }

  /**
   * Mock API call - replace with real implementation
   */
  private async mockApiCall(request: AIRequest): Promise<AIResponse> {
    // Simulate API delay
    await this.delay(500);

    // Placeholder response
    return {
      content: `AI 生成的内容基于提示：${request.prompt.substring(0, 100)}...`,
      tokenUsage: {
        prompt: this.countTokens(request.prompt),
        completion: 200,
        total: this.countTokens(request.prompt) + 200
      },
      model: 'deepseek-chat',
      finishReason: 'stop'
    };
  }

  /**
   * Delay utility for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Set API base URL
   */
  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }
}
