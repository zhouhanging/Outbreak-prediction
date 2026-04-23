import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readdir, rm, copyFileSync } from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import log from 'electron-log'

const execAsync = promisify(exec)

// 博客仓库路径
const BLOG_REPO_PATH = process.env.BLOG_REPO_PATH || join(app.getPath('userData'), 'blog')
const BLOG_SOURCE_PATH = join(BLOG_REPO_PATH, 'source', '_posts')

// 确保目录存在
function ensureDirectories(): void {
  if (!existsSync(BLOG_SOURCE_PATH)) {
    mkdirSync(BLOG_SOURCE_PATH, { recursive: true })
  }
}

// 生成博客文章
export async function generateBlog(content: string, title: string): Promise<string> {
  try {
    ensureDirectories()

    // 生成文件名（使用时间戳）
    const timestamp = new Date().toISOString().slice(0, 10)
    const slug = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/(^-|-$)/g, '')
    const filename = `${timestamp}-${slug}.md`
    const filepath = join(BLOG_SOURCE_PATH, filename)

    // 生成带 Front Matter 的 Markdown
    const frontMatter = `---
title: ${title}
date: ${new Date().toISOString()}
tags:
  - 笔记
categories:
  - 笔记整理
---

`

    const fullContent = frontMatter + content

    // 写入文件
    writeFileSync(filepath, fullContent, 'utf-8')

    log.info(`Blog post generated: ${filepath}`)
    return filepath
  } catch (error) {
    log.error('Error generating blog:', error)
    throw error
  }
}

// 执行 Hexo 命令
async function runHexoCommand(command: string): Promise<void> {
  try {
    log.info(`Running Hexo command: ${command}`)
    await execAsync(command, { cwd: BLOG_REPO_PATH, timeout: 120000 })
    log.info(`Hexo command completed: ${command}`)
  } catch (error) {
    log.error(`Hexo command failed: ${command}`, error)
    throw error
  }
}

// 部署博客
export async function deployBlog(): Promise<{ success: boolean; message: string }> {
  try {
    // 检查博客仓库是否存在
    if (!existsSync(BLOG_REPO_PATH)) {
      return {
        success: false,
        message: '博客仓库未找到，请先配置 BLOG_REPO_PATH 环境变量指向 Hexo 博客目录'
      }
    }

    // 执行 Hexo 部署命令
    await runHexoCommand('npx hexo clean')
    await runHexoCommand('npx hexo generate')
    await runHexoCommand('npx hexo deploy')

    log.info('Blog deployed successfully')
    return {
      success: true,
      message: '博客部署成功！'
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    log.error('Blog deployment failed:', error)

    return {
      success: false,
      message: `博客部署失败: ${errorMessage}`
    }
  }
}

// 获取博客文章列表
export async function listBlogPosts(): Promise<Array<{ filename: string; path: string }>> {
  try {
    ensureDirectories()
    const files = await readdir(BLOG_SOURCE_PATH)

    return files
      .filter((f) => f.endsWith('.md'))
      .map((filename) => ({
        filename,
        path: join(BLOG_SOURCE_PATH, filename)
      }))
  } catch (error) {
    log.error('Error listing blog posts:', error)
    return []
  }
}

// 删除博客文章
export async function deleteBlogPost(filename: string): Promise<boolean> {
  try {
    const filepath = join(BLOG_SOURCE_PATH, filename)

    if (existsSync(filepath)) {
      await rm(filepath, { force: true })
      log.info(`Blog post deleted: ${filepath}`)
    }

    return true
  } catch (error) {
    log.error('Error deleting blog post:', error)
    return false
  }
}
