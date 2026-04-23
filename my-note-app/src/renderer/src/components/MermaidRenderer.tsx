import { useEffect, useRef, useState } from 'react'
import { RefreshCw, Edit2, Check, X } from 'lucide-react'

interface MermaidRendererProps {
  code: string
  onUpdate?: (newCode: string) => void
  className?: string
}

function MermaidRenderer({ code, onUpdate, className = '' }: MermaidRendererProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editCode, setEditCode] = useState(code)

  useEffect(() => {
    renderMermaid()
  }, [code])

  const renderMermaid = async () => {
    if (!containerRef.current) return

    setError('')

    try {
      // 动态导入 mermaid
      const mermaid = (await import('mermaid')).default

      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      })

      // 生成唯一 ID
      const id = `mermaid-${Date.now()}`

      // 渲染
      const { svg } = await mermaid.render(id, code)

      if (containerRef.current) {
        containerRef.current.innerHTML = svg
      }
    } catch (err) {
      console.error('Mermaid render error:', err)
      setError(err instanceof Error ? err.message : '渲染失败')
      if (containerRef.current) {
        containerRef.current.innerHTML = `<div class="text-red-500 text-sm p-4">渲染错误: ${err instanceof Error ? err.message : '未知错误'}</div>`
      }
    }
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editCode)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditCode(code)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
        <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">编辑 Mermaid 代码</span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="取消"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-1 hover:bg-gray-200 rounded text-green-600"
              title="保存"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
        <textarea
          value={editCode}
          onChange={(e) => setEditCode(e.target.value)}
          className="w-full h-48 p-3 font-mono text-sm border-0 focus:outline-none resize-none"
          placeholder="输入 Mermaid 代码..."
        />
        <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
          支持语法：flowchart, sequenceDiagram, classDiagram, stateDiagram, ERDiagram, gantt, pie, mindmap
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* 工具栏 */}
      <div className="bg-gray-100 px-3 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Mermaid 图表</span>
        <div className="flex gap-2">
          <button
            onClick={renderMermaid}
            className="p-1 hover:bg-gray-200 rounded text-gray-500"
            title="刷新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {onUpdate && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-200 rounded text-gray-500"
              title="编辑代码"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 渲染容器 */}
      <div className="p-4 bg-white">
        <div ref={containerRef} className="flex justify-center" />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-3 py-2 bg-red-50 text-red-600 text-xs">
          {error}
        </div>
      )}
    </div>
  )
}

export default MermaidRenderer
