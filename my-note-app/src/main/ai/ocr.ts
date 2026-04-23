import log from 'electron-log'

// 百度 OCR 配置
const BAIDU_OCR_API_KEY = process.env.BAIDU_OCR_API_KEY || ''
const BAIDU_OCR_SECRET_KEY = process.env.BAIDU_OCR_SECRET_KEY || ''
const BAIDU_OCR_API_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'

// 获取 Access Token
async function getAccessToken(): Promise<string> {
  try {
    if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
      throw new Error('百度 OCR API 密钥未配置')
    }

    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR_API_KEY}&client_secret=${BAIDU_OCR_SECRET_KEY}`

    const response = await fetch(tokenUrl, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`获取 Access Token 失败: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    log.error('Failed to get Access Token:', error)
    throw error
  }
}

// 通用文字识别
export async function recognizeText(imageBase64: string): Promise<string> {
  try {
    if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
      log.warn('Baidu OCR not configured, returning mock response')
      return '[OCR功能需要配置百度OCR API密钥，请在.env文件中设置BAIDU_OCR_API_KEY和BAIDU_OCR_SECRET_KEY]'
    }

    const accessToken = await getAccessToken()
    const url = `${BAIDU_OCR_API_URL}?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: imageBase64,
        language_type: 'CHN_ENG',  // 中英文混合
        detect_direction: 'true',   // 检测图像朝向
        detect_language: 'true',    // 检测语言
        paragraph: 'true',          // 返回段落信息
        probabilities: 'true'       // 返回识别结果中每一行的置信度
      })
    })

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.words_result) {
      return data.words_result
        .map((item: any) => item.words)
        .join('\n')
    }

    return ''
  } catch (error) {
    log.error('OCR recognition failed:', error)
    throw error
  }
}

// 手写文字识别
export async function recognizeHandwriting(imageBase64: string): Promise<string> {
  try {
    if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
      log.warn('Baidu OCR not configured')
      return '[手写识别功能需要配置百度OCR API密钥]'
    }

    const accessToken = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/handwriting?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: imageBase64
      })
    })

    if (!response.ok) {
      throw new Error(`Handwriting OCR API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.words_result) {
      return data.words_result
        .map((item: any) => item.words)
        .join('\n')
    }

    return ''
  } catch (error) {
    log.error('Handwriting recognition failed:', error)
    throw error
  }
}

// 表格识别
export async function recognizeTable(imageBase64: string): Promise<string> {
  try {
    if (!BAIDU_OCR_API_KEY || !BAIDU_OCR_SECRET_KEY) {
      log.warn('Baidu OCR not configured')
      return '[表格识别功能需要配置百度OCR API密钥]'
    }

    const accessToken = await getAccessToken()
    const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/form?access_token=${accessToken}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        image: imageBase64,
        return_table_format: 'true'
      })
    })

    if (!response.ok) {
      throw new Error(`Table OCR API error: ${response.status}`)
    }

    const data = await response.json()

    // 将表格结果转换为 Markdown 格式
    if (data.tables_result) {
      const markdown = data.tables_result.tables
        .map((table: any) => {
          const header = table.header.join(' | ')
          const separator = table.header.map(() => '---').join(' | ')
          const rows = table.body.map((row: string[]) => row.join(' | ')).join('\n')
          return `| ${header} |\n| ${separator} |\n| ${rows }`
        })
        .join('\n\n')

      return markdown
    }

    return ''
  } catch (error) {
    log.error('Table recognition failed:', error)
    throw error
  }
}
