# WildVoice 产品文档

## 📋 产品概述

WildVoice 是一个基于 AI 的语音克隆和转换平台，提供文字转语音（TTS）、语音转文字（STT）和声音克隆功能。

**核心价值主张**: Talk. Transform. Clone.

---

## 🎯 核心功能

### 1. Text to Speech (文字转语音)
- 用户输入文本
- 从 Voice Library 选择目标声音
- 生成对应声音的语音文件
- 支持下载和播放

### 2. Speech to Text (语音转文字)
- 录制或上传音频
- 转换为文字
- 显示转录结果

### 3. Voice Cloning (声音克隆)
- 用户上传音频样本（3-10秒）
- 通过 FAL AI 训练声音模型
- 生成可复用的声音 ID
- 保存到个人 Voice Library

### 4. Voice Library (声音库管理)
- **公共声音库**: 所有用户共享的名人声音（如 Donald Trump, Elon Musk 等）
- **私有声音库**: 每个用户自己克隆的声音
- 支持评分、分类、搜索
- 显示声音详情（名称、类别、评分）

### 5. Recent Outputs (历史记录)
- 保存用户生成的所有语音
- 显示生成时间、使用的声音、时长
- 支持播放和下载
- 区分 TTS 和 STT 记录

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 15 (App Router)
- **UI 组件**: Radix UI + Tailwind CSS 4
- **表单管理**: React Hook Form + Zod
- **状态管理**: React Context / Server Components
- **图标**: Lucide React
- **Toast 通知**: React Hot Toast

### 后端技术栈
- **运行时**: Cloudflare Workers (Edge Runtime)
- **适配器**: @opennextjs/cloudflare
- **数据库 ORM**: Drizzle ORM
- **认证**: Better Auth
- **AI SDK**: 将使用 Vercel AI SDK (待集成)

### 基础设施（Cloudflare）
- **计算**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **文件存储**: Cloudflare R2
- **AI 推理**: Cloudflare AI (可选，目前计划用 FAL AI)

### 第三方服务
- **FAL AI**:
  - TTS 模型: `fal-ai/...` (待确认具体模型)
  - STT 模型: `fal-ai/...` (待确认具体模型)
  - Voice Cloning: `fal-ai/...` (待确认具体模型)

---

## 🗄️ 数据库设计

### 核心表结构

#### 1. users (用户表)
- 已存在 (Better Auth 自动创建)
- 字段: id, email, name, createdAt, etc.

#### 2. voices (声音库表)
```sql
CREATE TABLE voices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,              -- 声音名称
  category TEXT NOT NULL,          -- 分类 (Celebrity, Custom, etc.)
  rating REAL DEFAULT 0,           -- 评分 (0-5)
  is_public BOOLEAN DEFAULT 0,     -- 是否公开
  user_id TEXT,                    -- 所属用户 (NULL = 公共声音)
  fal_voice_id TEXT,               -- FAL AI 的 voice ID
  sample_audio_url TEXT,           -- 样本音频 URL (R2)
  created_at INTEGER NOT NULL,     -- 创建时间
  updated_at INTEGER NOT NULL,     -- 更新时间
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 3. outputs (生成记录表)
```sql
CREATE TABLE outputs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,           -- 所属用户
  type TEXT NOT NULL,              -- 类型: 'TTS' | 'STT'
  voice_id TEXT,                   -- 使用的声音 (仅 TTS)
  input_text TEXT,                 -- 输入文本 (TTS) 或转录结果 (STT)
  audio_url TEXT,                  -- 音频文件 URL (R2)
  duration INTEGER,                -- 音频时长 (秒)
  created_at INTEGER NOT NULL,     -- 创建时间
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (voice_id) REFERENCES voices(id)
);
```

---

## 📁 项目结构

```
wild-voice/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # 认证相关页面
│   │   ├── dashboard/           # 主应用页面
│   │   │   ├── tts/            # Text to Speech 页面 (待创建)
│   │   │   ├── stt/            # Speech to Text 页面 (待创建)
│   │   │   └── voices/         # Voice Library 管理 (待创建)
│   │   └── api/                # API Routes
│   │       ├── voices/         # Voice Library API (待创建)
│   │       ├── tts/            # TTS API (待创建)
│   │       ├── stt/            # STT API (待创建)
│   │       └── clone/          # Voice Cloning API (待创建)
│   │
│   ├── modules/                 # 功能模块
│   │   ├── auth/               # 认证模块 (已存在)
│   │   ├── voices/             # 语音库模块 (待创建)
│   │   ├── tts/                # TTS 模块 (待创建)
│   │   ├── stt/                # STT 模块 (待创建)
│   │   └── outputs/            # 输出历史模块 (待创建)
│   │
│   ├── components/              # 共享组件
│   │   ├── ui/                 # UI 基础组件 (Radix)
│   │   └── ...                 # 业务组件
│   │
│   ├── db/                      # 数据库
│   │   ├── schema.ts           # Schema 导出
│   │   └── index.ts            # Drizzle 实例
│   │
│   ├── drizzle/                 # 数据库迁移文件
│   └── lib/                     # 工具函数
│
├── public/                      # 静态资源
├── product.md                   # 本文档
├── CLAUDE.md                    # AI 助手指令
└── package.json
```

---

## 🔄 开发流程

### 开发环境启动
```bash
# 本地开发 (不连接 Cloudflare)
pnpm dev

# Cloudflare Workers 本地开发
pnpm dev:cf

# Cloudflare Workers 远程开发
pnpm dev:remote
```

### 数据库操作
```bash
# 生成 migration
pnpm db:generate

# 应用 migration (本地)
pnpm db:migrate:local

# 应用 migration (生产)
pnpm db:migrate:prod

# 打开 Drizzle Studio
pnpm db:studio
```

### 部署
```bash
# 部署到生产环境
pnpm deploy

# 部署到预览环境
pnpm deploy:preview
```

---

## 🎨 UI/UX 设计规范

### 颜色主题
- **主色**: 紫色渐变 (#7C3AED → #3B82F6)
- **背景**: 浅灰色 (#F5F5F7)
- **卡片**: 白色 + 轻微阴影
- **高亮选中**: 紫色边框

### 组件设计
- **Voice Card**: 圆角卡片 + 评分星标 + 分类标签
- **Recording Button**: 大圆形按钮 + 麦克风图标
- **Output Item**: 带播放/下载按钮的列表项

---

## 🚀 开发路线图

### Phase 1: Voice Library 管理 ✅ (当前阶段)
- [ ] 设计数据库 schema
- [ ] 创建 Voice CRUD API
- [ ] 实现 Voice Library UI
- [ ] 集成 R2 文件上传

### Phase 2: Voice Cloning
- [ ] 集成 FAL AI Cloning API
- [ ] 实现音频上传功能
- [ ] 创建声音训练流程
- [ ] 保存克隆的声音到 Library

### Phase 3: Text to Speech
- [ ] 集成 FAL AI TTS API
- [ ] 创建 TTS UI 界面
- [ ] 实现语音生成
- [ ] 保存到 Outputs

### Phase 4: Speech to Text
- [ ] 集成 FAL AI STT API
- [ ] 实现录音功能
- [ ] 创建 STT UI 界面
- [ ] 保存转录结果

### Phase 5: 优化和完善
- [ ] 添加分页和搜索
- [ ] 优化性能和缓存
- [ ] 添加错误处理
- [ ] 完善用户体验

---

## 🔐 环境变量

```bash
# Cloudflare (已配置)
CLOUDFLARE_API_TOKEN=xxx

# Database (已配置)
DATABASE_ID=852e3b88-4429-40df-adde-063bc94d583f

# R2 Bucket (已配置)
R2_BUCKET=wild-voice-files

# FAL AI (待配置)
FAL_KEY=xxx

# Better Auth (待确认)
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=xxx
```

---

## 📚 参考文档

- [Next.js 15 文档](https://nextjs.org/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [FAL AI 文档](https://fal.ai/docs)
- [Better Auth 文档](https://www.better-auth.com/)

---

## 💡 AI 助手须知

当你与 AI 助手协作开发时，助手应该了解：

1. **项目使用 Cloudflare Workers**，不是传统 Node.js 环境
2. **数据库是 Cloudflare D1 (SQLite)**，使用 Drizzle ORM
3. **文件存储使用 R2**，不是本地文件系统
4. **认证系统已经完成**，使用 Better Auth
5. **项目采用模块化设计**，每个功能独立在 `src/modules/` 下
6. **使用 Server Components 优先**，减少客户端 JavaScript
7. **遵循 Next.js 15 最佳实践**

---

_最后更新: 2025-10-04_
