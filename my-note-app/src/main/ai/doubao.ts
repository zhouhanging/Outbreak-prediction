import log from 'electron-log'

// 豆包 API 配置
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || ''
const DOUBAO_API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

// 生成补全内容
export async function generateCompletion(
  prompt: string,
  systemPrompt: string = '你是一个智能笔记助手，请根据用户选中的内容提供补全或整理建议。'
): Promise<string> {
  try {
    if (!DOUBAO_API_KEY) {
      log.warn('DOUBAO_API_KEY not configured, returning mock response')
      return '[AI补全功能需要配置豆包API密钥，请在.env文件中设置DOUBAO_API_KEY]'
    }

    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model: 'doubao-pro-32k',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error('Doubao API error:', response.status, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const completion = data.choices?.[0]?.message?.content || ''

    log.info('AI completion generated successfully')
    return completion
  } catch (error) {
    log.error('Error generating AI completion:', error)
    throw error
  }
}

// 整理笔记内容
export async function organizeNote(content: string): Promise<string> {
  return await generateCompletion(
    `请将以下笔记内容整理成结构化的Markdown格式，使其更加清晰易读：\n\n${content}`,
    '你是一个专业的笔记整理助手，擅长将杂乱的笔记内容整理成结构清晰、格式规范的Markdown笔记。'
  )
}

// 补全选中文本
export async function completeText(selectedText: string, context: string = ''): Promise<string> {
  return await generateCompletion(
    `请根据以下上下文，补全用户选中的内容：\n\n上下文：${context}\n\n选中的内容：${selectedText}`,
    '你是一个智能写作助手，擅长根据上下文补全和扩展用户选中的文本内容。'
  )
}

// 生成思维导图
export async function generateMindmap(content: string): Promise<string> {
  return await generateCompletion(
    `请根据以下笔记内容，生成一个Mermaid格式的思维导图代码：\n\n${content}`,
    '你是一个专业的知识整理助手。请根据提供的内容生成一个结构清晰的Mermaid思维导图代码，只输出代码，不要有其他说明。格式示例：\n```mermaid\nmindmap\n  root((主题))\n    分支1\n      子节点\n    分支2\n      子节点\n```'
  )
}

// 生成流程图
export async function generateFlowchart(description: string): Promise<string> {
  return await generateCompletion(
    `请根据以下描述生成一个Mermaid格式的流程图代码：\n\n${description}`,
    '你是一个专业的流程设计助手。请根据描述生成一个结构清晰的Mermaid流程图代码，只输出代码，不要有其他说明。'
  )
}

// AI 问答（基于笔记内容）
export async function askQuestion(question: string, contextNotes: string[]): Promise<string> {
  return await generateCompletion(
    `请基于以下笔记内容回答用户的问题：\n\n相关笔记内容：\n${contextNotes.join('\n\n---\n\n')}\n\n用户问题：${question}`,
    '你是一个智能笔记助手，基于用户的笔记内容回答问题。如果笔记中没有相关信息，请明确告知用户。'
  )
}
