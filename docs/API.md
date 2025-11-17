# API 文档

本文档说明 NovelCreat 中 DeepSeek API 的使用方法和集成方式。

## 目录

- [DeepSeek API 概述](#deepseek-api-概述)
- [配置](#配置)
- [DeepSeekService 类](#deepseekservice-类)
- [使用示例](#使用示例)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

## DeepSeek API 概述

NovelCreat 使用 DeepSeek AI 提供智能写作辅助功能。DeepSeek 是一个强大的大语言模型，支持：

- 文本生成
- 内容改写
- 内容润色
- 结构化输出

### API 端点

- **基础 URL**: `https://api.deepseek.com`
- **版本**: v1

## 配置

### 环境变量

在 `.env` 文件中配置 API 密钥：

```env
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com
```

### 获取 API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册并登录账号
3. 在控制台中创建 API Key
4. 将 API Key 添加到 `.env` 文件

## DeepSeekService 类

`DeepSeekService` 是封装 DeepSeek API 调用的主要服务类。

### 构造函数

```typescript
constructor(apiKey?: string)
```

**参数:**

- `apiKey` (可选): DeepSeek API 密钥。如果不提供，将从环境变量中读取。

**示例:**

```typescript
import { DeepSeekService } from './services/DeepSeekService';

const service = new DeepSeekService(process.env.DEEPSEEK_API_KEY);
```

### 方法

#### generateChapter

生成章节内容。

```typescript
async generateChapter(
  prompt: string,
  context: GenerationContext
): Promise<GeneratedContent>
```

**参数:**

- `prompt`: 生成提示词
- `context`: 生成上下文，包含核心上下文和动态上下文

**返回:**

- `GeneratedContent`: 包含标题和正文的生成内容

**示例:**

```typescript
const context = {
  coreContext: '角色设定、世界观等固定内容',
  dynamicContext: '最近章节摘要等动态内容',
  tokenBudget: 1600
};

const result = await service.generateChapter('写一段主角在赛博朋克城市中的冒险', context);

console.log(result.title); // 章节标题
console.log(result.body); // 章节内容
```

#### rewriteChapter

根据指示改写章节。

```typescript
async rewriteChapter(
  content: string,
  instruction: string
): Promise<string>
```

**参数:**

- `content`: 原始章节内容
- `instruction`: 改写指示

**返回:**

- `string`: 改写后的内容

**示例:**

```typescript
const rewritten = await service.rewriteChapter(originalContent, '使用更加生动的描写，增加感官细节');
```

#### polishChapter

润色章节内容，优化叙事和清晰度。

```typescript
async polishChapter(content: string): Promise<string>
```

**参数:**

- `content`: 需要润色的章节内容

**返回:**

- `string`: 润色后的内容

**示例:**

```typescript
const polished = await service.polishChapter(draftContent);
```

#### generateOutline

生成小说大纲。

```typescript
async generateOutline(
  description: string,
  style: string
): Promise<NovelOutline>
```

**参数:**

- `description`: 小说描述
- `style`: 写作风格（如：赛博朋克、奇幻、都市等）

**返回:**

- `NovelOutline`: 包含标题、类型、前提、角色、情节结构、世界观和章节的大纲

**示例:**

```typescript
const outline = await service.generateOutline('一个关于未来世界的冒险故事', '赛博朋克');
```

#### countTokens

估算文本的 token 数量。

```typescript
countTokens(text: string): number
```

**参数:**

- `text`: 需要计数的文本

**返回:**

- `number`: 估算的 token 数量

**注意:** 这是一个简化的估算，实际 token 数可能有所不同。

#### enforceTokenLimit

确保上下文不超过 token 限制。

```typescript
enforceTokenLimit(context: GenerationContext): GenerationContext
```

**参数:**

- `context`: 原始生成上下文

**返回:**

- `GenerationContext`: 调整后的上下文（如果超出限制会被截断）

**示例:**

```typescript
const adjustedContext = service.enforceTokenLimit({
  coreContext: longCoreText,
  dynamicContext: longDynamicText,
  tokenBudget: 1600
});
```

## 使用示例

### 完整的章节生成流程

```typescript
import { DeepSeekService } from './services/DeepSeekService';
import { ContextManager } from './services/ContextManager';

// 初始化服务
const deepSeekService = new DeepSeekService();
const contextManager = new ContextManager(knowledgeBase, chapters);

// 准备上下文
const context = contextManager.prepareContext(currentChapterIndex);

// 确保 token 限制
const limitedContext = deepSeekService.enforceTokenLimit(context);

// 生成章节
const generated = await deepSeekService.generateChapter('主角发现了一个重要线索', limitedContext);

console.log('生成的章节:', generated);
```

### 改写和润色流程

```typescript
// 改写章节
const instruction = '将对话改得更加自然，增加情感表达';
const rewritten = await deepSeekService.rewriteChapter(originalChapter, instruction);

// 润色章节
const polished = await deepSeekService.polishChapter(rewritten);

console.log('最终内容:', polished);
```

## 错误处理

### 常见错误

1. **API Key 无效**

   ```typescript
   try {
     const result = await service.generateChapter(prompt, context);
   } catch (error) {
     if (error.message.includes('API key')) {
       console.error('API Key 无效或未设置');
     }
   }
   ```

2. **请求超时**

   ```typescript
   try {
     const result = await service.generateChapter(prompt, context);
   } catch (error) {
     if (error.message.includes('timeout')) {
       console.error('请求超时，请检查网络连接');
     }
   }
   ```

3. **Token 限制超出**
   - 使用 `enforceTokenLimit` 方法自动调整上下文大小

### 错误处理最佳实践

```typescript
async function safeGenerateChapter(prompt: string, context: GenerationContext) {
  try {
    // 确保上下文在限制内
    const limitedContext = service.enforceTokenLimit(context);

    // 生成内容
    const result = await service.generateChapter(prompt, limitedContext);

    return { success: true, data: result };
  } catch (error) {
    console.error('生成章节失败:', error);
    return {
      success: false,
      error: error.message,
      fallback: '抱歉，无法生成内容。请检查您的 API 配置。'
    };
  }
}
```

## 最佳实践

### 1. 上下文管理

- 保持核心上下文简洁，只包含关键信息
- 动态上下文应包含最近的相关章节
- 定期压缩和更新上下文以避免超出 token 限制

### 2. 提示词优化

- 使用清晰、具体的提示词
- 包含必要的上下文信息
- 指定期望的输出格式和风格

### 3. 性能优化

- 缓存频繁使用的上下文
- 批量处理多个请求
- 实现请求去重和节流

### 4. 安全性

- 不要在代码中硬编码 API Key
- 使用环境变量管理敏感信息
- 在日志中隐藏 API Key

### 5. 用户体验

- 显示生成进度
- 提供生成失败的回退方案
- 允许用户取消长时间运行的请求

## API 限制和配额

- **Token 限制**: 单次请求最多 1600 tokens
- **请求频率**: 建议不超过每秒 10 次请求
- **超时时间**: 建议设置 30 秒超时

请参考 [DeepSeek 官方文档](https://platform.deepseek.com/docs) 获取最新的 API 限制信息。

## 相关资源

- [DeepSeek 平台](https://platform.deepseek.com/)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [项目架构文档](ARCHITECTURE.md)
- [开发指南](DEVELOPMENT.md)

---

如有问题或建议，请在 [GitHub Issues](https://github.com/maoka233/NovelCreat/issues) 中反馈。
