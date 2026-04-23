import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'

interface Tag {
  id: string
  name: string
  color: string
}

interface TagSelectorProps {
  noteId: string
  onClose: () => void
}

function TagSelector({ noteId, onClose }: TagSelectorProps): JSX.Element {
  const [tags, setTags] = useState<Tag[]>([])
  const [noteTags, setNoteTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3B82F6')

  const colors = [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 橙色
    '#EF4444', // 红色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#06B6D4', // 青色
    '#6366F1'  // 靛蓝
  ]

  // 加载标签
  useEffect(() => {
    loadTags()
    loadNoteTags()
  }, [noteId])

  const loadTags = async () => {
    try {
      const allTags = await window.api.tag.list()
      setTags(allTags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  const loadNoteTags = async () => {
    try {
      const tags = await window.api.tag.getNoteTags(noteId)
      setNoteTags(tags)
    } catch (error) {
      console.error('Failed to load note tags:', error)
    }
  }

  // 创建新标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      await window.api.tag.create(newTagName.trim(), selectedColor)
      setNewTagName('')
      await loadTags()
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  // 添加标签到笔记
  const handleAddTag = async (tagId: string) => {
    try {
      await window.api.tag.addToNote(noteId, tagId)
      setNoteTags([...noteTags, tagId])
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  // 从笔记移除标签
  const handleRemoveTag = async (tagId: string) => {
    try {
      await window.api.tag.removeFromNote(noteId, tagId)
      setNoteTags(noteTags.filter((id) => id !== tagId))
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  // 删除标签
  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
      await window.api.tag.delete(tagId)
      await loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
    }
  }

  const isTagSelected = (tagId: string) => noteTags.includes(tagId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">选择标签</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 创建新标签 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              placeholder="输入新标签名称..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              onClick={handleCreateTag}
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 颜色选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">颜色：</span>
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="max-h-64 overflow-y-auto p-2">
          {tags.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>暂无标签</p>
              <p className="text-sm mt-1">创建一个新标签开始使用</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isTagSelected(tag.id)
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() =>
                    isTagSelected(tag.id) ? handleRemoveTag(tag.id) : handleAddTag(tag.id)
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-gray-700">{tag.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTagSelected(tag.id) && (
                      <span className="text-xs text-primary-600 font-medium">已添加</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTag(tag.id)
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部 */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}

export default TagSelector
