import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import log from 'electron-log'

let db: Database.Database | null = null

// 获取数据库路径
function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'data', 'db.sqlite')
}

// 获取数据目录路径
function getDataPath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'data')
}

// 初始化数据库
export function initDatabase(): void {
  try {
    const dbPath = getDbPath()
    const dataPath = getDataPath()

    // 确保数据目录存在
    const fs = require('fs')
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true })
    }

    db = new Database(dbPath)
    log.info('Database opened at:', dbPath)

    // 创建表
    createTables()
  } catch (error) {
    log.error('Database initialization error:', error)
    throw error
  }
}

// 创建必要的表
function createTables(): void {
  if (!db) throw new Error('Database not initialized')

  // 标签表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT DEFAULT '#3B82F6'
    )
  `)

  // 笔记标签关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT NOT NULL,
      tag_id TEXT NOT NULL,
      PRIMARY KEY (note_id, tag_id),
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `)

  // 提醒表
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      time TEXT NOT NULL,
      is_triggered INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 设置表（用于存储应用配置）
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)

  log.info('Database tables created')
}

// 获取数据库实例
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized')
  }
  return db
}

// 笔记标签相关操作
export function addTagToNote(noteId: string, tagId: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)')
  stmt.run(noteId, tagId)
}

export function removeTagFromNote(noteId: string, tagId: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?')
  stmt.run(noteId, tagId)
}

export function getNoteTags(noteId: string): string[] {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('SELECT tag_id FROM note_tags WHERE note_id = ?')
  return stmt.all(noteId).map((row: any) => row.tag_id)
}

export function getAllTags(): Array<{ id: string; name: string; color: string }> {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('SELECT * FROM tags')
  return stmt.all() as Array<{ id: string; name: string; color: string }>
}

export function createTag(id: string, name: string, color: string = '#3B82F6'): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('INSERT OR IGNORE INTO tags (id, name, color) VALUES (?, ?, ?)')
  stmt.run(id, name, color)
}

export function deleteTag(id: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('DELETE FROM tags WHERE id = ?')
  stmt.run(id)
}

// 提醒相关操作
export function createReminder(id: string, noteId: string, time: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('INSERT INTO reminders (id, note_id, time) VALUES (?, ?, ?)')
  stmt.run(id, noteId, time)
}

export function getReminder(noteId: string): any {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('SELECT * FROM reminders WHERE note_id = ? AND is_triggered = 0')
  return stmt.get(noteId)
}

export function markReminderTriggered(id: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('UPDATE reminders SET is_triggered = 1 WHERE id = ?')
  stmt.run(id)
}

export function deleteReminder(id: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('DELETE FROM reminders WHERE id = ?')
  stmt.run(id)
}

export function getAllPendingReminders(): any[] {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('SELECT * FROM reminders WHERE is_triggered = 0')
  return stmt.all()
}

// 设置相关操作
export function getSetting(key: string): string | null {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
  const result = stmt.get(key) as { value: string } | undefined
  return result?.value ?? null
}

export function setSetting(key: string, value: string): void {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  stmt.run(key, value)
}

// 关闭数据库
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    log.info('Database closed')
  }
}
