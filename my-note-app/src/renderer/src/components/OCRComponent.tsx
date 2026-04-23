import { useState, useRef } from 'react'
import { Upload, Loader2, Image as ImageIcon, Scan } from 'lucide-react'

interface OCRComponentProps {
  onRecognized: (text: string) => void
}

function OCRComponent({ onRecognized }: OCRComponentProps): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [recognizedText, setRecognizedText] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理图片选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    // 验证文件大小 (最大 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setError('图片大小不能超过 4MB')
      return
    }

    // 读取文件并转为 base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      // 移除 data:image/xxx;base64, 前缀
      const base64Data = base64.split(',')[1]
      setSelectedImage(base64Data)
      setError('')
    }
    reader.onerror = () => {
      setError('文件读取失败')
    }
    reader.readAsDataURL(file)
  }

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // 执行 OCR 识别
  const handleRecognize = async () => {
    if (!selectedImage) {
      setError('请先选择一张图片')
      return
    }

    setIsRecognizing(true)
    setError('')
    setRecognizedText('')

    try {
      // 调用主进程的 OCR 功能
      const text = await window.api.ocr.recognize(selectedImage)
      setRecognizedText(text)
      onRecognized(text)
    } catch (err) {
      console.error('OCR failed:', err)
      setError('识别失败，请检查图片或 API 配置')
    } finally {
      setIsRecognizing(false)
    }
  }

  // 复制识别结果
  const handleCopy = () => {
    if (recognizedText) {
      navigator.clipboard.writeText(recognizedText)
      alert('已复制到剪贴板')
    }
  }

  return (
    <div className="space-y-4">
      {/* 文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 上传区域 */}
      <div
        onClick={handleUploadClick}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors"
      >
        {selectedImage ? (
          <div className="space-y-2">
            <img
              src={`data:image/png;base64,${selectedImage}`}
              alt="Selected"
              className="max-h-48 mx-auto rounded-lg"
            />
            <p className="text-sm text-gray-500">点击更换图片</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">点击上传图片</p>
            <p className="text-sm text-gray-400">支持 JPG、PNG 格式，最大 4MB</p>
          </div>
        )}
      </div>

      {/* 识别按钮 */}
      <button
        onClick={handleRecognize}
        disabled={!selectedImage || isRecognizing}
        className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {isRecognizing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            识别中...
          </>
        ) : (
          <>
            <Scan className="w-5 h-5" />
            开始识别
          </>
        )}
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 识别结果 */}
      {recognizedText && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">识别结果</span>
            <button
              onClick={handleCopy}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              复制
            </button>
          </div>
          <textarea
            value={recognizedText}
            onChange={(e) => setRecognizedText(e.target.value)}
            className="w-full h-32 p-3 border-0 focus:outline-none resize-none"
            placeholder="识别结果将显示在这里..."
          />
        </div>
      )}
    </div>
  )
}

export default OCRComponent
