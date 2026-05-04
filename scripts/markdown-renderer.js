/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * Markdown 渲染模块 - 专业文档渲染
 *
 * 核心设计：
 * - 使用 Unicode 控制字符（ / ）作为占位符分隔符
 * - 这些字符不会被任何 Markdown 正则（* _ ~ ` 等）匹配
 * - 彻底解决占位符被斜体/粗体/删除线等正则破坏的问题
 */

const MarkdownRenderer = {
  // 占位符标记（Unicode 控制字符，不会被 Markdown 正则匹配）
  CB_START: '',  // SOH - 代码块开始
  CB_END:   '',  // STX - 代码块结束
  IC_START: '',  // SOH - 行内代码开始（用索引区分）
  IC_END:   '',  // STX - 行内代码结束

  /**
   * 渲染 Markdown 为 HTML
   */
  render(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // 提取代码块
    const codeBlocks = [];
    html = html.replace(/```[ \t]*(\w*)[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*```/g, (match, lang, code) => {
      const index = codeBlocks.length;
      codeBlocks.push(this.createCodeBlock(code.replace(/\r\n/g, '\n').trim(), lang));
      return this.CB_START + 'CB:' + index + this.CB_END;
    });

    // 提取行内代码
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const index = inlineCodes.length;
      inlineCodes.push('<code class="inline-code">' + this.escapeHtml(code) + '</code>');
      return this.IC_START + 'IC:' + index + this.IC_END;
    });

    // 提取 ASCII 图表（框线字符组成的架构图、流程图等）
    const asciiArts = [];
    html = html.replace(/(?:^[^\n]*?(?:[│┌┐└┘├┤┬┴┼╔╗╝╚═╦╩╠╣╬╭╮╰╯][^\n]*?){2}[^\n]*$(?:\r?\n|$))+/gm, (match) => {
      const index = asciiArts.length;
      const trimmedLines = match.split(/\r?\n/).filter(l => l.trim() !== '');
      const escaped = trimmedLines.map(line => this.escapeHtml(line)).join('\n');
      asciiArts.push('<pre class="doc-ascii-art">' + escaped + '</pre>');
      return this.CB_START + 'ASCII:' + index + this.CB_END;
    });

    // 引用块
    html = html.replace(/^> ([^\n]+)/gm, '<blockquote class="doc-quote">$1</blockquote>');
    html = html.replace(/<\/blockquote>\n<blockquote class="doc-quote">/g, '\n');

    // 标题
    html = html.replace(/^###### (.+)$/gm, '<h6 class="doc-h6">$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5 class="doc-h5">$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="doc-h4">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="doc-h3">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="doc-h2">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1 class="doc-h1">$1</h1>');

    // 水平线
    html = html.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '<hr class="doc-hr">');

    // 表格
    html = this.parseTables(html);

    // 粗体/斜体（* _ ~ 等标记符永远不会匹配到 /）
    html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/___([^_]+)___/g, '<strong><em>$1</em></strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

    // 列表
    html = this.parseUnorderedLists(html);
    html = this.parseOrderedLists(html);

    // 链接/图片
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="doc-link" target="_blank">$1</a>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="doc-image">');

    // 段落
    html = this.parseParagraphs(html);

    // 恢复代码块（CB:0 → HTML）
    codeBlocks.forEach((block, index) => {
      html = html.split(this.CB_START + 'CB:' + index + this.CB_END).join(block);
    });

    // 恢复行内代码
    inlineCodes.forEach((code, index) => {
      html = html.split(this.IC_START + 'IC:' + index + this.IC_END).join(code);
    });

    // 恢复 ASCII 图
    asciiArts.forEach((block, index) => {
      html = html.split(this.CB_START + 'ASCII:' + index + this.CB_END).join(block);
    });

    return html;
  },

  /**
   * 解析表格
   */
  parseTables(html) {
    const lines = html.split('\n');
    const result = [];
    let inTable = false;
    let tableRows = [];
    let isHeader = true;
    let headerLineIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 跳过占位符行（包含  控制字符）
      if (line.includes('')) {
        if (inTable) {
          result.push('<table class="doc-table"><tbody>' + tableRows.join('') + '</tbody></table>');
          inTable = false;
          tableRows = [];
        }
        result.push(line);
        continue;
      }

      if (/^[\| :-]+$/.test(line) && line.includes('-') && inTable && headerLineIndex === i - 1) {
        isHeader = false;
        continue;
      }

      if (/^\|.*\|$/.test(line)) {
        if (!inTable) {
          inTable = true;
          isHeader = true;
          headerLineIndex = i;
        }

        const cells = line.split('|').filter((_, i, arr) => i !== 0 && i !== arr.length - 1);
        if (cells.every(c => c.trim() === '')) continue;

        const rowHtml = cells.map(cell => {
          const content = this.parseInline(cell.trim());
          const tag = isHeader ? 'th' : 'td';
          return '<' + tag + '>' + content + '</' + tag + '>';
        }).join('');

        tableRows.push('<tr>' + rowHtml + '</tr>');
        if (isHeader) isHeader = false;
        continue;
      }

      if (inTable) {
        result.push('<table class="doc-table"><tbody>' + tableRows.join('') + '</tbody></table>');
        inTable = false;
        tableRows = [];
        headerLineIndex = -1;
      }
      result.push(line);
    }

    if (inTable) {
      result.push('<table class="doc-table"><tbody>' + tableRows.join('') + '</tbody></table>');
    }

    return result.join('\n');
  },

  /**
   * 解析无序列表
   */
  parseUnorderedLists(html) {
    const lines = html.split('\n');
    const result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^[\-\*\+] (.+)$/.test(line)) {
        if (!inList) {
          inList = true;
          result.push('<ul class="doc-ul">');
        }
        const content = line.replace(/^[\-\*\+] /, '');
        result.push('<li>' + this.parseInline(content) + '</li>');
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) result.push('</ul>');
    return result.join('\n');
  },

  /**
   * 解析有序列表
   */
  parseOrderedLists(html) {
    const lines = html.split('\n');
    const result = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\d+\. (.+)$/.test(line)) {
        if (!inList) {
          inList = true;
          result.push('<ol class="doc-ol">');
        }
        const content = line.replace(/^\d+\. /, '');
        result.push('<li>' + this.parseInline(content) + '</li>');
      } else {
        if (inList) {
          result.push('</ol>');
          inList = false;
        }
        result.push(line);
      }
    }

    if (inList) result.push('</ol>');
    return result.join('\n');
  },

  /**
   * 解析段落
   */
  parseParagraphs(html) {
    const lines = html.split('\n');
    const result = [];
    let paragraphLines = [];

    const flushParagraph = () => {
      if (paragraphLines.length > 0) {
        const content = paragraphLines.join(' ').trim();
        if (content) {
          if (!content.startsWith('<')) {
            result.push('<p class="doc-p">' + this.parseInline(content) + '</p>');
          } else {
            result.push(content);
          }
        }
        paragraphLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === '') {
        flushParagraph();
        continue;
      }

      if (line.startsWith('<')) {
        flushParagraph();
        result.push(line);
        continue;
      }

      paragraphLines.push(line);
    }

    flushParagraph();
    return result.join('\n');
  },

  /**
   * 解析行内元素
   */
  parseInline(text) {
    let result = text;
    result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="doc-link" target="_blank">$1</a>');
    return result;
  },

  /**
   * 创建代码块
   */
  createCodeBlock(code, lang) {
    const escapedCode = this.escapeHtml(code);
    return '<pre class="doc-pre"><code class="doc-code" data-lang="' + (lang || 'text') + '">' + escapedCode + '</code></pre>';
  },

  /**
   * HTML 转义
   */
  escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  /**
   * 渲染完整文档页面
   */
  renderFullDocument(title, markdown) {
    const content = this.render(markdown);
    return `
      <div class="full-document">
        <div class="doc-header">
          <h1 class="doc-title">${this.escapeHtml(title)}</h1>
          <div class="doc-meta">
            <span>文档编号：自动生成</span>
            <span>版本：V1.0</span>
            <span>生成日期：${new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
        <div class="doc-content">
          ${content}
        </div>
        <div class="doc-footer">
          <div class="signature-block">
            <div>编制人：______________</div>
            <div class="signature-line">日期</div>
          </div>
          <div class="signature-block">
            <div>审核人：______________</div>
            <div class="signature-line">日期</div>
          </div>
          <div class="signature-block">
            <div>批准人：______________</div>
            <div class="signature-line">日期</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 复制文本到剪贴板
   */
  copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  /**
   * 导出为 Markdown 文件
   */
  exportMarkdown(filename, markdown) {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 导出为 HTML 文件
   */
  exportHtml(filename, title, markdown) {
    const content = this.renderFullDocument(title, markdown);
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: "Times New Roman", serif; padding: 40px; line-height: 1.8; max-width: 900px; margin: 0 auto; }
    .doc-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .doc-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; }
    .doc-meta { font-size: 12px; color: #666; }
    .doc-content { margin-top: 30px; }
    .doc-h1 { font-size: 20px; margin-top: 25px; margin-bottom: 15px; }
    .doc-h2 { font-size: 18px; margin-top: 20px; margin-bottom: 12px; }
    .doc-h3 { font-size: 16px; margin-top: 18px; margin-bottom: 10px; }
    .doc-h4 { font-size: 14px; margin-top: 15px; margin-bottom: 8px; }
    .doc-p { margin-bottom: 12px; text-align: justify; }
    .doc-ul, .doc-ol { margin-bottom: 12px; padding-left: 30px; }
    .doc-li { margin-bottom: 6px; }
    .doc-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .doc-table th, .doc-table td { border: 1px solid #333; padding: 10px; text-align: left; }
    .doc-table th { background: #f0f0f0; font-weight: bold; }
    .doc-quote { border-left: 4px solid #ccc; padding-left: 15px; margin: 15px 0; color: #666; }
    .doc-pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
    .doc-code { font-family: Consolas, Monaco, monospace; font-size: 13px; }
    .inline-code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    .doc-hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
    .doc-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; display: flex; justify-content: space-between; }
    .signature-block { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; }
  </style>
</head>
<body>
  ${content}
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};

window.MarkdownRenderer = MarkdownRenderer;
console.log('Markdown Renderer loaded');
