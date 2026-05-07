/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * AI 服务模块 - 通过 Cloudflare Worker 代理调用 DashScope API
 *
 * 架构：前端 → Worker（持有 API Key） → DashScope
 * - API Key 存在 Worker 环境变量中，前端完全看不到
 * - 无 CORS 问题，无配置页面
 */

// ═══════════════════════════════════════════════════════════
// Worker URL — 部署 Worker 后在这里填写你的地址
// ═══════════════════════════════════════════════════════════
const WORKER_URL = 'https://erp-ai-proxy.lh-jsus.workers.dev';

// 模型列表（按 DashScope 免费额度到期时间排序）
const MODEL_PRIORITY = [
  { model: 'qwen3-vl-flash-2026-01-22', expire: '2026-04-27' },
  { model: 'MiniMax-M2.1', expire: '2026-04-27' },
  { model: 'qwen-flash-character', expire: '2026-04-28' },
  { model: 'tongyi-xiaomi-analysis-flash', expire: '2026-04-28' },
  { model: 'tongyi-xiaomi-analysis-pro', expire: '2026-04-28' },
  { model: 'kimi-k2.5', expire: '2026-05-01' },
  { model: 'qwen3-coder-next', expire: '2026-05-05' },
  { model: 'glm-5', expire: '2026-05-18' },
  { model: 'qwen3.5-plus-2026-02-15', expire: '2026-05-18' },
  { model: 'qwen3.5-397b-a17b', expire: '2026-05-18' },
  { model: 'qwen3.5-122b-a10b', expire: '2026-05-25' },
  { model: 'qwen3.5-27b', expire: '2026-05-25' },
  { model: 'qwen3.5-35b-a3b', expire: '2026-05-25' },
  { model: 'qwen3.5-flash', expire: '2026-05-25' },
  { model: 'qwen3.5-flash-2026-02-23', expire: '2026-05-25' },
  { model: 'MiniMax-M2.5', expire: '2026-05-25' },
  { model: 'gui-plus-2026-02-26', expire: '2026-06-15' },
  { model: 'qwen3.6-plus', expire: '2026-07-02' },
  { model: 'qwen3.6-plus-2026-04-02', expire: '2026-07-02' },
  { model: 'glm-5.1', expire: '2026-07-14' },
  { model: 'qwen3.6-flash', expire: '2026-07-17' },
  { model: 'qwen3.6-flash-2026-04-16', expire: '2026-07-17' },
  { model: 'qwen3.6-35b-a3b', expire: '2026-07-17' },
  { model: 'qwen3.6-max-preview', expire: '2026-07-20' },
  { model: 'qwen-flash-character-2026-02-26', expire: '2026-05-30' },
];

let currentModelIndex = 0;
let failureHistory = {};

const AIService = {
  /**
   * 调用 AI 生成文档内容
   */
  async generateDocument(docType, context = {}, preferredModel = null, customPrompt = null) {
    if (!WORKER_URL) {
      throw new Error('AI 服务未配置。请联系管理员部署 Cloudflare Worker。');
    }

    const prompt = customPrompt || this.buildDocumentPrompt(docType, context);

    let availableEntries;
    if (preferredModel) {
      availableEntries = MODEL_PRIORITY.map(m => m).sort((a, b) => {
        return a.model === preferredModel ? -1 : b.model === preferredModel ? 1 : 0;
      });
    } else {
      availableEntries = MODEL_PRIORITY;
    }

    let lastError = null;
    for (let i = 0; i < availableEntries.length; i++) {
      const modelIndex = (currentModelIndex + i) % availableEntries.length;
      const model = availableEntries[modelIndex].model;

      try {
        const content = await this.callModel(model, prompt);
        currentModelIndex = modelIndex;
        return content;
      } catch (error) {
        lastError = error;
        failureHistory[model] = (failureHistory[model] || 0) + 1;
        console.warn(`模型 ${model} 调用失败，尝试下一个...`, error.message);

        if (i === availableEntries.length - 1) {
          throw new Error(`所有模型调用失败。最后错误：${lastError.message}`);
        }
      }
    }

    throw new Error('无法生成文档内容');
  },

  /**
   * 调用指定模型（通过 Worker 代理）
   */
  async callModel(model, prompt) {
    console.log(`[AIService] 调用模型: ${model} (via Worker)`);
    console.log(`[AIService] prompt 长度: ${prompt ? prompt.length : 0}`);

    if (window.location.protocol === 'file:') {
      throw new Error(`浏览器使用 file:// 协议打开，fetch 无法工作。请使用本地服务器访问。`);
    }

    const response = await fetch(WORKER_URL + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        max_tokens: 8192,
        messages: [
          {
            role: 'system',
            content: '你是一位专业的 SAP 实施顾问，擅长编写 ERP 项目文档。请根据用户要求生成专业、规范的文档内容。文档需要包含标准的文档头（文档编号、版本号、编制日期）、正文内容（使用 Markdown 格式，包含标题、表格、列表等）和签字栏。'
          },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 调用失败：HTTP ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    return content;
  },

  /**
   * 重新生成文档
   */
  async regenerateDocument(docId) {
    return await this.generateDocument(docId);
  },

  /**
   * 行业代码转文本
   */
  getIndustryText(code) {
    const map = {
      manufacturing: '制造业',
      finance: '金融',
      retail: '零售',
      pharma: '医药',
      energy: '能源',
      telecom: '通信',
      government: '政府',
      other: '其他'
    };
    return map[code] || code;
  },

  /**
   * 企业规模代码转文本
   */
  getCompanySizeText(code) {
    const map = {
      small: '小型（<100人）',
      medium: '中型（100-1000人）',
      large: '大型（1000-5000人）',
      enterprise: '超大型（5000+人）'
    };
    return map[code] || code;
  },

  /**
   * 构建文档生成 Prompt
   */
  buildDocumentPrompt(docType, context) {
    const project = context.project || {
      name: 'ERP SAP S4 HANA 实施项目',
      company: '模拟企业集团有限公司'
    };

    // 从 localStorage 读取当前项目的背景信息
    let background = {};
    try {
      const projectId = localStorage.getItem('erpSimulationCurrentProject');
      if (projectId) {
        const projects = JSON.parse(localStorage.getItem('erpSimulationProjects') || '[]');
        const currentProject = projects.find(p => p.id === projectId);
        if (currentProject && currentProject.background) {
          background = currentProject.background;
        }
      }
    } catch (e) {
      // 忽略错误
    }

    const bgText = background.industry || background.companySize || background.itLandscape || background.painPoints || background.goals || background.modules || background.orgStructure || background.milestones
      ? `\n\n## 项目背景信息（请据此个性化文档内容）\n` +
        (background.industry ? `- 行业类型：${this.getIndustryText(background.industry)}\n` : '') +
        (background.companySize ? `- 企业规模：${this.getCompanySizeText(background.companySize)}\n` : '') +
        (background.itLandscape ? `- 现有IT架构：${background.itLandscape}\n` : '') +
        (background.painPoints ? `- 企业痛点：${background.painPoints}\n` : '') +
        (background.goals ? `- 实施目标：${background.goals}\n` : '') +
        (background.modules ? `- SAP 模块范围：${background.modules}\n` : '') +
        (background.orgStructure ? `- 组织架构：${background.orgStructure}\n` : '') +
        (background.milestones ? `- 关键里程碑：${background.milestones}\n` : '')
      : '';

    const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompts = {
      'DOC-001': `请为${project.company}生成一份完整的《业务案例分析报告》。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-001-BC-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：执行摘要、业务痛点分析（至少 5 个痛点）、项目目标（业务目标和技术目标）、预期收益（用表格展示）、建议与结论
3. 文档尾包含编制人、审核人、批准人签字栏
4. 使用专业、正式的商务文档语言
5. 适当使用表格和列表使文档结构清晰
6. 请根据上方项目背景信息，生成贴合实际业务场景的内容

请用 Markdown 格式输出。`,

      'DOC-005': `请为${project.company}的"${project.name}"生成一份完整的《项目章程》(Project Charter)。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-005-PC-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 项目基本信息（项目名称、编号、发起人、经理、计划日期）
   - 项目背景
   - 项目目标（使用 SMART 原则，包括业务目标和技术目标）
   - 项目范围（组织范围、模块范围 FI/CO/MM/SD/PP、排除范围）
   - 项目组织（用表格列出各角色职责）
   - 关键里程碑（项目启动、蓝图确认、系统就绪、上线切换、项目验收）
   - 预算概算
   - 审批签字栏
3. 使用专业、正式的商务文档语言
4. 适当使用表格使文档结构清晰
5. 请根据上方项目背景信息，生成贴合实际业务场景的内容

请用 Markdown 格式输出。`,

      'DOC-007': `请为${project.company}生成一份完整的《项目主计划》(Project Master Plan)。

${bgText}

## 文档说明

项目主计划是 SAP S/4HANA 实施项目的核心项目管理文档，用于统筹整个项目的阶段划分、时间规划、资源配置和关键里程碑。它是项目经理和 PMO 管理项目进度的基准文件，也是指导委员会审批项目计划的重要依据。

## 文档结构要求

### 1. 文档头
- 文档编号：DOC-007-PMP-001
- 版本号：V1.0
- 编制日期：${date}
- 密级：机密
- 适用项目：SAP S/4HANA 实施项目

### 2. 修订记录表
包含版本、修订日期、修订人、修订内容的表格。

### 3. 项目总体计划（高层时间线）
用表格列出 SAP ACTIVATE 方法论的 6 个阶段，每行包含：阶段名称、开始日期、结束日期、工期（天）、关键交付物、阶段负责人。

| 阶段 | 日期范围 | 工期 | 关键交付物 |
|------|---------|------|-----------|
| Discover | ... | ... | 业务案例、项目章程 |
| Prepare | ... | ... | 项目主计划、项目团队 |
| Explore | ... | ... | 业务蓝图 |
| Realize | ... | ... | 配置完成的系统、测试报告 |
| Deploy | ... | ... | 上线系统、用户手册 |
| Run | ... | ... | 运维报告 |

### 4. Design Workshop（蓝图研讨会）计划
用表格列出各 SAP 模块的研讨会安排，包含：模块、研讨会名称、起止日期、持续时间、参与部门/角色、 facilitator（引导顾问）、产出物。

### 5. 数据迁移计划
用表格列出各类主数据的迁移时间节点，包含：数据类型（物料主数据、客户主数据、供应商主数据、BOM、工艺路线、库存期初余额、财务期初余额等）、数据量级评估、清洗开始日期、清洗完成日期、导入测试日期、正式导入日期、负责人。

### 6. 开发计划（RICEF 开发）
用表格列出报表（Reports）、表单（Forms）、接口（Interfaces）、增强（Enhancements）、转换（Conversions）的开发周期，包含：开发项名称、所属模块、开发工作量（人天）、开始日期、完成日期、开发人、状态。假设总开发量约 20-30 个 RICEF 项。

### 7. 系统配置计划
用表格列出各 SAP 模块的配置工作安排，包含：模块、配置任务、工作量（人天）、开始日期、完成日期、配置顾问、业务确认人。

### 8. 测试计划
用表格列出测试活动的安排，包含：测试类型（单元测试、集成测试、UAT、性能测试、切换演练）、测试轮次、开始日期、结束日期、参与人数、测试用例数、预期通过率。

### 9. 关键里程碑
用表格列出项目的 10-15 个关键里程碑节点，包含：里程碑名称、计划日期、完成标准、责任方。

### 10. 资源需求汇总
用表格列出各阶段的人力资源配置，包含：角色（项目经理、业务顾问、技术顾问、关键用户、最终用户）、各阶段投入人数、总人天数。

### 11. 风险与假设
列出项目实施的主要前提假设和已识别风险。

## 输出要求
1. 使用 Markdown 格式输出
2. 所有计划内容使用表格展示
3. 项目周期假设为 2026 年 5 月至 2027 年 6 月（约 13 个月）
4. 日期要合理、有逻辑性（后续阶段必须在前面阶段完成之后）
5. 使用专业的项目管理术语（WBS、里程碑、关键路径等）
6. 请根据上方项目背景信息（模块范围、组织架构、行业特点）定制计划内容
7. 文档尾包含编制人、审核人、批准人签字栏`,

      'DOC-010': `请为${project.company}生成一份完整的《变更管理流程》(Change Management Process)。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-010-CMP-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 变更管理组织（CCB 成员及职责）
   - 变更管理流程图（用文字描述流程步骤）
   - 变更请求单 (CR) 模板
   - 变更优先级定义（P1-P4 及响应时限）
   - 变更升级机制
3. 包含一个完整的变更请求单模板表格
4. 使用专业的项目管理术语
5. 请根据上方项目背景信息（组织架构）定制变更管理组织

请用 Markdown 格式输出。`,

      'DOC-014': `请为${project.company}生成一份完整的《Fit-Gap 差异分析报告》。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-014-FG-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 分析概述（目的、范围、方法）
   - 差异汇总表格（流程、需求、SAP 标准功能、差异程度、解决方案）
   - 各模块详细差异分析（FI、CO、MM、SD、PP）
   - 差异解决策略（标准功能、配置、增强开发、第三方）
   - 风险与建议
3. 至少包含 10 个具体的差异项
4. 使用专业的 SAP 实施术语
5. 请根据上方项目背景信息（现有IT架构、SAP模块范围）定制差异分析内容

请用 Markdown 格式输出。`,

      'DOC-021': `请为${project.company}生成一份完整的《集成测试报告》。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-021-IT-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 测试概述（目的、范围、时间、参与人）
   - 测试环境说明
   - 测试执行情况汇总
   - 各流程测试结果（采购到付款、销售到收款、计划到生产、财务到报表）
   - 缺陷汇总与分析
   - 测试结论与建议
3. 包含详细的测试用例执行表格
4. 假设测试用例总数约 100 个，通过率 95%
5. 请根据上方项目背景信息（SAP模块范围）定制测试内容

请用 Markdown 格式输出。`,

      'DOC-025': `请为${project.company}生成一份《用户操作手册》大纲。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-025-UM-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 手册说明（目的、适用范围、读者对象）
   - 系统登录与界面介绍
   - 各模块常用操作（FI 财务、MM 采购、SD 销售、库存管理）
   - 常见问题解答 (FAQ)
   - 附录（术语表、快捷键）
3. 每个操作包含：操作步骤、截图说明（用文字描述）、注意事项
4. 语言简洁易懂，适合最终用户阅读
5. 请根据上方项目背景信息（组织架构、SAP模块范围）定制操作内容

请用 Markdown 格式输出。`,

      'DOC-019': `请为${project.company}生成一份完整的《数据迁移方案》(Data Migration Strategy)。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-019-DMS-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 数据迁移概述（目标、范围、策略）
   - 数据迁移组织架构与职责
   - 数据迁移方法论（ETL 流程）
   - 数据迁移工具选型（对比分析）
   - 数据迁移详细计划（时间表）
   - 数据清洗规则与策略
   - 数据校验方法
   - 风险评估与应对措施
   - 回退方案
3. 包含数据迁移程序代码示例（Python 或 ABAP 风格）
4. 引用专业 ETL 工具作为参考（如 Syniti Data Migration、SAP BODS、Informatica 等）
5. 请根据上方项目背景信息（现有 IT 架构、SAP 模块范围）定制迁移方案

## 数据迁移程序代码示例要求

请提供以下类型的代码示例（至少 2 个）：

### 示例 1: Python 数据清洗脚本
展示如何使用 Python pandas 进行数据清洗，包括：
- 读取 Excel/CSV 源数据
- 数据类型转换
- 空值处理
- 重复数据删除
- 数据格式标准化
- 数据校验规则
- 导出清洗后的数据

### 示例 2: ABAP 数据导入程序
展示如何使用 ABAP BAPI 或 LSMW 进行数据导入，包括：
- 数据读取
- 数据格式转换
- 调用 BAPI 导入
- 错误处理与日志记录
- 导入结果反馈

### 示例 3: SQL 数据转换脚本（可选）
展示如何使用 SQL 进行数据转换和校验。

## 数据清洗规则示例要求

请提供至少 10 条具体的数据清洗规则，例如：
- 物料编码格式校验（去除空格、统一大小写）
- 客户/供应商税号格式验证
- 日期格式标准化（YYYY-MM-DD）
- 数值型字段范围检查
- 必填字段完整性检查
- 数据一致性校验（如 BOM 子件数量不能为负）

## 数据质量检查表要求

请提供数据质量检查清单模板，包含：
- 完整性检查（记录数、必填字段）
- 准确性检查（数据格式、业务规则）
- 一致性检查（跨表校验、逻辑关系）
- 唯一性检查（主键、业务键）
- 及时性检查（数据时效性）

请用 Markdown 格式输出，所有代码示例使用代码块包裹。`,

      'DOC-026': `请为${project.company}生成一份完整的《主数据导入清单与校验报告》(Master Data Import Checklist & Validation Report)。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-026-MDIC-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 主数据导入概述（目标、范围）
   - 主数据分类清单
   - 数据导入前准备检查清单
   - 数据导入执行记录
   - 数据校验结果汇总
   - 问题数据清单与处理跟踪
   - 数据质量评估
   - 签字确认栏
3. 包含详细的主数据导入清单表格
4. 包含数据校验报告和问题跟踪表
5. 请根据上方项目背景信息（SAP 模块范围、组织架构）定制导入清单

## 主数据分类清单要求

请用表格列出各类主数据，包含以下列：
- 数据类型（物料主数据、客户主数据、供应商主数据、BOM、工艺路线、工作中心、会计科目、成本中心、利润中心、库存期初、财务期初等）
- 所属模块（MM/SD/FI/CO/PP）
- 数据量级评估（条数）
- 数据来源系统
- 责任部门
- 责任人
- 计划导入日期
- 实际导入日期
- 导入状态

## 数据导入前准备检查清单要求

请用检查表形式列出，包含：
- [ ] 数据模板已下发至业务部门
- [ ] 数据收集完成
- [ ] 数据清洗完成
- [ ] 数据校验通过
- [ ] 导入程序已测试
- [ ] 导入环境已准备
- [ ] 相关人员已培训
- [ ] 应急预案已制定

## 数据校验结果汇总要求

请用表格展示，包含：
- 数据类型
- 应导入数量
- 实际导入数量
- 成功数量
- 失败数量
- 成功率
- 主要失败原因
- 处理状态

## 问题数据跟踪表要求

请用表格列出问题数据，包含：
- 序号
- 数据类型
- 问题描述
- 影响记录数
- 根本原因
- 处理方案
- 责任人
- 计划解决日期
- 实际解决日期
- 状态（待处理/处理中/已解决）

## 数据质量评估要求

请提供数据质量评分卡，包含以下维度：
- 完整性得分（%）
- 准确性得分（%）
- 一致性得分（%）
- 唯一性得分（%）
- 及时性得分（%）
- 综合质量得分

请用 Markdown 格式输出，所有表格使用标准 Markdown 表格格式。`,

      'DOC-028': `请为${project.company}生成一份完整的《上线切换执行方案》。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-028-CS-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 切换策略（大爆炸/分步/并行）
   - 切换组织与职责
   - 切换前准备条件
   - 详细切换时间表（精确到小时，T-2 到 T+7）
   - 数据迁移步骤
   - 切换检查清单
   - 上线后支持安排
3. 切换时间假设安排在 2027 年 4 月 1 日 -7 日假期
4. 包含详细的任务分解和时间节点
5. 请根据上方项目背景信息（组织架构、关键里程碑）定制切换方案

请用 Markdown 格式输出。`,

      'DOC-029': `请为${project.company}生成一份完整的《上线应急预案》(Contingency Plan)。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-029-EP-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 应急组织架构（指挥部、技术组、业务组）
   - 应急联系方式
   - 风险场景与应对措施（至少 10 个场景）
   - 回退条件和决策流程
   - 回退步骤详解
   - 演练计划
3. 风险场景包括：系统无法登录、数据错误、功能异常、性能问题等
4. 明确各项应急措施的责任人和响应时间
5. 请根据上方项目背景信息（现有IT架构、组织架构）定制应急预案

请用 Markdown 格式输出。`,

      'DOC-035': `请为${project.company}生成一份完整的《项目总结报告》。
${bgText}
要求：
1. 文档头包含：文档编号 (DOC-035-PS-001)、版本号 (V1.0)、编制日期 (${date})
2. 内容包括：
   - 项目回顾（时间线、里程碑）
   - 项目目标达成情况
   - 项目交付物清单
   - 预算执行情况
   - 成功经验总结
   - 教训与改进建议
   - 后续运维建议
   - 持续改进路线图
3. 假设项目周期为 2026 年 5 月至 2027 年 4 月
4. 包含客观、真实的项目反思
5. 请根据上方项目背景信息（实施目标、关键里程碑）定制总结内容

请用 Markdown 格式输出。`
    };

    return prompts[docType] || prompts['DOC-005'];
  },

  /**
   * 获取模型优先级列表
   */
  getModelPriority() {
    return MODEL_PRIORITY;
  },

  /**
   * 获取当前模型索引
   */
  getCurrentModelIndex() {
    return currentModelIndex;
  },

  /**
   * 设置当前模型索引
   */
  setCurrentModelIndex(index) {
    currentModelIndex = index;
  },

  /**
   * 获取失败历史
   */
  getFailureHistory() {
    return failureHistory;
  },

  /**
   * 清除失败历史
   */
  clearFailureHistory() {
    failureHistory = {};
  }
};

// AI 文档生成器（供 app.js 调用）
window.AIDocumentGenerator = {
  async generate(docId, context, customPrompt) {
    return await AIService.generateDocument(docId, context, null, customPrompt);
  },

  async regenerate(docId) {
    return await AIService.regenerateDocument(docId);
  },

  getModelPriority() {
    return AIService.getModelPriority();
  },

  getCurrentModelIndex() {
    return AIService.getCurrentModelIndex();
  },

  setCurrentModelIndex(index) {
    AIService.setCurrentModelIndex(index);
  },

  getFailureHistory() {
    return AIService.getFailureHistory();
  },

  clearFailureHistory() {
    AIService.clearFailureHistory();
  }
};

console.log('AI Service loaded (Worker proxy mode)');
