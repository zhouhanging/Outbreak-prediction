import { Plus, Trash2, FileText } from 'lucide-react'
import type { NoteListItem } from '../App'

interface NoteListProps {
  notes: NoteListItem[]
  currentNoteId?: string
  onSelectNote: (id: string) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
}

function NoteList({
  notes,
  currentNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote
}: NoteListProps): JSX.Element {
  // 格式化日期
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateNote}
          className="w-full py-2 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建笔记
        </button>
      </div>

      {/* 笔记列表 */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无笔记</p>
            <p className="text-sm mt-1">点击上方按钮创建</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentNoteId === note.id
                    ? 'bg-primary-100 border border-primary-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectNote(note.id)}
              >
                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('确定要删除这篇笔记吗？')) {
                      onDeleteNote(note.id)
                    }
                  }}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition-all"
                  title="删除笔记"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* 标题 */}
                <h3 className="font-medium text-gray-800 truncate pr-8">
                  {note.title || '无标题'}
                </h3>

                {/* 日期 */}
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(note.updatedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-400 text-center">
        共 {notes.length} 篇笔记
      </div>
    </div>
  )
}

export default NoteList
