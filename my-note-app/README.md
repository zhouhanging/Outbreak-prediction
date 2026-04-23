# AI 笔记助手

一个本地优先的 AI 赋能笔记软件，具备以下核心能力：

- 📝 基础笔记编辑和管理（Markdown 格式）
- 🔍 本地 AI 向量数据库语义搜索
- ✨ AI 自动补全和整理笔记
- 🧠 AI 自动生成思维导图
- 🚀 一键生成并部署 Hexo 静态博客
- ⏰ 笔记绑定时间提醒
- 🔤 手写拍照 OCR 识别（规划中）
- 🎤 语音输入和指令控制（规划中）

## 技术栈

| 模块 | 技术选择 |
|------|----------|
| 桌面端框架 | Electron + Vite |
| 前端框架 | React 18 + TypeScript |
| UI | Tailwind CSS + Lucide 图标 |
| 富文本编辑器 | Tiptap |
| 本地存储 | 纯 Markdown 文件 + SQLite |
| 向量数据库 | ChromaDB |
| AI 能力 | 豆包 API / Ollama + DeepSeek |

## 快速开始

### 环境要求

- Node.js 18+
- npm 8+ 或 pnpm

### 安装依赖

```bash
cd my-note-app
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置你的 API 密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DOUBAO_API_KEY=your_api_key_here
DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

### 开发模式运行

```bash
npm run dev
```

### 构建应用

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

构建产物将在 `dist` 目录中生成。

## Docker 部署

### 使用 Docker Compose

```bash
# 启动应用
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止应用
docker-compose down
```

### 仅构建 Docker 镜像

```bash
# 构建镜像
docker build -t ai-note-app .

# 运行容器
docker run -d \
  --name ai-note-app \
  -p 9222:9222 \
  -v note-app-data:/app/data \
  ai-note-app
```

## 项目结构

```
my-note-app/
├── src/
│   ├── main/                # Electron 主进程
│   │   ├── index.ts         # 主进程入口
│   │   ├── database/        # SQLite 数据库操作
│   │   ├── file-system/     # 本地文件系统操作
│   │   ├── ai/              # AI API 调用
│   │   ├── blog/            # 博客生成与部署
│   │   ├── vector/          # 向量数据库操作
│   │   └── reminders.ts     # 提醒功能
│   ├── preload/             # 预加载脚本
│   ├── renderer/            # React 前端
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   ├── components/
│   │   │   └── pages/
│   │   └── index.html
│   └── shared/              # 共享类型定义
├── data/                    # 数据存储（笔记、数据库）
├── .env                     # 环境变量
├── electron.vite.config.ts
└── package.json
```

## 功能使用

### 基础操作

- `Ctrl + N` - 新建笔记
- `Ctrl + S` - 保存笔记
- `Ctrl + F` - 搜索笔记

### AI 功能

1. **智能补全**：选中内容后点击 AI 按钮，选择"智能补全"
2. **整理笔记**：点击 AI 按钮，选择"整理笔记"自动格式化内容
3. **生成思维导图**：点击 AI 按钮，选择"生成思维导图"

### 博客部署

1. 在设置中配置 Hexo 博客仓库路径
2. 选中要发布的内容
3. 点击博客按钮生成并部署

## 开发指南

### 添加新的 AI 功能

在 `src/main/ai/doubao.ts` 中添加新的函数：

```typescript
export async function myNewFeature(prompt: string): Promise<string> {
  return await generateCompletion(prompt, '你的系统提示词');
}
```

### 添加新的 IPC 处理器

在 `src/main/index.ts` 的 `registerIpcHandlers` 函数中添加：

```typescript
ipcMain.handle('my:feature', async (_, param) => {
  return await myNewFeature(param);
});
```

## 许可证

MIT License
