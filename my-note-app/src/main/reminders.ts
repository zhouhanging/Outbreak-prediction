import { Notification, app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import log from 'electron-log'
import { createReminder, getAllPendingReminders, markReminderTriggered, deleteReminder as dbDeleteReminder, getReminder } from './database'
import { readNote } from './file-system/notes'

let reminderInterval: NodeJS.Timeout | null = null

// 设置提醒定时检查
export function setupReminders(): void {
  // 每分钟检查一次
  reminderInterval = setInterval(checkReminders, 60000)
  log.info('Reminder system started')

  // 立即检查一次
  checkReminders()
}

// 停止提醒
export function stopReminders(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval)
    reminderInterval = null
    log.info('Reminder system stopped')
  }
}

// 检查所有待触发的提醒
async function checkReminders(): Promise<void> {
  try {
    const pendingReminders = getAllPendingReminders()
    const now = new Date()

    for (const reminder of pendingReminders) {
      const reminderTime = new Date(reminder.time)

      if (reminderTime <= now) {
        // 触发提醒
        await triggerReminder(reminder)
      }
    }
  } catch (error) {
    log.error('Error checking reminders:', error)
  }
}

// 触发提醒
async function triggerReminder(reminder: any): Promise<void> {
  try {
    // 读取关联的笔记
    const note = await readNote(reminder.note_id)
    const noteTitle = note?.title || '笔记提醒'

    // 显示桌面通知
    const notification = new Notification({
      title: '笔记提醒',
      body: `📝 ${noteTitle}`,
      silent: false
    })

    notification.on('click', () => {
      // 可以在这里添加点击后的操作，比如打开笔记
      log.info(`Reminder clicked for note: ${reminder.note_id}`)
    })

    notification.show()

    // 标记为已触发
    markReminderTriggered(reminder.id)
    log.info(`Reminder triggered: ${reminder.id}`)
  } catch (error) {
    log.error('Error triggering reminder:', error)
  }
}

// 添加提醒
export function addReminder(noteId: string, time: string): boolean {
  try {
    // 检查是否已有提醒
    const existingReminder = getReminder(noteId)
    if (existingReminder) {
      // 删除旧的提醒
      dbDeleteReminder(existingReminder.id)
    }

    const id = uuidv4()
    createReminder(id, noteId, time)
    log.info(`Reminder added for note ${noteId} at ${time}`)
    return true
  } catch (error) {
    log.error('Error adding reminder:', error)
    return false
  }
}

// 删除提醒
export function removeReminder(noteId: string): boolean {
  try {
    const reminder = getReminder(noteId)
    if (reminder) {
      dbDeleteReminder(reminder.id)
      log.info(`Reminder removed for note ${noteId}`)
    }
    return true
  } catch (error) {
    log.error('Error removing reminder:', error)
    return false
  }
}

// 获取提醒时间（格式化）
export function formatReminderTime(date: Date): string {
  return date.toISOString()
}
