import { useState, useEffect } from 'react'
import { Save, ExternalLink, FolderOpen, Key, Server, CheckCircle, XCircle, Loader2 } from 'lucide-react'

function Settings(): JSX.Element {
  const [doubaoApiKey, setDoubaoApiKey] = useState('')
  const [doubaoApiUrl, setDoubaoApiUrl] = useState('')
  const [blogRepoPath, setBlogRepoPath] = useState('')
  const [notesDir, setNotesDir] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Ollama 设置
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState('llama3.2')
  const [aiService, setAiService] = useState<'auto' | 'doubao' | 'ollama'>('auto')
  const [healthStatus, setHealthStatus] = useState<{ doubao: boolean; ollama: boolean }>({ doubao: false, ollama: false })

  // 加载设置
  useEffect(() => {
    setDoubaoApiUrl(import.meta.env.VITE_DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions')
    window.api.note.getNotesDir().then(setNotesDir).catch(console.error)
    
    // 加载保存的设置
    const savedService = localStorage.getItem('settings_ai_service') as 'auto' | 'doubao' | 'ollama' | null
    if (savedService) setAiService(savedService)
    setOllamaHost(localStorage.getItem('settings_ollama_host') || 'http://localhost:11434')
    setOllamaModel(localStorage.getItem('settings_ollama_model') || 'llama3.2')
    setBlogRepoPath(localStorage.getItem('settings_blog_repo_path') || '')
  }, [])

  // 保存设置
  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('settings_ai_service', aiService)
      localStorage.setItem('settings_ollama_host', ollamaHost)
      localStorage.setItem('settings_ollama_model', ollamaModel)
      localStorage.setItem('settings_blog_repo_path', blogRepoPath)
      localStorage.setItem('settings_doubao_api_url', doubaoApiUrl)
      
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

        {/* AI 服务选择 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            AI 服务选择
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="ai-service"
                value="auto"
                checked={aiService === 'auto'}
                onChange={(e) => setAiService(e.target.value as 'auto')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-800">自动选择（推荐）</p>
                <p className="text-sm text-gray-500">优先使用本地 Ollama，失败时回退到豆包</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="ai-service"
                value="ollama"
                checked={aiService === 'ollama'}
                onChange={(e) => setAiService(e.target.value as 'ollama')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-800">仅使用本地 Ollama</p>
                <p className="text-sm text-gray-500">完全离线运行，需要安装 Ollama</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="ai-service"
                value="doubao"
                checked={aiService === 'doubao'}
                onChange={(e) => setAiService(e.target.value as 'doubao')}
                className="w-4 h-4"
              />
              <div>
                <p className="font-medium text-gray-800">仅使用豆包 API</p>
                <p className="text-sm text-gray-500">使用云端 AI，需要网络连接</p>
              </div>
            </label>
          </div>
        </section>

        {/* Ollama 设置 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-green-600" />
            Ollama 本地设置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ollama 服务地址
              </label>
              <input
                type="text"
                value={ollamaHost}
                onChange={(e) => setOllamaHost(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                本地 Ollama 服务的地址，默认端口 11434
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                模型名称
              </label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="llama3.2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                推荐模型：llama3.2, qwen2.5, deepseek-r1
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <strong>安装 Ollama：</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                1. 访问{' '}
                <a href="https://ollama.com" target="_blank" rel="noopener" className="text-primary-600 hover:underline">
                  ollama.com
                </a>{' '}
                下载安装
              </p>
              <p className="text-xs text-gray-500">
                2. 安装后运行：<code className="bg-gray-200 px-1 rounded">ollama pull llama3.2</code>
              </p>
            </div>
          </div>
        </section>

        {/* 豆包 API 设置 */}
        <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            豆包 API 设置（备选）
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API 地址
              </label>
              <input
                type="text"
                value={doubaoApiUrl}
                onChange={(e) => setDoubaoApiUrl(e.target.value)}
                placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
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
                从火山引擎申请：console.volcengine.com
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
              <strong>AI 笔记助手</strong> v1.1.0
            </p>
            <p className="text-sm text-gray-400 mt-2">
              一个本地优先的 AI 赋能笔记软件，支持 Ollama 本地模型、语义搜索、智能整理等功能。
            </p>
            <p className="text-xs text-gray-400 mt-4">
              技术栈: Electron + React + TypeScript + Tiptap
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Settings
