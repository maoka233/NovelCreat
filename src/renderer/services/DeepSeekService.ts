import {
  GenerationContext,
  GeneratedContent,
  NovelOutline,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  Chapter,
  Character,
  WritingStyle
} from '../types';

const TOKEN_LIMIT = 1600;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const STREAM_CHUNK_DELAY = 30;

/**
 * Enhanced DeepSeek API Service with advanced features for novel writing
 */
export class DeepSeekService {
  private apiBaseUrl: string;
  private apiKey: string;
  private abortController: AbortController | null = null;

  constructor(apiKey?: string, apiBaseUrl?: string) {
    this.apiKey = apiKey || window.novelAPI?.env?.DEEPSEEK_API_KEY || '';
    this.apiBaseUrl = apiBaseUrl || window.novelAPI?.env?.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
    this.validateConfiguration();
  }

  /**
   * Validate service configuration
   */
  private validateConfiguration(): void {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      console.warn('[DeepSeekService] API Key not configured. Please set DEEPSEEK_API_KEY.');
    }
    if (!this.apiBaseUrl) {
      throw new Error('[DeepSeekService] API Base URL is required');
    }
  }

  /**
   * Enhanced API call with proper error handling and retry logic
   */
  private async callApi(request: AIRequest): Promise<AIResponse> {
    this.validateApiKey();

    const fullRequest: AIRequest = {
      model: 'deepseek-chat',
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false,
      ...request
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      this.abortController = new AbortController();
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: fullRequest.model,
            messages: [{ role: 'user', content: fullRequest.prompt }],
            max_tokens: fullRequest.max_tokens,
            temperature: fullRequest.temperature,
            top_p: fullRequest.top_p,
            frequency_penalty: fullRequest.frequency_penalty,
            presence_penalty: fullRequest.presence_penalty,
            stream: fullRequest.stream
          }),
          signal: this.abortController.signal
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return this.parseApiResponse(data);

      } catch (error) {
        lastError = error as Error;
        
        if (error.name === 'AbortError') {
          throw error; // Don't retry aborted requests
        }

        console.warn(`[DeepSeekService] Attempt ${attempt}/${MAX_RETRIES} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY * Math.pow(2, attempt - 1)); // Exponential backoff
        }
      } finally {
        this.abortController = null;
      }
    }

    throw new Error(`API call failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /**
   * Enhanced streaming API call with proper SSE handling
   */
  async callApiStream(
    prompt: string,
    onChunk: (chunk: AIStreamChunk) => void,
    options: Partial<AIRequest> = {}
  ): Promise<void> {
    this.validateApiKey();

    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          stream: true
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices[0]?.delta?.content;
              
              if (content) {
                onChunk({
                  content,
                  done: false
                });
                await this.delay(STREAM_CHUNK_DELAY);
              }
            } catch (e) {
              console.warn('[DeepSeekService] Failed to parse stream chunk:', e);
            }
          }
        }
      }

      onChunk({ content: '', done: true });

    } catch (error) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Generate chapter with enhanced context management
   */
  async generateChapter(
    chapterPrompt: string, 
    context: GenerationContext,
    currentChapter?: Chapter
  ): Promise<GeneratedContent> {
    const optimizedContext = this.enforceTokenLimit(context);
    const prompt = this.buildChapterPrompt(chapterPrompt, optimizedContext, currentChapter);
    
    const response = await this.callApi({
      prompt,
      max_tokens: 1500,
      temperature: 0.7
    });

    return {
      title: this.extractChapterTitle(response.content) || `第${context.currentChapterIndex + 1}章`,
      body: response.content.trim(),
      summary: this.generateChapterSummary(response.content),
      tokenUsage: response.tokenUsage
    };
  }

  /**
   * Generate chapter with streaming for better UX
   */
  async generateChapterStream(
    chapterPrompt: string,
    context: GenerationContext,
    onChunk: (chunk: AIStreamChunk) => void,
    currentChapter?: Chapter
  ): Promise<GeneratedContent> {
    const optimizedContext = this.enforceTokenLimit(context);
    const prompt = this.buildChapterPrompt(chapterPrompt, optimizedContext, currentChapter);

    let fullContent = '';
    
    await this.callApiStream(prompt, (chunk) => {
      if (chunk.content) {
        fullContent += chunk.content;
        onChunk(chunk);
      }
    }, {
      max_tokens: 1500,
      temperature: 0.7
    });

    return {
      title: this.extractChapterTitle(fullContent) || `第${context.currentChapterIndex + 1}章`,
      body: fullContent.trim(),
      summary: this.generateChapterSummary(fullContent)
    };
  }

  /**
   * Enhanced rewrite with style preservation
   */
  async rewriteChapter(
    content: string, 
    instruction: string,
    style?: WritingStyle
  ): Promise<string> {
    const prompt = this.buildRewritePrompt(content, instruction, style);
    const response = await this.callApi({
      prompt,
      max_tokens: Math.min(4000, this.countTokens(content) * 2),
      temperature: 0.5 // Lower temperature for more consistent rewriting
    });
    
    return response.content.trim();
  }

  /**
   * Enhanced polishing with style awareness
   */
  async polishChapter(
    content: string, 
    style?: WritingStyle
  ): Promise<string> {
    const styleGuidance = style ? `请保持${style}的写作风格。` : '';
    const prompt = `请优化以下内容的语言表达，提升文学性和可读性，同时保持原文的核心内容和情感。${styleGuidance}\n\n待优化内容：\n${content}`;
    
    const response = await this.callApi({
      prompt,
      max_tokens: Math.min(3000, this.countTokens(content) * 1.5),
      temperature: 0.3 // Very low temperature for minimal changes
    });
    
    return response.content.trim();
  }

  /**
   * Enhanced outline generation with structured output
   */
  async generateOutline(
    description: string, 
    style: WritingStyle,
    length: 'short' | 'medium' | 'long' = 'medium'
  ): Promise<NovelOutline> {
    const chapterCounts = { short: 8, medium: 12, long: 20 };
    const chapterCount = chapterCounts[length];

    const prompt = `作为专业小说作家，请为以下创意生成详细的小说大纲：

创意描述：${description}
写作风格：${style}
预计篇幅：${chapterCount}章

请严格按照以下JSON格式回复：
{
  "title": "小说标题",
  "genre": "题材类型",
  "premise": "故事核心前提（200字以内）",
  "mainCharacters": [
    {
      "name": "角色名",
      "role": "主角/配角/反派",
      "personality": "性格特点",
      "background": "背景故事",
      "goal": "角色目标",
      "development": "角色成长弧线"
    }
  ],
  "plotStructure": {
    "beginning": "开端（建立世界和冲突）",
    "middle": "发展（冲突升级和角色成长）", 
    "end": "结局（冲突解决和主题升华）"
  },
  "worldSettings": {
    "time": "时代背景",
    "location": "主要场景",
    "rules": "世界观特殊规则",
    "culture": "文化社会背景"
  },
  "chapterOutline": [
    {
      "chapter": 1,
      "title": "章节标题", 
      "summary": "章节概要（100字以内）",
      "keyEvents": ["关键事件1", "关键事件2"]
    }
  ],
  "themes": ["主题1", "主题2"],
  "conflicts": ["主要冲突描述"]
}`;

    const response = await this.callApi({
      prompt,
      max_tokens: 3000,
      temperature: 0.8
    });

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as NovelOutline;
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.warn('[DeepSeekService] Failed to parse outline JSON, falling back to structured parsing');
      return this.parseStructuredOutline(response.content, description, style);
    }
  }

  /**
   * Continue story from existing content
   */
  async continueStory(
    previousChapter: Chapter,
    context: GenerationContext,
    direction?: string
  ): Promise<GeneratedContent> {
    const prompt = this.buildContinuationPrompt(previousChapter, context, direction);
    return this.generateChapter(prompt, context, previousChapter);
  }

  /**
   * Advanced token counting (approximate for Chinese text)
   */
  countTokens(text: string): number {
    if (!text) return 0;
    
    // More accurate estimation for Chinese text
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const punctuation = (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length;
    
    // Estimation: Chinese chars ~1.3 tokens, English words ~1.3 tokens per word
    return Math.ceil(chineseChars * 1.3 + englishWords * 1.3 + punctuation * 0.5);
  }

  /**
   * Smart token limit enforcement
   */
  enforceTokenLimit(context: GenerationContext): GenerationContext {
    let coreTokens = this.countTokens(context.coreContext);
    let dynamicTokens = this.countTokens(context.dynamicContext);
    let totalTokens = coreTokens + dynamicTokens;

    if (totalTokens <= TOKEN_LIMIT) {
      return { ...context, tokenBudget: TOKEN_LIMIT - totalTokens };
    }

    // Prioritize core context, compress dynamic context
    const coreRatio = Math.min(1, (TOKEN_LIMIT * 0.6) / coreTokens);
    const dynamicRatio = Math.min(1, (TOKEN_LIMIT * 0.4) / dynamicTokens);

    return {
      ...context,
      coreContext: this.compressText(context.coreContext, coreRatio),
      dynamicContext: this.compressText(context.dynamicContext, dynamicRatio),
      tokenBudget: TOKEN_LIMIT - this.countTokens(context.coreContext) - this.countTokens(context.dynamicContext)
    };
  }

  /**
   * Abort current request
   */
  abortCurrentRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Validate API key configuration
   */
  private validateApiKey(): void {
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      throw new Error('DeepSeek API Key 未配置。请在设置中配置您的API密钥。');
    }
  }

  /**
   * Parse API response
   */
  private parseApiResponse(data: any): AIResponse {
    return {
      content: data.choices[0]?.message?.content || '',
      tokenUsage: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      },
      model: data.model || 'deepseek-chat',
      finishReason: data.choices[0]?.finish_reason || 'stop'
    };
  }

  /**
   * Build enhanced chapter generation prompt
   */
  private buildChapterPrompt(
    prompt: string, 
    context: GenerationContext, 
    currentChapter?: Chapter
  ): string {
    return `你是一位专业小说作家，请基于以下背景继续创作：

【故事大纲】
${context.coreContext}

【前情提要】
${context.dynamicContext}

${currentChapter ? `【当前章节草稿】\n${currentChapter.body}\n\n请基于以上草稿进行完善和扩展：` : ''}

【创作任务】
${prompt}

【写作要求】
1. 保持角色性格和世界观的一致性
2. 推进情节发展，制造适当的悬念
3. 注重场景描写和情感表达
4. 章节结尾要有适当的悬念或转折
5. 语言流畅，符合文学作品的表达习惯

请开始创作：`;
  }

  /**
   * Build rewrite prompt
   */
  private buildRewritePrompt(
    content: string, 
    instruction: string, 
    style?: WritingStyle
  ): string {
    const styleGuidance = style ? `请保持${style}的写作风格。` : '';
    return `请按照以下要求改写内容：${instruction}
${styleGuidance}

原始内容：
${content}

改写要求：
1. 严格遵循改写指令
2. 保持原文核心情节和情感
3. 提升语言表达质量
4. 确保改写后的内容自然流畅

改写结果：`;
  }

  /**
   * Build story continuation prompt
   */
  private buildContinuationPrompt(
    previousChapter: Chapter,
    context: GenerationContext,
    direction?: string
  ): string {
    const directionText = direction ? `\n【发展方向】\n${direction}` : '';
    
    return `请基于前一章内容继续创作下一章。

前一章标题：${previousChapter.title}
前一章内容：${previousChapter.body.substring(0, 500)}...${directionText}

请自然延续故事发展：`;
  }

  /**
   * Extract chapter title from content
   */
  private extractChapterTitle(content: string): string | null {
    // Look for title patterns in the first few lines
    const lines = content.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      // Match common title patterns
      if (trimmed && 
          !trimmed.startsWith('【') && 
          !trimmed.startsWith('第') && 
          trimmed.length < 50 && 
          !trimmed.includes('：') &&
          !trimmed.includes('”')) {
        return trimmed.replace(/[#*\"']/g, '').trim();
      }
    }
    return null;
  }

  /**
   * Generate chapter summary
   */
  private generateChapterSummary(content: string): string {
    // Simple summary generation - could be enhanced
    const sentences = content.split(/[。！？.!?]/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).join('。') + '。';
  }

  /**
   * Compress text while preserving meaning
   */
  private compressText(text: string, ratio: number): string {
    if (ratio >= 1) return text;
    
    const targetLength = Math.floor(text.length * ratio);
    if (targetLength <= 100) return text.substring(0, targetLength);
    
    // Simple compression by removing less important parts
    const sentences = text.split(/[。！？.!?]/);
    let compressed = '';
    let currentLength = 0;
    
    for (const sentence of sentences) {
      if (currentLength + sentence.length <= targetLength) {
        compressed += sentence + '。';
        currentLength += sentence.length + 1;
      } else {
        break;
      }
    }
    
    return compressed || text.substring(0, targetLength);
  }

  /**
   * Fallback outline parsing
   */
  private parseStructuredOutline(
    content: string, 
    description: string, 
    style: WritingStyle
  ): NovelOutline {
    // Basic parsing logic for when JSON parsing fails
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      title: lines.find(line => line.includes('标题'))?.split('：')[1]?.trim() || description,
      genre: style,
      premise: lines.find(line => line.includes('前提') || line.includes('核心'))?.split('：')[1]?.trim() || '',
      mainCharacters: [],
      plotStructure: {
        beginning: '',
        middle: '',
        end: ''
      },
      worldSettings: {
        time: '',
        location: '',
        rules: '',
        culture: ''
      },
      chapterOutline: [],
      themes: [],
      conflicts: []
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update API configuration
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.validateConfiguration();
  }

  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  /**
   * Get service status
   */
  getStatus(): { configured: boolean; url: string } {
    return {
      configured: !!this.apiKey && this.apiKey !== 'your_api_key_here',
      url: this.apiBaseUrl
    };
  }
}