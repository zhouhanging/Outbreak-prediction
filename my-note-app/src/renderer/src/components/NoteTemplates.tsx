// 预设笔记模板
export interface NoteTemplate {
  id: string
  name: string
  description: string
  content: string
  icon: string
}

export const templates: NoteTemplate[] = [
  {
    id: 'daily',
    name: '每日计划',
    description: '包含今日目标、任务清单、时间安排的模板',
    icon: '📅',
    content: `# {{date}}

## 🎯 今日目标
- [ ] 目标1
- [ ] 目标2
- [ ] 目标3

## 📋 任务清单
### 上午
- [ ] 

### 下午
- [ ] 

## ⏰ 时间块
| 时间 | 内容 |
|------|------|
| 9:00-10:00 |  |
| 10:00-11:00 |  |
| 14:00-15:00 |  |

## 📝 今日总结
记录今天的收获和反思...
`
  },
  {
    id: 'meeting',
    name: '会议记录',
    description: '用于记录会议内容、决议和待办事项',
    icon: '📝',
    content: `# 会议记录：{{title}}

**时间：** {{date}}  
**地点：**   
**参会人员：** 

## 📌 议程
1. 

## 💬 讨论内容


## ✅ 决议事项
1. 

## 📋 待办事项
| 负责人 | 任务 | 截止日期 |
|--------|------|----------|
| | | |

## 📎 附件


`
  },
  {
    id: 'project',
    name: '项目管理',
    description: '项目规划、里程碑、任务分配模板',
    icon: '🚀',
    content: `# {{title}}

## 📋 项目概述
**项目状态：** 🟡 进行中  
**开始日期：**   
**预计结束：**   
**负责人：** 

## 🎯 项目目标
1. 
2. 

## 📊 里程碑
- [ ] 阶段一：需求分析
- [ ] 阶段二：设计开发
- [ ] 阶段三：测试上线

## 👥 团队成员
| 角色 | 姓名 | 职责 |
|------|------|------|
| 负责人 | | |
| 开发 | | |
| 测试 | | |

## 📈 进度追踪
\`\`\`
已完成: ████░░░░░░ 40%
\`\`\`

## 🐛 问题记录
1. 

## 📝 项目日志
### {{date}}
- 
`
  },
  {
    id: 'study',
    name: '学习笔记',
    description: '用于记录学习内容、知识要点',
    icon: '📚',
    content: `# {{title}}

## 📖 学习目标
- [ ] 理解核心概念
- [ ] 掌握基本用法
- [ ] 能够实际应用

## 🔑 核心概念


## 💡 关键知识点
### 1. 
### 2. 
### 3. 

## 📝 示例代码
\`\`\`javascript
// 示例代码
\`\`\`

## ❓ 疑问记录
1. 

## 🔗 相关资源
- 文档：
- 视频：
- 文章：

## 📌 实践练习
\`\`\`
练习内容：
预期结果：
\`\`\`
`
  },
  {
    id: 'book',
    name: '读书笔记',
    description: '用于记录阅读心得和书摘',
    icon: '📖',
    content: `# {{title}}

**作者：**   
**阅读日期：** {{date}}  
**阅读进度：** 第  页 / 共  页

## 📖 书籍信息
- 出版社：
- 出版年份：
- ISBN：

## 🎯 阅读目标


## 💬 精彩摘录
> ""

> ""

## 💡 核心观点
1. 
2. 
3. 

## 🤔 思考与感悟


## 📝 行动计划
- [ ] 将学到的知识应用到工作中
- [ ] 与他人分享这本书

## ⭐ 评分
🌟🌟🌟🌟🌟
`
  },
  {
    id: 'weekly',
    name: '周报',
    description: '周工作总结和下周计划',
    icon: '📊',
    content: `# 周报 - {{week}}

**日期范围：** {{date_start}} ~ {{date_end}}  
**姓名：** 

## 📋 本周工作总结

### ✅ 已完成
1. 
2. 

### 🔄 进行中
1. 

### 📌 下周计划
1. 

## 📊 数据统计
| 指标 | 本周 | 环比 |
|------|------|------|
| 任务完成数 | | |
| 有效工时 | | |

## ⚠️ 风险与问题
1. 

## 💡 改进建议
1. 
`
  }
]

// 获取格式化后的模板内容
export function getFormattedTemplate(templateId: string): string | null {
  const template = templates.find(t => t.id === templateId)
  if (!template) return null

  const now = new Date()
  const date = now.toLocaleDateString('zh-CN')
  const week = getWeekNumber(now)
  const monday = getMonday(now)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  return template.content
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{week\}\}/g, week)
    .replace(/\{\{date_start\}\}/g, monday.toLocaleDateString('zh-CN'))
    .replace(/\{\{date_end\}\}/g, sunday.toLocaleDateString('zh-CN'))
    .replace(/\{\{title\}\}/g, '')
}

function getWeekNumber(date: Date): string {
  const firstDay = new Date(date.getFullYear(), 0, 1)
  const pastDays = (date.getTime() - firstDay.getTime()) / 86400000
  return `${Math.ceil((pastDays + firstDay.getDay() + 1) / 7)}`
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}
