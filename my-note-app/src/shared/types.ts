// 笔记类型定义
export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  reminderTime?: string
}

// 笔记列表项（不含内容）
export interface NoteListItem {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

// 标签类型
export interface Tag {
  id: string
  name: string
  color: string
}

// 提醒类型
export interface Reminder {
  id: string
  noteId: string
  time: string
  isTriggered: boolean
}

// AI 补全结果
export interface AICompletionResult {
  success: boolean
  text: string
  error?: string
}

// 博客生成结果
export interface BlogGenerateResult {
  success: boolean
  filePath?: string
  error?: string
}

// 博客部署结果
export interface BlogDeployResult {
  success: boolean
  message: string
  deployedUrl?: string
}

// 向量搜索结果
export interface VectorSearchResult {
  id: string
  title: string
  content: string
  distance: number
}

// 搜索结果类型
export interface SearchResult {
  notes: NoteListItem[]
  vectorResults: VectorSearchResult[]
}

// 环境变量类型
export interface EnvConfig {
  // 豆包 API
  DOUBAO_API_KEY?: string
  DOUBAO_API_URL?: string

  // 博客配置
  BLOG_REPO_PATH?: string
  BLOG_GIT_REMOTE?: string

  // 百度 OCR
  BAIDU_OCR_API_KEY?: string
  BAIDU_OCR_SECRET_KEY?: string

  // 讯飞语音
  XUNFEI_APP_ID?: string
  XUNFEI_API_KEY?: string
}
