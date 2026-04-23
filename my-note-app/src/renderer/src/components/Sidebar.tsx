import { Search, Settings, Book } from 'lucide-react'

interface SidebarProps {
  currentView: 'notes' | 'settings'
  onViewChange: (view: 'notes' | 'settings') => void
  onSearch: () => void
}

function Sidebar({ currentView, onViewChange, onSearch }: SidebarProps): JSX.Element {
  return (
    <aside className="w-14 bg-gray-900 text-white flex flex-col items-center py-4 gap-4">
      {/* Logo */}
      <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
        <Book className="w-6 h-6" />
      </div>

      {/* 搜索按钮 */}
      <button
        onClick={onSearch}
        className="w-10 h-10 rounded-xl hover:bg-gray-800 flex items-center justify-center transition-colors"
        title="搜索笔记"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* 分隔线 */}
      <div className="w-8 h-px bg-gray-700 my-2" />

      {/* 设置按钮 */}
      <button
        onClick={() => onViewChange(currentView === 'settings' ? 'notes' : 'settings')}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          currentView === 'settings' ? 'bg-primary-500' : 'hover:bg-gray-800'
        }`}
        title="设置"
      >
        <Settings className="w-5 h-5" />
      </button>
    </aside>
  )
}

export default Sidebar
