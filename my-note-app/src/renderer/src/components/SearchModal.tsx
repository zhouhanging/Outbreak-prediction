import { useState, useEffect, useRef } from 'react'
import { Search, X, FileText, Sparkles } from 'lucide-react'

interface SearchModalProps {
  onClose: () => void
  onSelectNote: (id: string) => void
}

interface SearchResult {
  id: string
  title: string
  content: string
  distance: number
  matchType: 'keyword' | 'semantic'
}

function SearchModal({ onClose, onSelectNote }: SearchModalProps): JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 执行搜索
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // 语义搜索
      const semanticResults = await window.api.vector.search(searchQuery)

      // 转换为统一格式
      const formattedResults: SearchResult[] = semanticResults.map((result) => ({
        id: result.id,
        title: result.title,
        content: result.content.substring(0, 200),
        distance: result.distance,
        matchType: 'semantic' as const
      }))

      setResults(formattedResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        onSelectNote(results[selectedIndex].id)
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  // 高亮匹配文字
  const highlightMatch = (text: string, query: string): JSX.Element => {
    if (!query.trim()) return <>{text}</>

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜索输入框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索笔记内容... (支持语义搜索)"
            className="flex-1 text-lg outline-none placeholder-gray-400"
          />
          {isSearching && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 搜索结果 */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query && !isSearching ? (
            <div className="p-8 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>未找到相关笔记</p>
              <p className="text-sm mt-1">尝试使用不同的关键词</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary-400" />
              <p>输入关键词开始搜索</p>
              <p className="text-sm mt-1">支持语义理解和关键词匹配</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectNote(result.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-800">
                      {highlightMatch(result.title, query)}
                    </span>
                    {result.matchType === 'semantic' && (
                      <span className="px-1.5 py-0.5 bg-primary-100 text-primary-600 text-xs rounded">
                        语义
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 ml-6">
                    {highlightMatch(result.content, query)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex gap-4">
          <span>
            <kbd className="px-1 py-0.5 bg-white rounded border">↑↓</kbd> 导航
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-white rounded border">Enter</kbd> 打开
          </span>
          <span>
            <kbd className="px-1 py-0.5 bg-white rounded border">Esc</kbd> 关闭
          </span>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
