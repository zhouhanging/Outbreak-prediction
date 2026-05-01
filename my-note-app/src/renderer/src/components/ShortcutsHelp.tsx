import { useState } from 'react'
import { X, Keyboard } from 'lucide-react'

interface ShortcutItem {
  keys: string
  description: string
  category: string
}

const shortcuts: ShortcutItem[] = [
  // 文件操作
  { keys: 'Ctrl + N', description: '新建笔记', category: '文件' },
  { keys: 'Ctrl + S', description: '保存笔记', category: '文件' },
  { keys: 'Ctrl + O', description: '打开笔记', category: '文件' },
  { keys: 'Ctrl + W', description: '关闭当前笔记', category: '文件' },
  { keys: 'Ctrl + E', description: '导出笔记', category: '文件' },

  // 编辑操作
  { keys: 'Ctrl + Z', description: '撤销', category: '编辑' },
  { keys: 'Ctrl + Y', description: '重做', category: '编辑' },
  { keys: 'Ctrl + C', description: '复制', category: '编辑' },
  { keys: 'Ctrl + V', description: '粘贴', category: '编辑' },
  { keys: 'Ctrl + X', description: '剪切', category: '编辑' },
  { keys: 'Ctrl + A', description: '全选', category: '编辑' },
  { keys: 'Ctrl + F', description: '搜索', category: '编辑' },
  { keys: 'Ctrl + D', description: '复制当前行', category: '编辑' },

  // 格式化
  { keys: 'Ctrl + B', description: '粗体', category: '格式' },
  { keys: 'Ctrl + I', description: '斜体', category: '格式' },
  { keys: 'Ctrl + K', description: '插入链接', category: '格式' },
  { keys: 'Ctrl + Shift + K', description: '插入代码块', category: '格式' },
  { keys: 'Ctrl + L', description: '插入列表', category: '格式' },

  // 导航
  { keys: 'Ctrl + 1-6', description: '切换标题级别', category: '标题' },
  { keys: 'Tab', description: '缩进', category: '格式' },
  { keys: 'Shift + Tab', description: '取消缩进', category: '格式' },

  // 通用
  { keys: 'Escape', description: '关闭弹窗/取消', category: '通用' },
  { keys: 'Ctrl + ,', description: '打开设置', category: '通用' },
]

interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps): JSX.Element | null {
  if (!isOpen) return null

  const categories = [...new Set(shortcuts.map(s => s.category))]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Keyboard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">键盘快捷键</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="overflow-y-auto p-6">
          {categories.map(category => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">{shortcut.description}</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-mono text-gray-600">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            按 <kbd className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs">?</kbd> 打开此面板
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShortcutsHelp
