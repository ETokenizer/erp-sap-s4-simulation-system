# CLAUDE.md - Coding Behavior Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# ERP SAP S4 HANA 上线模拟演练系统 - 项目状态

## 项目概述
企业级项目仓库化管理平台 - 基于 SAP ACTIVATE 方法论的策略模拟游戏 (SLG) 系统

## 技术架构
- **前端**: HTML5 + CSS3 + JavaScript ES6 (原生开发，零框架依赖)
- **数据存储**: localStorage + IndexedDB
- **AI 集成**: 阿里云通义千问 API

## 文件结构
```
erp-sap-s4-simulation-system/
├── login.html                      # 登录页面
├── project-list.html               # 项目列表页面
├── index.html                      # 项目空间（主页面）
├── config/
│   └── ai-config.html              # AI 配置页面
├── data/
│   └── game-data.json              # 游戏数据（6 章节、任务、文档）
├── scripts/
│   ├── app.js                      # 主应用逻辑
│   ├── data.js                     # 数据管理模块（内嵌 6 章节数据）
│   ├── document-generator.js       # 文档生成器（37 种模板）
│   ├── ai-service.js               # AI 服务集成
│   ├── markdown-renderer.js        # Markdown 渲染引擎
│   ├── project-manager.js          # 项目管理模块
│   ├── project-app.js              # 项目应用逻辑
│   └── document-file-store.js      # IndexedDB 文档存储
├── styles/
│   ├── main.css                    # 主样式（企业蓝）
│   ├── themes.css                  # 主题切换（3 种）
│   └── project-styles.css          # 项目仓库样式
├── DEVELOPMENT_PLAN.md             # 开发计划
├── README.md                       # 完整文档
├── QUICKSTART.md                   # 快速开始指南
└── CLAUDE.md                       # 本文件
```

## 核心功能状态

### ✅ 已完成功能

| 模块 | 功能 | 状态 |
|------|------|------|
| 用户系统 | 模拟登录 | ✅ |
| 项目管理 | 创建/编辑/删除项目 | ✅ |
| 项目管理 | 项目克隆 | ✅ |
| 项目管理 | 项目导出/导入 | ✅ |
| 游戏系统 | 6 大章节 (SAP ACTIVATE) | ✅ |
| 游戏系统 | 任务完成/进度追踪 | ✅ |
| 游戏系统 | 任务重置 | ✅ |
| 游戏系统 | 章节解锁机制 | ✅ |
| 文档系统 | 37 种文档模板生成 | ✅ |
| 文档系统 | 文档预览/复制/导出 | ✅ |
| 文档系统 | 项目目录自动归档 | ✅ |
| 文档系统 | IndexedDB 持久化 | ✅ |
| AI 集成 | AI 配置页面 | ✅ |
| AI 集成 | AI 文档生成 | ✅ |
| UI 功能 | 3 种主题切换 | ✅ |
| UI 功能 | 变更管理模拟 | ✅ |
| Markdown | 专业渲染引擎 | ✅ |

### 6 大章节内容

| 章节 | SAP ACTIVATE 阶段 | 任务数 | 文档数 |
|------|------------------|--------|--------|
| Ch.1 | Discover | 5 | 5 |
| Ch.2 | Prepare | 6 | 6 |
| Ch.3 | Explore | 6 | 5 |
| Ch.4 | Realize | 8 | 6 |
| Ch.5 | Deploy | 8 | 8 |
| Ch.6 | Run | 6 | 7 |
| **总计** | | **39 任务** | **37 文档** |

## 开发历史

### Phase 1: 基础框架 ✅
- [x] 创建项目目录
- [x] 完成 index.html 基础结构
- [x] 完成 main.css 样式
- [x] 完成 game-data.json 数据定义
- [x] 实现章节切换功能

### Phase 2: 核心功能 ✅
- [x] 实现任务状态管理
- [x] 实现文档生成器基础版
- [x] 实现文档预览模态框
- [x] 实现进度追踪

### Phase 3: 文档系统 ✅
- [x] 完成 37 种文档模板
- [x] 实现文档导出功能
- [x] 添加示例数据填充

### Phase 4: AI 集成 ✅
- [x] 实现 AI 配置页面
- [x] 实现 AI 调用逻辑
- [x] 测试 AI 生成功能

### Phase 5: 优化发布 ✅
- [x] UI/UX 优化
- [x] 响应式适配
- [x] 性能优化
- [x] 项目仓库化改造

### Phase 6: Bug 修复 ✅
- [x] AI 文档标题修复（使用实际文档名）
- [x] 任务-文档映射修复（DOC-001/002/003/004 不再共用）
- [x] Markdown 表格串行修复（删除自定义解析，使用 MarkdownRenderer）
- [x] 文档持久化（IndexedDB，刷新不丢失）
- [x] 项目间数据隔离（每个项目独立 gameState）
- [x] 导出/复制按钮修复
- [x] 任务重置功能

## 运行方式

### 本地服务器
```bash
# 方式 1: Python
python -m http.server 8080

# 方式 2: Node.js
npx http-server -p 8080
```

然后访问：`http://localhost:8080/login.html`

## 下一步改进建议

### 功能增强
- [ ] 添加更多变更事件场景
- [ ] 实现多人协作模式
- [ ] 添加项目数据统计面板
- [ ] 实现文档版本历史

### 技术优化
- [ ] 添加单元测试
- [ ] 实现 PWA 离线支持
- [ ] 优化移动端体验
- [ ] 添加数据同步功能

### 内容扩展
- [ ] 增加更多行业模板
- [ ] 添加视频教程
- [ ] 实现案例库功能

## 关键技术实现

### 数据存储设计
```javascript
// 项目列表
localStorage.setItem('erpSimulationProjects', JSON.stringify(projects));

// 单个项目数据（项目隔离）
localStorage.setItem(`erp_project_${projectId}`, JSON.stringify({
  project: { folders, files, fileIndex },
  gameState: { currentChapter, tasks, documents, ... }
}));

// 当前选中项目
localStorage.setItem('erpSimulationCurrentProject', projectId);

// AI 配置
localStorage.setItem('erpSimulationAIConfig', JSON.stringify(config));
```

### 文档持久化（IndexedDB）
```javascript
// key 格式: ${projectId}__${docId}
DocumentFileStore.save(projectId, docId, content);
DocumentFileStore.load(projectId, docId);
DocumentFileStore.remove(projectId, docId);
DocumentFileStore.listByProject(projectId);
```

### 文档生成流程
```
任务完成 → DocumentGenerator.generate(docId) → Markdown 文档
                                ↓
                    MarkdownRenderer.renderFullDocument() → 预览显示
                                ↓
                    IndexedDB.save(projectId, docId, content) → 持久化
                                ↓
                    ProjectManager.addFile() → localStorage 仓库
```

### 项目数据隔离
- 每个项目使用 `erp_project_${projectId}` 独立存储
- gameState 从项目专属键加载和保存
- IndexedDB 文档按 projectId 隔离
- 克隆项目时深度克隆并重置 gameState

## 版本信息
- **当前版本**: 2.1 (项目隔离版)
- **创建日期**: 2026-04-20
- **最后更新**: 2026-04-23
- **开发状态**: 核心功能完成，持续优化中
