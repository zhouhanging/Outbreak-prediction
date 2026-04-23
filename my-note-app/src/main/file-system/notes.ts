import { app } from 'electron'
import { join } from 'path'
import { readFile, writeFile, unlink, readdir, stat } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import log from 'electron-log'
import type { Note, NoteListItem } from '@shared/types'

// 获取笔记存储目录
export function getNotesDir(): string {
  const userDataPath = app.getPath('userData')
  const notesDir = join(userDataPath, 'data', 'notes')

  // 确保目录存在
  if (!existsSync(notesDir)) {
    mkdirSync(notesDir, { recursive: true })
  }

  return notesDir
}

// 获取笔记文件路径
function getNotePath(id: string): string {
  return join(getNotesDir(), `${id}.md`)
}

// 解析笔记内容（从 Markdown 文件中提取标题和元数据）
interface ParsedNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

function parseNoteFile(filename: string, content: string): ParsedNote {
  const id = filename.replace('.md', '')
  const lines = content.split('\n')

  let title = '无标题'
  let createdAt = new Date().toISOString()
  let updatedAt = createdAt

  // 解析 Front Matter
  if (lines[0] === '---') {
    let i = 1
    while (i < lines.length && lines[i] !== '---') {
      const [key, ...valueParts] = lines[i].split(':')
      const value = valueParts.join(':').trim()

      if (key === 'title') {
        title = value
      } else if (key === 'created') {
        createdAt = value
      } else if (key === 'updated') {
        updatedAt = value
      }
      i++
    }

    // 内容从第二个 --- 之后开始
    const contentStart = lines.indexOf('---', i)
    if (contentStart !== -1) {
      lines.splice(0, contentStart + 1)
    } else {
      lines.splice(0, i + 1)
    }
  }

  return {
    id,
    title,
    content: lines.join('\n').trim(),
    createdAt,
    updatedAt
  }
}

// 序列化笔记为 Markdown 格式
function serializeNote(note: { id: string; title: string; content: string; createdAt?: string }): string {
  const now = new Date().toISOString()
  const createdAt = note.createdAt || now

  return `---
title: ${note.title}
created: ${createdAt}
updated: ${now}
---

${note.content}`
}

// 列出所有笔记
export async function listNotes(): Promise<NoteListItem[]> {
  try {
    const notesDir = getNotesDir()
    const files = await readdir(notesDir)

    const notes: NoteListItem[] = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      try {
        const content = await readFile(join(notesDir, file), 'utf-8')
        const parsed = parseNoteFile(file, content)

        notes.push({
          id: parsed.id,
          title: parsed.title,
          createdAt: parsed.createdAt,
          updatedAt: parsed.updatedAt
        })
      } catch (err) {
        log.error(`Error reading note ${file}:`, err)
      }
    }

    // 按更新时间倒序排列
    notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return notes
  } catch (error) {
    log.error('Error listing notes:', error)
    return []
  }
}

// 读取笔记
export async function readNote(id: string): Promise<Note | null> {
  try {
    const notePath = getNotePath(id)

    if (!existsSync(notePath)) {
      return null
    }

    const content = await readFile(notePath, 'utf-8')
    const parsed = parseNoteFile(`${id}.md`, content)

    return {
      id: parsed.id,
      title: parsed.title,
      content: parsed.content,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt
    }
  } catch (error) {
    log.error(`Error reading note ${id}:`, error)
    return null
  }
}

// 写入笔记
export async function writeNote(
  id: string,
  title: string,
  content: string,
  createdAt?: string
): Promise<boolean> {
  try {
    const notePath = getNotePath(id)

    // 如果是新笔记，记录创建时间
    let noteCreatedAt = createdAt
    if (!noteCreatedAt && !existsSync(notePath)) {
      noteCreatedAt = new Date().toISOString()
    }

    const note = {
      id,
      title,
      content,
      createdAt: noteCreatedAt
    }

    await writeFile(notePath, serializeNote(note), 'utf-8')
    log.info(`Note saved: ${id}`)
    return true
  } catch (error) {
    log.error(`Error writing note ${id}:`, error)
    return false
  }
}

// 删除笔记
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const notePath = getNotePath(id)

    if (existsSync(notePath)) {
      await unlink(notePath)
      log.info(`Note deleted: ${id}`)
    }

    return true
  } catch (error) {
    log.error(`Error deleting note ${id}:`, error)
    return false
  }
}

// 创建新笔记
export async function createNewNote(): Promise<Note> {
  const id = uuidv4()
  const now = new Date().toISOString()

  await writeNote(id, '无标题', '', now)

  return {
    id,
    title: '无标题',
    content: '',
    createdAt: now,
    updatedAt: now
  }
}
