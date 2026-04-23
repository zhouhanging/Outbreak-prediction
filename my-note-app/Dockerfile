# Node.js 应用基础镜像
FROM node:20-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装依赖阶段
FROM base AS deps

# 安装构建工具
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 安装开发依赖
RUN npm ci

# 构建阶段
FROM deps AS builder

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner

# 安装运行时依赖
RUN apk add --no-cache \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    chromium \
    chromium-chromedriver

# 设置环境变量
ENV NODE_ENV=production
ENV DISPLAY=:0

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S electron -u 1001

# 创建数据目录
RUN mkdir -p /app/data && \
    chown -R electron:nodejs /app

# 复制构建产物
COPY --from=builder /app/out /app/out
COPY --from=builder /app/package*.json /app/

# 设置工作目录
WORKDIR /app

# 切换到非 root 用户
USER electron

# 暴露端口（如果有需要远程访问的情况）
EXPOSE 9222

# 启动应用
CMD ["sh", "-c", "npm run start:prod"]
