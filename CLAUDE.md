# WildVoice Project - AI Assistant Instructions

## 📖 项目背景
在开始任何工作前，请先阅读 [product.md](product.md) 了解完整的产品功能、技术架构和开发路线图。

## 🔧 技术栈核心要点
- **运行环境**: Cloudflare Workers (Edge Runtime)
- **框架**: Next.js 15 (App Router)
- **数据库**: Cloudflare D1 + Drizzle ORM
- **文件存储**: Cloudflare R2
- **认证**: Better Auth (已完成)
- **AI 服务**: FAL AI (TTS, STT, Voice Cloning)

## 📋 工作原则
1. **模块化开发**: 所有功能模块放在 `src/modules/` 下
2. **优先使用 Server Components**: 减少客户端 JS
3. **遵循现有代码风格**: 参考 `src/modules/auth/` 和 `src/modules/todos/`
4. **第三方库查询**: 当使用第三方库方法时，使用 context7 的 MCP 搜索最新最准确的用法
5. **类型定义规范**:
   - 引用已定义的 schema 类型，不要自己定义重复的类型
   - 使用 Drizzle schema 的类型推断: `type Voice = typeof voicesSchema.$inferSelect`
   - 对于第三方库，引用其导出的类型
   - 避免手动创建重复的 interface
6. **样式规范**:
   - 使用默认的主题颜色，不要硬编码颜色值
   - 使用 shadcn/ui 的语义化 token: `bg-muted`, `text-muted-foreground`, `bg-accent` 等
   - 保持代码简洁，避免过度自定义样式
7. **优先使用 Server Actions**:
   - 对于数据提交操作，优先使用 Server Actions 而非 API Routes
   - Server Actions 放在 `src/app/actions/` 目录下

## 🎯 当前开发阶段
**Phase 1 & 3: Voice Library + TTS (已完成)**
- ✅ 语音库数据库设计和 API
- ✅ TTS 功能与 FAL AI 集成
- ✅ R2 存储集成
- ✅ Dashboard 前端页面(简化版)

**进行中: 前端功能完善**
- 正在实现 TTS/STT Dashboard 页面
- 使用 Server Actions 和简化的样式系统

## ⚠️ 重要提醒
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User
- **除非用户明确要求帮忙写代码，否则只提供指导和解决方案**

@agents.md