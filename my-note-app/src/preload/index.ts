import { contextBridge, ipcRenderer } from 'electron'

// 标签 API
export interface TagAPI {
  list: () => Promise<Array<{ id: string; name: string; color: string }>>
  create: (name: string, color?: string) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  addToNote: (noteId: string, tagId: string) => Promise<void>
  removeFromNote: (noteId: string, tagId: string) => Promise<void>
  getNoteTags: (noteId: string) => Promise<string[]>
}

// 笔记相关 API
export interface NoteAPI {
  list: () => Promise<Array<{ id: string; title: string; createdAt: string; updatedAt: string }>>
  read: (id: string) => Promise<{ id: string; title: string; content: string; createdAt: string; updatedAt: string } | null>
  write: (note: { id: string; title: string; content: string }) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  getNotesDir: () => Promise<string>
  search: (query: string) => Promise<Array<{ id: string; title: string; content: string; updatedAt: string }>>
}

// AI 相关 API
export interface AIAPI {
  generateCompletion: (text: string) => Promise<string>
}

// 博客相关 API
export interface BlogAPI {
  generate: (content: string, title: string) => Promise<string>
  deploy: () => Promise<{ success: boolean; message: string }>
}

// 向量数据库相关 API
export interface VectorAPI {
  search: (query: string) => Promise<Array<{ id: string; title: string; content: string; distance: number }>>
}

// 提醒相关 API
export interface ReminderAPI {
  add: (noteId: string, time: string) => Promise<boolean>
  remove: (noteId: string) => Promise<boolean>
  get: (noteId: string) => Promise<{ id: string; time: string } | null>
}

// 暴露 API 给渲染进程
const api: {
  note: NoteAPI
  tag: TagAPI
  ai: AIAPI
  blog: BlogAPI
  vector: VectorAPI
  reminder: ReminderAPI
} = {
  note: {
    list: () => ipcRenderer.invoke('note:list'),
    read: (id: string) => ipcRenderer.invoke('note:read', id),
    write: (note: { id: string; title: string; content: string }) => ipcRenderer.invoke('note:write', note),
    delete: (id: string) => ipcRenderer.invoke('note:delete', id),
    getNotesDir: () => ipcRenderer.invoke('note:getNotesDir'),
    search: (query: string) => ipcRenderer.invoke('note:search', query)
  },
  tag: {
    list: () => ipcRenderer.invoke('tag:list'),
    create: (name: string, color?: string) => ipcRenderer.invoke('tag:create', name, color),
    delete: (id: string) => ipcRenderer.invoke('tag:delete', id),
    addToNote: (noteId: string, tagId: string) => ipcRenderer.invoke('tag:addToNote', noteId, tagId),
    removeFromNote: (noteId: string, tagId: string) => ipcRenderer.invoke('tag:removeFromNote', noteId, tagId),
    getNoteTags: (noteId: string) => ipcRenderer.invoke('tag:getNoteTags', noteId)
  },
  ai: {
    generateCompletion: (text: string) => ipcRenderer.invoke('ai:generateCompletion', text)
  },
  blog: {
    generate: (content: string, title: string) => ipcRenderer.invoke('blog:generate', content, title),
    deploy: () => ipcRenderer.invoke('blog:deploy')
  },
  vector: {
    search: (query: string) => ipcRenderer.invoke('vector:search', query)
  },
  reminder: {
    add: (noteId: string, time: string) => ipcRenderer.invoke('reminder:add', noteId, time),
    remove: (noteId: string) => ipcRenderer.invoke('reminder:remove', noteId),
    get: (noteId: string) => ipcRenderer.invoke('reminder:get', noteId)
  }
}

contextBridge.exposeInMainWorld('api', api)
