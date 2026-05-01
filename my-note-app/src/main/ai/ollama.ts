import log from 'electron-log'

// Ollama API 配置
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

export interface OllamaModel {
  name: string
  model: string
  size: number
  digest: string
  modified_at: string
}

// 检查 Ollama 服务是否可用
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch {
    return false
  }
}

// 获取已安装的模型列表
export async function listModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.models || []
  } catch {
    return []
  }
}

// 生成文本补全
export async function generate(
  model: string,
  prompt: string,
  options?: { system?: string; temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: options?.system,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    if (!response.ok) throw new Error(`Generate failed: ${response.status}`)
    const data = await response.json()
    return data.response || ''
  } catch (error) {
    log.error('Ollama generate failed:', error)
    throw error
  }
}

// 生成文本嵌入
export async function generateEmbedding(model: string, text: string): Promise<number[]> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text })
    })
    if (!response.ok) throw new Error(`Embedding failed: ${response.status}`)
    const data = await response.json()
    return data.embedding || []
  } catch (error) {
    log.error('Ollama embedding failed:', error)
    throw error
  }
}

// 聊天对话
export async function chat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 2000
        }
      })
    })
    if (!response.ok) throw new Error(`Chat failed: ${response.status}`)
    const data = await response.json()
    return data.message?.content || ''
  } catch (error) {
    log.error('Ollama chat failed:', error)
    throw error
  }
}
