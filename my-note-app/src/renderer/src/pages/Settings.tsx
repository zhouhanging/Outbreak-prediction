import { useState, useEffect } from 'react'
import { Save, ExternalLink, FolderOpen, Key } from 'lucide-react'

function Settings(): JSX.Element {
  const [doubaoApiKey, setDoubaoApiKey] = useState('')
  const [doubaoApiUrl, setDoubaoApiUrl] = useState('')
  const [blogRepoPath, setBlogRepoPath] = useState('')
  const [notesDir, setNotesDir] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // 加载设置
  useEffect(() => {
    // 从环境变量读取（这些在生产环境中应该存储在安全的地方）
    setDoubaoApiUrl(import.meta.env.VITE_DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions')
    
    // 获取笔记目录
    window.api.note.getNotesDir().then(setNotesDir).catch(console.error)
  }, [])

  // 保存设置
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 保存到本地存储（实际项目中应该使用更安全的方式）
      localStorage.setItem('settings_doubao_api_url', doubaoApiUrl)
      localStorage.setItem('settings_blog_repo_path', blogRepoPath)
      
      setSaveMessage('设置已保存！')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveMessage('保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  // 打开文件夹
  const openFolder = async (path: string) => {
    try {
      const { shell } = await import('electron')
      shell.openPath(path)
    } catch (error) {
      console.error('Failed to open folder:', error)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">设置</h1>

        {/* AI 设置 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            AI 设置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                豆包 API 地址
              </label>
              <input
                type="text"
                value={doubaoApiUrl}
                onChange={(e) => setDoubaoApiUrl(e.target.value)}
                placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                豆包 API 的接口地址，需要申请 API Key
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={doubaoApiKey}
                onChange={(e) => setDoubaoApiKey(e.target.value)}
                placeholder="请输入豆包 API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                API Key 不会保存到本地，每次启动需要重新输入
              </p>
            </div>
          </div>
        </section>

        {/* 博客设置 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            博客设置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hexo 博客仓库路径
              </label>
              <input
                type="text"
                value={blogRepoPath}
                onChange={(e) => setBlogRepoPath(e.target.value)}
                placeholder="C:\Users\YourName\blog"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                设置你的 Hexo 博客仓库路径，用于一键部署
              </p>
            </div>
          </div>
        </section>

        {/* 文件位置 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            文件位置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                笔记存储位置
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={notesDir}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                />
                <button
                  onClick={() => openFolder(notesDir)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  打开
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 保存按钮 */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存设置'}
          </button>
          {saveMessage && (
            <span className="text-sm text-green-600">{saveMessage}</span>
          )}
        </div>

        {/* 关于 */}
        <section className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">关于</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600">
              <strong>AI 笔记助手</strong> v1.0.0
            </p>
            <p className="text-sm text-gray-400 mt-2">
              一个本地优先的 AI 赋能笔记软件，支持语义搜索、智能整理、博客部署等功能。
            </p>
            <p className="text-xs text-gray-400 mt-4">
              技术栈: Electron + React + TypeScript + Tiptap + ChromaDB
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
