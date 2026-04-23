import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

interface SpeechRecognitionComponentProps {
  onTranscript: (text: string) => void
  continuous?: boolean
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function SpeechRecognitionComponent({
  onTranscript,
  continuous = false
}: SpeechRecognitionComponentProps): JSX.Element {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // 检查浏览器支持
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = 'zh-CN'  // 中文

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results)
      const transcriptText = results
        .map((result: any) => result[0].transcript)
        .join('')

      setTranscript(transcriptText)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        onTranscript(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setError(`识别错误: ${event.error}`)
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [continuous, onTranscript, transcript])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      setError('')
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 录音按钮 */}
      <button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary-500 hover:bg-primary-600'
        } text-white shadow-lg`}
        title={isListening ? '停止录音' : '开始录音'}
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* 状态指示 */}
      <div className="text-sm text-gray-500">
        {isListening ? (
          <span className="flex items-center gap-1 text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            正在聆听...
          </span>
        ) : (
          <span>点击开始录音</span>
        )}
      </div>

      {/* 实时转写结果 */}
      {transcript && (
        <div className="w-full max-w-md p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}

export default SpeechRecognitionComponent
