import { useState, useRef } from 'react'
import { Sparkles, Send, FileText, Loader2 } from 'lucide-react'

interface BlogGeneratorProps {
  onGenerated?: (content: string, title: string) => void
}

function BlogGenerator({ onGenerated }: BlogGeneratorProps): JSX.Element {
  const [title, setTitle] = useState('')
  const [requirement, setRequirement] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 基于向量数据库内容生成博客
  const handleGenerateFromVectorDB = async () => {
    if (!title.trim() || !requirement.trim()) {
      setError('请填写标题和需求描述')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedContent('')

    try {
      // 1. 从向量数据库搜索相关内容
      const searchResults = await window.api.vector.search(requirement, 5)

      if (searchResults.length === 0) {
        setError('未找到相关笔记内容，请先创建相关笔记')
        setIsGenerating(false)
        return
      }

      // 2. 将搜索结果合并为上下文
      const contextContent = searchResults
        .map((result) => `## ${result.title}\n\n${result.content}`)
        .join('\n\n---\n\n')

      // 3. 调用 AI 生成博客
      const prompt = `你是一个专业的技术博客写手。请根据以下笔记内容，按照用户的需求生成一篇完整的博客文章。

## 用户需求
${requirement}

## 相关笔记内容
${contextContent}

## 要求
1. 文章标题：${title}
2. 包含适当的 Front Matter（title, date, tags, categories）
3. 内容要结构清晰，包含适当的标题层级
4. 可以适当扩展和补充，但保持核心内容准确
5. 使用 Markdown 格式输出`

      const content = await window.api.ai.generateCompletion(prompt)
      setGeneratedContent(content)

      if (onGenerated) {
        onGenerated(content, title)
      }
    } catch (err) {
      console.error('Blog generation failed:', err)
      setError('博客生成失败，请检查 API 配置或网络连接')
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制生成的内容
  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
      alert('已复制到剪贴板')
    }
  }

  // 保存到博客目录
  const handleSaveToBlog = async () => {
    if (!generatedContent || !title.trim()) return

    try {
      const result = await window.api.blog.generate(generatedContent, title)
      if (result) {
        alert('博客已保存到本地博客目录')
      }
    } catch (err) {
      console.error('Save to blog failed:', err)
      setError('保存博客失败')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary-500" />
        纯指令生成博客
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">输入</h2>

        {/* 标题输入 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            博客标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：深入理解 React Hooks"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* 需求描述 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            博客需求描述
          </label>
          <textarea
            ref={textareaRef}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="描述你想要的博客内容，例如：基于我现有的 React 笔记，写一篇关于 useEffect 深度使用的教程，包含实际代码示例"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 生成按钮 */}
        <button
          onClick={handleGenerateFromVectorDB}
          disabled={isGenerating || !title.trim() || !requirement.trim()}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              正在生成中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              基于笔记内容生成博客
            </>
          )}
        </button>

        <p className="mt-3 text-xs text-gray-400 text-center">
          系统将自动从你的笔记中检索相关内容，结合需求生成博客
        </p>
      </div>

      {/* 生成结果 */}
      {generatedContent && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              生成结果
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                复制内容
              </button>
              <button
                onClick={handleSaveToBlog}
                className="px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                保存到博客
              </button>
            </div>
          </div>

          {/* 预览 */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-medium text-blue-800 mb-2">使用说明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 输入博客标题和需求描述</li>
          <li>• 系统会从你的笔记中检索相关内容</li>
          <li>• AI 会整合笔记内容生成完整的博客文章</li>
          <li>• 生成后可复制内容或直接保存到本地博客目录</li>
          <li>• 需要先在设置中配置博客仓库路径</li>
        </ul>
      </div>
    </div>
  )
}

export default BlogGenerator
