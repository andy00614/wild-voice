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

## 🎯 当前开发阶段
**Phase 1: Voice Library 管理**
- 正在学习如何实现语音库的数据库设计和 CRUD 功能
- 用户处于学习模式，优先提供指导而非直接编写代码

## ⚠️ 重要提醒
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User
- **除非用户明确要求帮忙写代码，否则只提供指导和解决方案**
