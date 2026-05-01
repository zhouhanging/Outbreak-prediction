import log from 'electron-log'
import { generate as doubaoGenerate, isDoubaoAvailable } from './doubao'
import { generate as ollamaGenerate, isOllamaAvailable, listModels } from './ollama'
import { getEmbedding } from './embedding'

// AI 服务类型
export type AIServiceType = 'doubao' | 'ollama' | 'auto'

// AI 配置
export interface AIConfig {
  service: AIServiceType
  doubaoApiKey?: string
  doubaoModel?: string
  ollamaModel?: string
  ollamaHost?: string
}

// 全局配置
let currentConfig: AIConfig = {
  service: 'auto'
}

// 设置配置
export function setAIConfig(config: Partial<AIConfig>): void {
  currentConfig = { ...currentConfig, ...config }
  log.info('AI config updated:', currentConfig)
}

// 获取配置
export function getAIConfig(): AIConfig {
  return { ...currentConfig }
}

// 检测可用的服务
export async function detectAvailableService(): Promise<AIServiceType> {
  // 优先使用本地 Ollama
  if (await isOllamaAvailable()) {
    log.info('Ollama is available, using local AI')
    return 'ollama'
  }
  
  // 回退到豆包
  if (await isDoubaoAvailable()) {
    log.info('Doubao is available, using cloud AI')
    return 'doubao'
  }
  
  log.warn('No AI service available')
  return 'doubao'
}

// 获取文本嵌入
export async function getTextEmbedding(text: string): Promise<number[]> {
  return await getEmbedding(text)
}

// 生成文本补全
export async function generateCompletion(
  prompt: string,
  options?: {
    system?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const service = currentConfig.service === 'auto' 
    ? await detectAvailableService() 
    : currentConfig.service

  log.info(`Generating completion using ${service}`)

  try {
    if (service === 'ollama') {
      const models = await listModels()
      const model = currentConfig.ollamaModel || models[0]?.name || 'llama3.2'
      
      return await ollamaGenerate(model, prompt, {
        system: options?.system,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens
      })
    }
    
    // 默认使用豆包
    return await doubaoGenerate(prompt)
  } catch (error) {
    log.error('AI generation failed:', error)
    throw error
  }
}

// AI 服务健康检查
export async function healthCheck(): Promise<{
  doubao: boolean
  ollama: boolean
  currentService: AIServiceType
}> {
  const [doubao, ollama] = await Promise.all([
    isDoubaoAvailable(),
    isOllamaAvailable()
  ])

  const currentService = currentConfig.service === 'auto'
    ? await detectAvailableService()
    : currentConfig.service

  return { doubao, ollama, currentService }
}
