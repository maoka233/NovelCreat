import { Novel, ExportFormat, ExportOptions } from '../types';

/**
 * Export service for exporting novel content in various formats
 */
export class ExportService {
  /**
   * Export novel to specified format
   */
  async export(novel: Novel, options: ExportOptions): Promise<string> {
    switch (options.format) {
      case 'txt':
        return this.exportToTxt(novel, options);
      case 'markdown':
        return this.exportToMarkdown(novel, options);
      case 'html':
        return this.exportToHtml(novel, options);
      case 'pdf':
        throw new Error('PDF export not yet implemented');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to plain text format
   */
  private exportToTxt(novel: Novel, options: ExportOptions): string {
    const lines: string[] = [];
    const separator = options.chapterSeparator || '\n\n---\n\n';

    // Add metadata if requested
    if (options.includeMetadata) {
      lines.push(`标题: ${novel.title}`);
      lines.push(`作者: ${novel.author}`);
      lines.push(`类型: ${novel.genre}`);
      lines.push(`字数: ${novel.wordCount}`);
      lines.push(`状态: ${this.formatStatus(novel.status)}`);
      lines.push(`创建时间: ${novel.createdAt.toLocaleDateString()}`);
      lines.push(`\n`);
    }

    // Add outline if requested
    if (options.includeOutline && novel.outline) {
      lines.push('=== 大纲 ===\n');
      lines.push(`前提: ${novel.outline.premise}\n`);

      if (novel.outline.mainCharacters.length > 0) {
        lines.push('主要角色:');
        novel.outline.mainCharacters.forEach(char => {
          lines.push(`  - ${char.name}: ${char.role}`);
        });
        lines.push('');
      }

      lines.push(separator);
    }

    // Add chapters
    novel.chapters.forEach((chapter, index) => {
      if (index > 0) {
        lines.push(separator);
      }
      lines.push(`第 ${index + 1} 章: ${chapter.title}\n`);
      lines.push(chapter.content);
    });

    return lines.join('\n');
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(novel: Novel, options: ExportOptions): string {
    const lines: string[] = [];
    const separator = options.chapterSeparator || '\n\n---\n\n';

    // Title
    lines.push(`# ${novel.title}\n`);

    // Add metadata if requested
    if (options.includeMetadata) {
      lines.push(`**作者**: ${novel.author}  `);
      lines.push(`**类型**: ${novel.genre}  `);
      lines.push(`**字数**: ${novel.wordCount}  `);
      lines.push(`**状态**: ${this.formatStatus(novel.status)}  `);
      lines.push(`**创建时间**: ${novel.createdAt.toLocaleDateString()}  `);
      lines.push('');
    }

    // Add description if available
    if (novel.description) {
      lines.push(`## 简介\n`);
      lines.push(novel.description);
      lines.push('');
    }

    // Add outline if requested
    if (options.includeOutline && novel.outline) {
      lines.push('## 大纲\n');
      lines.push(`**前提**: ${novel.outline.premise}\n`);

      if (novel.outline.mainCharacters.length > 0) {
        lines.push('### 主要角色\n');
        novel.outline.mainCharacters.forEach(char => {
          lines.push(`- **${char.name}**: ${char.role}`);
          if (char.goals) {
            lines.push(`  - 目标: ${char.goals}`);
          }
        });
        lines.push('');
      }

      lines.push(separator);
    }

    // Add table of contents
    lines.push('## 目录\n');
    novel.chapters.forEach((chapter, index) => {
      lines.push(`${index + 1}. [${chapter.title}](#chapter-${index + 1})`);
    });
    lines.push('');
    lines.push(separator);

    // Add chapters
    novel.chapters.forEach((chapter, index) => {
      if (index > 0) {
        lines.push(separator);
      }
      lines.push(`## <a name="chapter-${index + 1}"></a>第 ${index + 1} 章: ${chapter.title}\n`);
      lines.push(chapter.content);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Export to HTML format
   */
  private exportToHtml(novel: Novel, options: ExportOptions): string {
    const metadata = options.includeMetadata;
    const outline = options.includeOutline && novel.outline;

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(novel.title)}</title>
  <style>
    body {
      font-family: "Noto Serif SC", "Source Han Serif SC", serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.8;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      font-size: 2.5em;
      margin-bottom: 10px;
      color: #333;
    }
    .metadata {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.9em;
    }
    .chapter {
      margin-top: 40px;
    }
    .chapter-title {
      font-size: 1.8em;
      margin-bottom: 20px;
      color: #444;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .chapter-content {
      text-indent: 2em;
      white-space: pre-wrap;
    }
    .separator {
      text-align: center;
      margin: 40px 0;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${this.escapeHtml(novel.title)}</h1>
    ${
      metadata
        ? `
    <div class="metadata">
      <p>作者: ${this.escapeHtml(novel.author)}</p>
      <p>类型: ${this.escapeHtml(novel.genre)} | 字数: ${novel.wordCount} | 状态: ${this.formatStatus(novel.status)}</p>
    </div>`
        : ''
    }
    
    ${outline ? this.generateOutlineHtml(novel) : ''}
    
    ${novel.chapters
      .map(
        (chapter, index) => `
    <div class="chapter">
      ${index > 0 ? '<div class="separator">* * *</div>' : ''}
      <h2 class="chapter-title">第 ${index + 1} 章: ${this.escapeHtml(chapter.title)}</h2>
      <div class="chapter-content">${this.escapeHtml(chapter.content)}</div>
    </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate outline HTML
   */
  private generateOutlineHtml(novel: Novel): string {
    if (!novel.outline) return '';

    const outline = novel.outline;
    return `
    <div class="outline">
      <h2>大纲</h2>
      <p><strong>前提:</strong> ${this.escapeHtml(outline.premise)}</p>
      ${
        outline.mainCharacters.length > 0
          ? `
      <div>
        <h3>主要角色</h3>
        <ul>
          ${outline.mainCharacters
            .map(
              char => `
          <li>
            <strong>${this.escapeHtml(char.name)}</strong>: ${this.escapeHtml(char.role)}
            ${char.goals ? `<br>目标: ${this.escapeHtml(char.goals)}` : ''}
          </li>
          `
            )
            .join('')}
        </ul>
      </div>`
          : ''
      }
      <div class="separator">* * *</div>
    </div>`;
  }

  /**
   * Format novel status for display
   */
  private formatStatus(status: 'draft' | 'writing' | 'completed'): string {
    const statusMap = {
      draft: '草稿',
      writing: '创作中',
      completed: '已完成'
    };
    return statusMap[status] || status;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get file extension for export format
   */
  getFileExtension(format: ExportFormat): string {
    const extensions: Record<ExportFormat, string> = {
      txt: 'txt',
      markdown: 'md',
      html: 'html',
      pdf: 'pdf'
    };
    return extensions[format];
  }

  /**
   * Generate default filename for export
   */
  generateFilename(novel: Novel, format: ExportFormat): string {
    const sanitized = novel.title.replace(/[<>:"/\\|?*]/g, '_');
    const ext = this.getFileExtension(format);
    const timestamp = new Date().toISOString().split('T')[0];
    return `${sanitized}_${timestamp}.${ext}`;
  }
}
