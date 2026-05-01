import log from 'electron-log'
import { generateEmbedding as ollamaEmbed, isOllamaAvailable, listModels } from './ollama'

// 本地嵌入模型配置
const DEFAULT_EMBED_MODEL = 'nomic-embed-text'
const EMBED_DIMENSIONS = 768

// 简单的 TF-IDF 风格嵌入（备用）
function simpleTextEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const wordFreq: Record<string, number> = {}
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  // 创建固定维度的向量
  const vocab = Object.keys(wordFreq)
  const embedding: number[] = new Array(EMBED_DIMENSIONS).fill(0)
  
  vocab.slice(0, EMBED_DIMENSIONS).forEach((word, i) => {
    embedding[i] = wordFreq[word] / words.length
  })

  // 归一化
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (norm > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= norm
    }
  }

  return embedding
}

// 获取嵌入向量
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const available = await isOllamaAvailable()
    
    if (available) {
      const models = await listModels()
      const embedModel = models.find(m => 
        m.name.includes('embed') || m.name.includes('nomic')
      )
      
      if (embedModel) {
        log.info(`Using Ollama model for embedding: ${embedModel.name}`)
        return await ollamaEmbed(embedModel.name, text)
      }
    }
    
    // 降级到简单嵌入
    log.warn('Using simple text embedding (Ollama not available)')
    return simpleTextEmbedding(text)
  } catch (error) {
    log.error('Embedding generation failed, using fallback:', error)
    return simpleTextEmbedding(text)
  }
}

// 计算余弦相似度
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  return denominator === 0 ? 0 : dotProduct / denominator
}

// 批量获取嵌入
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(text => getEmbedding(text)))
}
