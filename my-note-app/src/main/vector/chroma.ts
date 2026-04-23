import { app } from 'electron'
import { join } from 'path'
import log from 'electron-log'
import { v4 as uuidv4 } from 'uuid'

// ChromaDB 客户端
let chromaClient: any = null
let collection: any = null

// 获取 ChromaDB 存储路径
function getChromaPath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'data', 'chroma')
}

// 初始化向量数据库
export async function initVectorDB(): Promise<void> {
  try {
    // 使用 HTTP 客户端连接到本地 ChromaDB 服务
    // 注意：需要先运行 ChromaDB 服务器，或者使用 docker-compose 启动
    chromaClient = new ChromaClient({
      path: 'http://localhost:8000'
    })

    // 获取或创建笔记集合
    collection = await chromaClient.getOrCreateCollection({
      name: 'notes',
      metadata: { description: 'Notes vector collection for semantic search' }
    })

    log.info('ChromaDB initialized (connected to localhost:8000)')
  } catch (error) {
    // ChromaDB 连接失败不影响应用启动
    log.warn('ChromaDB initialization skipped - vector search will be disabled')
    log.warn('To enable vector search, run ChromaDB server: docker run -p 8000:8000 chromadb/chroma')
    collection = null
  }
}

// 添加笔记到向量数据库
export async function addToVectorDB(id: string, title: string, content: string): Promise<boolean> {
  // 如果向量数据库未初始化，跳过添加
  if (!collection) {
    log.warn('Vector DB not initialized, skipping add')
    return true
  }

  try {
    // 如果已存在，先删除
    try {
      await collection.delete({
        where: { id: id }
      })
    } catch (e) {
      // 忽略删除错误
    }

    // 简单的文本嵌入（实际项目中应该使用专门的嵌入模型）
    const textToEmbed = `${title}\n\n${content}`
    const embedding = await generateSimpleEmbedding(textToEmbed)

    await collection.add({
      ids: [id],
      embeddings: [embedding],
      documents: [textToEmbed],
      metadatas: [{ id, title }]
    })

    log.info(`Note added to vector DB: ${id}`)
    return true
  } catch (error) {
    log.error('Error adding to vector DB:', error)
    return false
  }
}

// 从向量数据库中删除笔记
export async function removeFromVectorDB(id: string): Promise<boolean> {
  try {
    if (!collection) {
      throw new Error('ChromaDB collection not initialized')
    }

    await collection.delete({
      where: { id: id }
    })

    log.info(`Note removed from vector DB: ${id}`)
    return true
  } catch (error) {
    log.error('Error removing from vector DB:', error)
    return false
  }
}

// 语义搜索
export async function searchVectorDB(
  query: string,
  limit: number = 10
): Promise<Array<{ id: string; title: string; content: string; distance: number }>> {
  // 如果向量数据库未初始化，返回空结果
  if (!collection) {
    log.warn('Vector DB not initialized, returning empty results')
    return []
  }

  try {
    const queryEmbedding = await generateSimpleEmbedding(query)

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      include: ['documents', 'metadatas', 'distances']
    })

    const searchResults: Array<{ id: string; title: string; content: string; distance: number }> = []

    if (results.ids && results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const doc = results.documents?.[0]?.[i] || ''
        const metadata = results.metadatas?.[0]?.[i] || {}
        const distance = results.distances?.[0]?.[i] || 0

        // 分离标题和内容
        const parts = doc.split('\n\n')
        const title = metadata.title || parts[0] || '无标题'
        const content = parts.slice(1).join('\n\n') || doc

        searchResults.push({
          id: results.ids[0][i],
          title,
          content,
          distance
        })
      }
    }

    log.info(`Vector search completed, found ${searchResults.length} results`)
    return searchResults
  } catch (error) {
    log.error('Error searching vector DB:', error)
    return []
  }
}

// 简单的文本嵌入函数（使用字符频率）
// 实际项目中应该使用专门的嵌入模型如 bge-m3 或 OpenAI embeddings
async function generateSimpleEmbedding(text: string): Promise<number[]> {
  const dimension = 384
  const embedding = new Array(dimension).fill(0)

  // 简单的基于字符的嵌入
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const index = charCode % dimension
    embedding[index] += Math.sin(i * 0.1) * 0.1
  }

  // 归一化
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= magnitude
    }
  }

  return embedding
}

// 关闭向量数据库
export async function closeVectorDB(): Promise<void> {
  try {
    if (chromaClient) {
      await chromaClient.close()
      chromaClient = null
      collection = null
      log.info('ChromaDB closed')
    }
  } catch (error) {
    log.error('Error closing ChromaDB:', error)
  }
}
