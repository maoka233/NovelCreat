/**
 * Validation utility functions for input validation
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKey(apiKey: string): ValidationResult {
  const errors: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('API Key 不能为空');
  } else if (apiKey.length < 10) {
    errors.push('API Key 长度不足');
  } else if (apiKey.includes(' ')) {
    errors.push('API Key 不应包含空格');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate novel title
 */
export function validateNovelTitle(title: string): ValidationResult {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('标题不能为空');
  } else if (title.length > 100) {
    errors.push('标题不能超过 100 个字符');
  } else if (title.length < 2) {
    errors.push('标题至少需要 2 个字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate chapter content
 */
export function validateChapterContent(content: string, minWords = 100): ValidationResult {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('章节内容不能为空');
  } else {
    const wordCount = countWords(content);
    if (wordCount < minWords) {
      errors.push(`章节内容至少需要 ${minWords} 字，当前 ${wordCount} 字`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Count words (simplified version)
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const chineseChars = trimmed.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseChars ? chineseChars.length : 0;

  const englishWords = trimmed.match(/[a-zA-Z]+/g);
  const englishCount = englishWords ? englishWords.length : 0;

  return chineseCount + englishCount;
}

/**
 * Validate character name
 */
export function validateCharacterName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || name.trim().length === 0) {
    errors.push('角色名称不能为空');
  } else if (name.length > 50) {
    errors.push('角色名称不能超过 50 个字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate file name
 */
export function validateFileName(fileName: string): ValidationResult {
  const errors: string[] = [];

  if (!fileName || fileName.trim().length === 0) {
    errors.push('文件名不能为空');
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(fileName)) {
    errors.push('文件名包含非法字符 (< > : " / \\ | ? *)');
  }

  if (fileName.length > 255) {
    errors.push('文件名不能超过 255 个字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate positive integer
 */
export function validatePositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validate range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Check if string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Validate JSON string
 */
export function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  const errors: string[] = [];

  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    errors.push('开始日期无效');
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    errors.push('结束日期无效');
  }

  if (errors.length === 0 && startDate > endDate) {
    errors.push('开始日期不能晚于结束日期');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
