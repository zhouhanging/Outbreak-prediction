import log from 'electron-log'

export type ExportFormat = 'md' | 'html' | 'pdf' | 'txt' | 'json'

interface ExportOptions {
  format: ExportFormat
  includeMetadata?: boolean
  filename?: string
}

// 转换为 HTML
function markdownToHtml(markdown: string, title: string): string {
  let html = markdown
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // 图片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // 列表
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\s*>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
    // 换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { color: #333; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    img { max-width: 100%; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`
}

// 转换为纯文本
function markdownToText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/^\s*>\s+/gm, '')
}

// 导出笔记
export async function exportNote(
  content: string,
  title: string,
  options: ExportOptions
): Promise<{ content: string; mimeType: string; extension: string }> {
  const filename = options.filename || title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')

  switch (options.format) {
    case 'html':
      return {
        content: markdownToHtml(content, title),
        mimeType: 'text/html',
        extension: 'html'
      }

    case 'txt':
      return {
        content: markdownToText(content),
        mimeType: 'text/plain',
        extension: 'txt'
      }

    case 'json':
      return {
        content: JSON.stringify({
          title,
          content,
          exportedAt: new Date().toISOString(),
          format: 'markdown'
        }, null, 2),
        mimeType: 'application/json',
        extension: 'json'
      }

    case 'md':
    default:
      return {
        content,
        mimeType: 'text/markdown',
        extension: 'md'
      }
  }
}

// 保存文件到磁盘
export async function saveExportedFile(
  content: string,
  title: string,
  options: ExportOptions
): Promise<string | null> {
  try {
    const { content: exported, extension } = await exportNote(content, title, options)
    const filename = (options.filename || title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')) + '.' + extension

    // 使用 Electron 的保存对话框
    const result = await window.api.file.saveWithDialog(exported, filename)
    log.info('File exported:', result)
    return result
  } catch (error) {
    log.error('Export failed:', error)
    return null
  }
}

// 批量导出
export async function exportNotes(
  notes: Array<{ id: string; title: string; content: string }>,
  options: ExportOptions
): Promise<void> {
  for (const note of notes) {
    await saveExportedFile(note.content, note.title, options)
  }
}
