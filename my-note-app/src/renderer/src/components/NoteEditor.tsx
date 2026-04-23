import { useState, useEffect, useCallback, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Save,
  Sparkles,
  Clock,
  Tag as TagIcon
} from 'lucide-react'
import type { Note } from '../App'
import TagSelector from './TagSelector'

interface NoteEditorProps {
  note: Note
  onSave: (note: Note) => void
  isLoading: boolean
}

function NoteEditor({ note, onSave, isLoading }: NoteEditorProps): JSX.Element {
  const [title, setTitle] = useState(note.title)
  const [isSaving, setIsSaving] = useState(false)
  const [showAIOptions, setShowAIOptions] = useState(false)
  const [isAIGenerating, setIsAIGenerating] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [noteTags, setNoteTags] = useState<Array<{ id: string; name: string; color: string }>>([])
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '开始写点什么...'
      })
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      // 自动保存：300ms 延迟
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(editor.getHTML())
      }, 300)
    }
  })

  // 当笔记切换时更新编辑器内容
  useEffect(() => {
    setTitle(note.title)
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content)
    }
    loadNoteTags()
  }, [note.id, editor])

  // 加载笔记标签
  const loadNoteTags = async () => {
    try {
      const tagIds = await window.api.tag.getNoteTags(note.id)
      const allTags = await window.api.tag.list()
      const tags = allTags.filter((tag: any) => tagIds.includes(tag.id))
      setNoteTags(tags)
    } catch (error) {
      console.error('Failed to load note tags:', error)
    }
  }

  // 自动保存
  const handleAutoSave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      onSave({ ...note, title, content })
    },
    [note, title, onSave]
  )

  // 手动保存
  const handleSave = useCallback(() => {
    if (editor) {
      setIsSaving(true)
      onSave({ ...note, title, content: editor.getHTML() })
      setTimeout(() => setIsSaving(false), 500)
    }
  }, [editor, note, title, onSave])

  // AI 补全功能
  const handleAIComplete = async () => {
    if (!editor) return

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )

    if (!selectedText) {
      alert('请先选中要补全的内容')
      return
    }

    setIsAIGenerating(true)
    try {
      const result = await window.api.ai.generateCompletion(
        `请补全以下内容：\n\n${selectedText}`
      )
      editor.chain().focus().insertContent(result).run()
    } catch (error) {
      console.error('AI completion failed:', error)
      alert('AI 补全失败，请检查网络或 API 配置')
    } finally {
      setIsAIGenerating(false)
      setShowAIOptions(false)
    }
  }

  // AI 整理功能
  const handleAIOrganize = async () => {
    if (!editor) return

    const content = editor.getHTML()
    if (!content) {
      alert('笔记内容为空')
      return
    }

    setIsAIGenerating(true)
    try {
      const result = await window.api.ai.generateCompletion(
        `请将以下笔记整理成结构化的 Markdown 格式：\n\n${content}`
      )
      editor.commands.setContent(result)
      onSave({ ...note, title, content: result })
    } catch (error) {
      console.error('AI organize failed:', error)
      alert('AI 整理失败，请检查网络或 API 配置')
    } finally {
      setIsAIGenerating(false)
      setShowAIOptions(false)
    }
  }

  // AI 生成思维导图
  const handleAIMindmap = async () => {
    if (!editor) return

    const content = editor.getText()
    if (!content) {
      alert('笔记内容为空')
      return
    }

    setIsAIGenerating(true)
    try {
      const result = await window.api.ai.generateCompletion(
        `根据以下笔记内容生成一个 Mermaid 思维导图代码，只输出代码：\n\n${content}`
      )
      // 在末尾添加思维导图
      editor.chain().focus().setHardBreak().insertContent('<pre><code>' + result + '</code></pre>').run()
    } catch (error) {
      console.error('AI mindmap failed:', error)
      alert('AI 生成思维导图失败，请检查网络或 API 配置')
    } finally {
      setIsAIGenerating(false)
      setShowAIOptions(false)
    }
  }

  // 设置提醒
  const handleSetReminder = () => {
    setShowReminderModal(true)
  }

  const handleReminderConfirm = async (dateTime: string) => {
    try {
      await window.api.reminder.add(note.id, dateTime)
      alert('提醒已设置')
      setShowReminderModal(false)
    } catch (error) {
      console.error('Failed to set reminder:', error)
      alert('设置提醒失败')
    }
  }

  // 格式化工具栏按钮
  const ToolbarButton = ({
    icon: Icon,
    title,
    onClick,
    active
  }: {
    icon: typeof Bold
    title: string
    onClick: () => void
    active?: boolean
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary-100 text-primary-600'
          : 'hover:bg-gray-100 text-gray-600'
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Bold}
            title="加粗"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
          />
          <ToolbarButton
            icon={Italic}
            title="斜体"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
          />
          <div className="w-px h-6 bg-gray-200 mx-2" />
          <ToolbarButton
            icon={List}
            title="无序列表"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="有序列表"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
          />
          <ToolbarButton
            icon={Quote}
            title="引用"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive('blockquote')}
          />
          <ToolbarButton
            icon={Code}
            title="代码"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive('codeBlock')}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* 提醒按钮 */}
          <button
            onClick={handleSetReminder}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="设置提醒"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* 标签按钮 */}
          <button
            onClick={() => setShowTagSelector(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors relative"
            title="添加标签"
          >
            <TagIcon className="w-4 h-4" />
            {noteTags.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                {noteTags.length}
              </span>
            )}
          </button>

          {/* AI 按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowAIOptions(!showAIOptions)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI
            </button>

            {showAIOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleAIComplete}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  disabled={isAIGenerating}
                >
                  {isAIGenerating ? '生成中...' : '智能补全'}
                </button>
                <button
                  onClick={handleAIOrganize}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  disabled={isAIGenerating}
                >
                  整理笔记
                </button>
                <button
                  onClick={handleAIMindmap}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  disabled={isAIGenerating}
                >
                  生成思维导图
                </button>
              </div>
            )}
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 标题输入 */}
      <div className="px-6 pt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onSave({ ...note, title })}
          placeholder="笔记标题"
          className="w-full text-2xl font-bold text-gray-800 placeholder-gray-300 outline-none border-none"
        />
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none min-h-full focus:outline-none"
        />
      </div>

      {/* 提醒设置模态框 */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">设置提醒</h3>
            <input
              type="datetime-local"
              id="reminder-datetime"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              min={new Date().toISOString().slice(0, 16)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReminderModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById('reminder-datetime') as HTMLInputElement
                  if (input?.value) {
                    handleReminderConfirm(input.value)
                  }
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 标签选择模态框 */}
      {showTagSelector && (
        <TagSelector
          noteId={note.id}
          onClose={() => {
            setShowTagSelector(false)
            loadNoteTags()
          }}
        />
      )}
    </div>
  )
}

export default NoteEditor
