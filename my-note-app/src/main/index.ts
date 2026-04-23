import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import log from 'electron-log'
import { initDatabase, getDatabase } from './database'
import { readNote, writeNote, deleteNote, listNotes, getNotesDir } from './file-system/notes'
import { generateCompletion } from './ai/doubao'
import { generateBlog, deployBlog } from './blog'
import { initVectorDB, addToVectorDB, searchVectorDB } from './vector/chroma'
import { setupReminders, addReminder, removeReminder } from './reminders'
import { v4 as uuidv4 } from 'uuid'
import {
  createTag,
  getAllTags,
  deleteTag as dbDeleteTag,
  addTagToNote,
  removeTagFromNote,
  getNoteTags
} from './database'

// 配置日志
log.transports.file.level = 'info'
log.info('Application starting...')

// 全局异常处理
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  app.exit(1)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    log.info('Main window shown')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发模式下加载本地服务器
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 应用准备好后初始化
app.whenReady().then(async () => {
  log.info('App is ready')

  // 设置 electron-toolkit 工具
  electronApp.setAppUserModelId('com.my-note-app')

  // 监听窗口关闭事件
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 初始化数据库
  try {
    initDatabase()
    log.info('Database initialized')
  } catch (error) {
    log.error('Database initialization failed:', error)
  }

  // 初始化向量数据库
  try {
    await initVectorDB()
    log.info('Vector DB initialized')
  } catch (error) {
    log.error('Vector DB initialization failed:', error)
  }

  // 设置提醒功能
  setupReminders()

  // 注册 IPC 处理器
  registerIpcHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 注册所有 IPC 处理器
function registerIpcHandlers(): void {
  // 笔记相关
  ipcMain.handle('note:list', async () => {
    return await listNotes()
  })

  ipcMain.handle('note:read', async (_, id: string) => {
    return await readNote(id)
  })

  ipcMain.handle('note:write', async (_, note: { id: string; title: string; content: string }) => {
    const result = await writeNote(note.id, note.title, note.content)
    // 自动添加到向量数据库
    if (result) {
      await addToVectorDB(note.id, note.title, note.content)
    }
    return result
  })

  ipcMain.handle('note:delete', async (_, id: string) => {
    return await deleteNote(id)
  })

  ipcMain.handle('note:getNotesDir', async () => {
    return getNotesDir()
  })

  // AI 相关
  ipcMain.handle('ai:generateCompletion', async (_, text: string) => {
    return await generateCompletion(text)
  })

  // 博客相关
  ipcMain.handle('blog:generate', async (_, content: string, title: string) => {
    return await generateBlog(content, title)
  })

  ipcMain.handle('blog:deploy', async () => {
    return await deployBlog()
  })

  // 向量数据库相关
  ipcMain.handle('vector:search', async (_, query: string) => {
    return await searchVectorDB(query)
  })

  // 提醒相关
  ipcMain.handle('reminder:add', async (_, noteId: string, time: string) => {
    return await addReminder(noteId, time)
  })

  ipcMain.handle('reminder:remove', async (_, noteId: string) => {
    return await removeReminder(noteId)
  })

  // 标签相关
  ipcMain.handle('tag:list', async () => {
    return await getAllTags()
  })

  ipcMain.handle('tag:create', async (_, name: string, color?: string) => {
    try {
      const id = uuidv4()
      createTag(id, name, color || '#3B82F6')
      return true
    } catch (error) {
      log.error('Error creating tag:', error)
      return false
    }
  })

  ipcMain.handle('tag:delete', async (_, id: string) => {
    try {
      dbDeleteTag(id)
      return true
    } catch (error) {
      log.error('Error deleting tag:', error)
      return false
    }
  })

  ipcMain.handle('tag:addToNote', async (_, noteId: string, tagId: string) => {
    try {
      addTagToNote(noteId, tagId)
    } catch (error) {
      log.error('Error adding tag to note:', error)
    }
  })

  ipcMain.handle('tag:removeFromNote', async (_, noteId: string, tagId: string) => {
    try {
      removeTagFromNote(noteId, tagId)
    } catch (error) {
      log.error('Error removing tag from note:', error)
    }
  })

  ipcMain.handle('tag:getNoteTags', async (_, noteId: string) => {
    try {
      return await getNoteTags(noteId)
    } catch (error) {
      log.error('Error getting note tags:', error)
      return []
    }
  })

  log.info('All IPC handlers registered')
}

// 关闭所有窗口后退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
