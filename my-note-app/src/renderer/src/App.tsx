import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import NoteEditor from './components/NoteEditor'
import NoteList from './components/NoteList'
import Settings from './pages/Settings'
import SearchModal from './components/SearchModal'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface NoteListItem {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

type View = 'notes' | 'settings'

function App(): JSX.Element {
  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<View>('notes')
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 加载笔记列表
  const loadNotes = useCallback(async () => {
    try {
      const noteList = await window.api.note.list()
      setNotes(noteList)
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }, [])

  // 初始化加载
  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  // 加载笔记内容
  const loadNote = useCallback(async (id: string) => {
    setIsLoading(true)
    try {
      const note = await window.api.note.read(id)
      if (note) {
        setCurrentNote(note)
      }
    } catch (error) {
      console.error('Failed to load note:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 创建新笔记
  const createNote = useCallback(async () => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newNote: Note = {
      id,
      title: '无标题',
      content: '',
      createdAt: now,
      updatedAt: now
    }

    try {
      await window.api.note.write({
        id: newNote.id,
        title: newNote.title,
        content: newNote.content
      })
      setCurrentNote(newNote)
      await loadNotes()
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }, [loadNotes])

  // 保存笔记
  const saveNote = useCallback(async (note: Note) => {
    try {
      await window.api.note.write({
        id: note.id,
        title: note.title,
        content: note.content
      })
      setCurrentNote({ ...note, updatedAt: new Date().toISOString() })
      await loadNotes()
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }, [loadNotes])

  // 删除笔记
  const deleteNote = useCallback(async (id: string) => {
    try {
      await window.api.note.delete(id)
      if (currentNote?.id === id) {
        setCurrentNote(null)
      }
      await loadNotes()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }, [currentNote, loadNotes])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: 新建笔记
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        createNote()
      }
      // Ctrl/Cmd + S: 保存笔记
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (currentNote) {
          saveNote(currentNote)
        }
      }
      // Ctrl/Cmd + F: 搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Escape: 关闭搜索
      if (e.key === 'Escape') {
        setShowSearch(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentNote, createNote, saveNote])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onSearch={() => setShowSearch(true)}
      />

      {/* 笔记列表 */}
      <NoteList
        notes={notes}
        currentNoteId={currentNote?.id}
        onSelectNote={loadNote}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
        {currentView === 'settings' ? (
          <Settings />
        ) : currentNote ? (
          <NoteEditor
            note={currentNote}
            onSave={saveNote}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg">选择或创建一个笔记</p>
              <p className="text-sm mt-2">
                按 <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Ctrl+N</kbd> 新建笔记
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 搜索模态框 */}
      {showSearch && (
        <SearchModal
          onClose={() => setShowSearch(false)}
          onSelectNote={(id) => {
            loadNote(id)
            setShowSearch(false)
          }}
        />
      )}
    </div>
  )
}

export default App
