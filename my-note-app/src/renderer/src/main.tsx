import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 全局类型声明
declare global {
  interface Window {
    api: {
      note: {
        list: () => Promise<Array<{ id: string; title: string; createdAt: string; updatedAt: string }>>
        read: (id: string) => Promise<{ id: string; title: string; content: string; createdAt: string; updatedAt: string } | null>
        write: (note: { id: string; title: string; content: string }) => Promise<boolean>
        delete: (id: string) => Promise<boolean>
        getNotesDir: () => Promise<string>
      }
      ai: {
        generateCompletion: (text: string) => Promise<string>
      }
      blog: {
        generate: (content: string, title: string) => Promise<string>
        deploy: () => Promise<{ success: boolean; message: string }>
      }
      vector: {
        search: (query: string) => Promise<Array<{ id: string; title: string; content: string; distance: number }>>
      }
      reminder: {
        add: (noteId: string, time: string) => Promise<boolean>
        remove: (noteId: string) => Promise<boolean>
      }
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
