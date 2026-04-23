import log from 'electron-log'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

// 讯飞语音配置
const XUNFEI_APP_ID = process.env.XUNFEI_APP_ID || ''
const XUNFEI_API_KEY = process.env.XUNFEI_API_KEY || ''

// 讯飞语音识别 API
const XUNFEI_ASR_URL = 'https://raasr.xfyun.cn/v2/ASR'

// 简单的语音转文字功能（使用浏览器原生 Web Speech API）
// 浏览器端会直接调用 Web Speech API，这里提供备用方案

export interface TranscriptionResult {
  text: string
  confidence: number
}

// 使用讯飞 API 进行语音转文字
export async function transcribeAudio(audioPath: string): Promise<TranscriptionResult> {
  try {
    if (!XUNFEI_APP_ID || !XUNFEI_API_KEY) {
      log.warn('Xunfei API not configured')
      return {
        text: '[语音识别功能需要配置讯飞API密钥]',
        confidence: 0
      }
    }

    // 读取音频文件并转为 base64
    const audioBuffer = fs.readFileSync(audioPath)
    const audioBase64 = audioBuffer.toString('base64')

    // 构建请求参数
    const params = {
      appId: XUNFEI_APP_ID,
      ts: Math.floor(Date.now() / 1000).toString(),
      fileSize: audioBuffer.length.toString(),
      fileName: path.basename(audioPath),
      content: audioBase64
    }

    // 注意：实际使用时需要计算签名
    // 这里只是一个示例结构

    log.info('Audio transcription requested')
    return {
      text: '[请配置讯飞API并实现签名计算]',
      confidence: 0
    }
  } catch (error) {
    log.error('Audio transcription failed:', error)
    throw error
  }
}

// 语音指令识别
export interface VoiceCommand {
  action: string
  params?: Record<string, string>
}

// 预定义的语音指令
const VOICE_COMMANDS = [
  { pattern: /新建笔记|创建笔记|new note/i, action: 'create_note' },
  { pattern: /保存笔记|保存|save/i, action: 'save_note' },
  { pattern: /删除笔记|删除|delete/i, action: 'delete_note' },
  { pattern: /搜索笔记|搜索|search/i, action: 'search_note' },
  { pattern: /打开设置|设置|settings/i, action: 'open_settings' },
  { pattern: /关闭应用|退出|quit/i, action: 'quit_app' }
]

// 识别语音命令
export function recognizeCommand(text: string): VoiceCommand | null {
  for (const cmd of VOICE_COMMANDS) {
    if (cmd.pattern.test(text)) {
      return { action: cmd.action }
    }
  }
  return null
}

// 语音合成（文字转语音）
export function speakText(text: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    speechSynthesis.speak(utterance)
    log.info('Speaking text:', text.substring(0, 50))
  } else {
    log.warn('Speech synthesis not supported')
  }
}

// 检查语音识别支持
export function isSpeechRecognitionSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
}
