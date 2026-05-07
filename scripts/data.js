/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 数据模块 - 负责加载和管理游戏数据
 */

// 全局游戏数据
let gameData = null;
let gameState = null;

// 内嵌游戏数据（避免 file://协议下 fetch 失败）
const EMBEDDED_GAME_DATA = {
  "project": {
    "name": "ERP SAP S4 HANA 上线模拟演练系统",
    "version": "1.0",
    "company": "模拟企业集团有限公司"
  },
  "chapters": [
    {
      "id": "ch1",
      "name": "战略发现与立项",
      "activatePhase": "Discover",
      "description": "明确业务案例，评估可行性，做出立项决策",
      "icon": "🔍",
      "locked": false,
      "prerequisite": null,
      "tools": [
        { "name": "PowerPoint", "usage": "立项汇报与供应商对比", "icon": "📽️" },
        { "name": "Word", "usage": "项目章程与可研报告", "icon": "📝" },
        { "name": "Excel", "usage": "ROI 分析与 TCO 测算", "icon": "📈" }
      ],
      "tasks": [
        { "id": "ch1-t1", "name": "业务痛点分析", "description": "调研企业当前业务痛点，明确为什么要上 SAP", "status": "pending", "estimatedHours": 8, "riskLevel": "low", "documentType": "DOC-001", "changeTrigger": false },
        { "id": "ch1-t2", "name": "可行性研究", "description": "评估技术、经济、运营可行性", "status": "pending", "estimatedHours": 16, "riskLevel": "medium", "documentType": "DOC-002", "changeTrigger": false },
        { "id": "ch1-t3", "name": "供应商选型评估", "description": "对比 SAP 与其他 ERP 供应商，做出选型决策", "status": "pending", "estimatedHours": 24, "riskLevel": "high", "documentType": "DOC-003", "changeTrigger": false },
        { "id": "ch1-t4", "name": "投资回报分析 (ROI)", "description": "计算项目投资回报率，包括 TCO 和收益预测", "status": "pending", "estimatedHours": 12, "riskLevel": "medium", "documentType": "DOC-004", "changeTrigger": false },
        { "id": "ch1-t5", "name": "项目章程审批", "description": "编写项目章程并获得高层签字批准", "status": "pending", "estimatedHours": 8, "riskLevel": "low", "documentType": "DOC-005", "changeTrigger": false }
      ],
      "documents": [
        { "id": "DOC-001", "name": "业务案例分析报告", "status": "pending" },
        { "id": "DOC-002", "name": "可行性研究报告", "status": "pending" },
        { "id": "DOC-003", "name": "供应商选型评估报告", "status": "pending" },
        { "id": "DOC-004", "name": "ROI 分析报告", "status": "pending" },
        { "id": "DOC-005", "name": "项目章程", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "高层意见不一致", "description": "项目发起人之间对范围有分歧", "impact": "进度延迟 2 周" },
        { "title": "预算被削减", "description": "财务部门要求削减 20% 预算", "impact": "需要重新评估范围" }
      ]
    },
    {
      "id": "ch2",
      "name": "项目准备与计划",
      "activatePhase": "Prepare",
      "description": "建立项目组织，制定详细计划，召开启动会",
      "icon": "📋",
      "locked": true,
      "prerequisite": "ch1",
      "tools": [
        { "name": "MS Project", "usage": "项目主计划", "icon": "📅" },
        { "name": "PowerPoint", "usage": "启动会材料", "icon": "📽️" },
        { "name": "Visio", "usage": "组织架构与流程图", "icon": "🔗" },
        { "name": "Excel", "usage": "资源规划与预算跟踪", "icon": "📊" },
        { "name": "Word", "usage": "项目管理制度文档", "icon": "📝" }
      ],
      "tasks": [
        { "id": "ch2-t1", "name": "组建项目团队与治理结构", "description": "定义项目组织结构、角色职责、决策机制", "status": "pending", "estimatedHours": 16, "riskLevel": "medium", "documentType": "DOC-006", "changeTrigger": false },
        { "id": "ch2-t2", "name": "制定项目主计划", "description": "制定包含工作坊/数据/开发/配置/测试的详细计划", "status": "pending", "estimatedHours": 24, "riskLevel": "high", "documentType": "DOC-007", "changeTrigger": false },
        { "id": "ch2-t3", "name": "召开项目启动会 (Kick-off)", "description": "召开全员启动会，宣贯项目目标和计划", "status": "pending", "estimatedHours": 4, "riskLevel": "low", "documentType": "DOC-008", "changeTrigger": false },
        { "id": "ch2-t4", "name": "建立沟通管理机制", "description": "建立周报、例会、升级汇报机制", "status": "pending", "estimatedHours": 8, "riskLevel": "low", "documentType": "DOC-009", "changeTrigger": false },
        { "id": "ch2-t5", "name": "建立变更管理流程", "description": "定义变更流程、CCB 职责、变更表单模板", "status": "pending", "estimatedHours": 12, "riskLevel": "medium", "documentType": "DOC-010", "changeTrigger": false },
        { "id": "ch2-t6", "name": "技术环境规划", "description": "规划开发/测试/生产环境和技术架构", "status": "pending", "estimatedHours": 16, "riskLevel": "medium", "documentType": "DOC-011", "changeTrigger": false }
      ],
      "documents": [
        { "id": "DOC-006", "name": "项目组织结构与职责矩阵", "status": "pending" },
        { "id": "DOC-007", "name": "项目主计划", "status": "pending" },
        { "id": "DOC-008", "name": "启动会材料", "status": "pending" },
        { "id": "DOC-009", "name": "沟通管理计划", "status": "pending" },
        { "id": "DOC-010", "name": "变更管理流程", "status": "pending" },
        { "id": "DOC-011", "name": "技术架构规划文档", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "关键人员时间冲突", "description": "业务部门关键用户无法全程参与", "impact": "进度延迟" },
        { "title": "业务部门配合度低", "description": "业务部门优先处理日常运营", "impact": "调研延期" }
      ]
    },
    {
      "id": "ch3",
      "name": "业务蓝图与方案设计",
      "activatePhase": "Explore",
      "description": "梳理现状流程，设计未来流程，确认差异",
      "icon": "🗺️",
      "locked": true,
      "prerequisite": "ch2",
      "tools": [
        { "name": "Visio", "usage": "流程图（AS-IS / TO-BE）", "icon": "🔗" },
        { "name": "SAP Signavio", "usage": "流程建模与分析", "icon": "📐" },
        { "name": "Excel", "usage": "Fit-Gap 分析跟踪", "icon": "📊" },
        { "name": "PowerPoint", "usage": "Workshop 汇报材料", "icon": "📽️" },
        { "name": "Word", "usage": "业务蓝图文档", "icon": "📝" }
      ],
      "tasks": [
        { "id": "ch3-t1", "name": "现状流程调研 (AS-IS)", "description": "调研当前业务流程，绘制 AS-IS 流程图", "status": "pending", "estimatedHours": 40, "riskLevel": "medium", "documentType": "DOC-012", "changeTrigger": false },
        { "id": "ch3-t2", "name": "需求收集与 Workshops", "description": "组织各模块需求收集研讨会", "status": "pending", "estimatedHours": 32, "riskLevel": "medium", "documentType": "DOC-013", "changeTrigger": true },
        { "id": "ch3-t3", "name": "SAP 标准功能演示 (Fit-to-Standard)", "description": "演示 SAP 标准功能，确认业务适配度", "status": "pending", "estimatedHours": 24, "riskLevel": "low", "documentType": "DOC-013", "changeTrigger": false },
        { "id": "ch3-t4", "name": "差异分析 (Fit-Gap Analysis)", "description": "分析标准功能与业务需求的差异", "status": "pending", "estimatedHours": 24, "riskLevel": "high", "documentType": "DOC-014", "changeTrigger": true },
        { "id": "ch3-t5", "name": "未来流程设计 (TO-BE)", "description": "设计新的业务流程和优化方案", "status": "pending", "estimatedHours": 32, "riskLevel": "medium", "documentType": "DOC-015", "changeTrigger": false },
        { "id": "ch3-t6", "name": "蓝图评审与签字确认", "description": "组织蓝图评审会并获得业务签字", "status": "pending", "estimatedHours": 16, "riskLevel": "high", "documentType": "DOC-016", "changeTrigger": true }
      ],
      "documents": [
        { "id": "DOC-012", "name": "AS-IS 流程文档", "status": "pending" },
        { "id": "DOC-013", "name": "需求规格说明书", "status": "pending" },
        { "id": "DOC-014", "name": "Fit-Gap 差异分析报告", "status": "pending" },
        { "id": "DOC-015", "name": "TO-BE 业务流程设计文档", "status": "pending" },
        { "id": "DOC-016", "name": "业务蓝图签字确认书", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "业务需求频繁变更", "description": "业务部门不断提出新需求", "impact": "范围蔓延" },
        { "title": "关键用户不参与调研", "description": "关键用户缺席研讨会", "impact": "需求遗漏" }
      ]
    },
    {
      "id": "ch4",
      "name": "系统配置与开发测试",
      "activatePhase": "Realize",
      "description": "完成系统构建，开发增强，验证功能",
      "icon": "⚙️",
      "locked": true,
      "prerequisite": "ch3",
      "tools": [
        { "name": "SAP GUI / ABAP Workbench", "usage": "系统配置与开发", "icon": "⚙️" },
        { "name": "SAP Solution Manager", "usage": "测试管理与系统监控", "icon": "🖥️" },
        { "name": "JIRA", "usage": "开发任务与缺陷跟踪", "icon": "🐛" },
        { "name": "Excel", "usage": "配置文档与测试记录", "icon": "📊" }
      ],
      "tasks": [
        { "id": "ch4-t1", "name": "系统基础配置", "description": "配置组织架构、公司代码、工厂等基础数据", "status": "pending", "estimatedHours": 24, "riskLevel": "medium", "documentType": "DOC-017", "changeTrigger": false },
        { "id": "ch4-t2", "name": "模块详细配置", "description": "配置 FI/CO/MM/SD/PP 等各模块详细功能", "status": "pending", "estimatedHours": 80, "riskLevel": "high", "documentType": "DOC-017", "changeTrigger": true },
        { "id": "ch4-t3", "name": "增强开发", "description": "开发 ABAP 报表、表单、增强功能", "status": "pending", "estimatedHours": 60, "riskLevel": "high", "documentType": "DOC-018", "changeTrigger": false },
        { "id": "ch4-t4", "name": "接口与集成开发", "description": "开发与其他系统的接口", "status": "pending", "estimatedHours": 40, "riskLevel": "high", "documentType": "DOC-018", "changeTrigger": false },
        { "id": "ch4-t5", "name": "数据迁移程序开发", "description": "开发数据迁移程序和校验逻辑", "status": "pending", "estimatedHours": 32, "riskLevel": "medium", "documentType": "DOC-019", "changeTrigger": false },
        { "id": "ch4-t6", "name": "单元测试", "description": "顾问进行模块功能自测", "status": "pending", "estimatedHours": 40, "riskLevel": "medium", "documentType": "DOC-020", "changeTrigger": false },
        { "id": "ch4-t7", "name": "集成测试", "description": "进行端到端的跨模块集成测试", "status": "pending", "estimatedHours": 48, "riskLevel": "high", "documentType": "DOC-021", "changeTrigger": true },
        { "id": "ch4-t8", "name": "安全与权限配置", "description": "配置用户角色和权限", "status": "pending", "estimatedHours": 24, "riskLevel": "medium", "documentType": "DOC-022", "changeTrigger": false }
      ],
      "documents": [
        { "id": "DOC-017", "name": "系统配置文档", "status": "pending" },
        { "id": "DOC-018", "name": "开发规格说明书", "status": "pending" },
        { "id": "DOC-019", "name": "数据迁移方案", "status": "pending" },
        { "id": "DOC-020", "name": "单元测试报告", "status": "pending" },
        { "id": "DOC-021", "name": "集成测试报告与用例集", "status": "pending" },
        { "id": "DOC-022", "name": "权限矩阵与角色设计文档", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "关键功能开发延期", "description": "复杂增强开发超出预期时间", "impact": "影响测试进度" },
        { "title": "接口调试失败", "description": "与外围系统接口联调失败", "impact": "需要重新设计" },
        { "title": "测试发现重大缺陷", "description": "集成测试发现流程漏洞", "impact": "需要返工" }
      ]
    },
    {
      "id": "ch5",
      "name": "上线准备与切换",
      "activatePhase": "Deploy",
      "description": "完成培训演练，执行系统切换",
      "icon": "🚀",
      "locked": true,
      "prerequisite": "ch4",
      "tools": [
        { "name": "Excel", "usage": "数据清洗与迁移校验", "icon": "📊" },
        { "name": "MS Project", "usage": "切换时间线管理", "icon": "📅" },
        { "name": "PowerPoint", "usage": "用户培训材料", "icon": "📽️" },
        { "name": "Word", "usage": "操作手册", "icon": "📝" }
      ],
      "tasks": [
        { "id": "ch5-t1", "name": "用户验收测试 (UAT)", "description": "最终用户验证系统功能是否满足需求", "status": "pending", "estimatedHours": 40, "riskLevel": "high", "documentType": "DOC-023", "changeTrigger": true },
        { "id": "ch5-t2", "name": "关键用户培训", "description": "对关键用户进行 Train-the-Trainer 培训", "status": "pending", "estimatedHours": 24, "riskLevel": "medium", "documentType": "DOC-024", "changeTrigger": false },
        { "id": "ch5-t3", "name": "最终用户培训", "description": "对所有最终用户进行操作培训", "status": "pending", "estimatedHours": 48, "riskLevel": "medium", "documentType": "DOC-025", "changeTrigger": false },
        { "id": "ch5-t4", "name": "主数据清洗与导入", "description": "清洗旧系统数据并导入新系统", "status": "pending", "estimatedHours": 32, "riskLevel": "high", "documentType": "DOC-026", "changeTrigger": false },
        { "id": "ch5-t5", "name": "上线切换演练", "description": "进行模拟切换演练，验证切换方案", "status": "pending", "estimatedHours": 16, "riskLevel": "high", "documentType": "DOC-027", "changeTrigger": true },
        { "id": "ch5-t6", "name": "制定上线切换方案", "description": "编写详细的切换步骤和检查清单", "status": "pending", "estimatedHours": 16, "riskLevel": "high", "documentType": "DOC-028", "changeTrigger": false },
        { "id": "ch5-t7", "name": "制定应急预案", "description": "制定上线失败的回退方案和应急措施", "status": "pending", "estimatedHours": 12, "riskLevel": "medium", "documentType": "DOC-029", "changeTrigger": false },
        { "id": "ch5-t8", "name": "正式切换执行 (Go-Live)", "description": "执行正式的系统切换", "status": "pending", "estimatedHours": 24, "riskLevel": "critical", "documentType": "DOC-030", "changeTrigger": true }
      ],
      "documents": [
        { "id": "DOC-023", "name": "UAT 测试报告", "status": "pending" },
        { "id": "DOC-024", "name": "培训材料与考核记录", "status": "pending" },
        { "id": "DOC-025", "name": "用户操作手册", "status": "pending" },
        { "id": "DOC-026", "name": "主数据导入清单与校验报告", "status": "pending" },
        { "id": "DOC-027", "name": "上线切换检查清单", "status": "pending" },
        { "id": "DOC-028", "name": "上线切换执行方案", "status": "pending" },
        { "id": "DOC-029", "name": "应急预案", "status": "pending" },
        { "id": "DOC-030", "name": "上线签字确认书", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "用户培训通过率低", "description": "用户考核成绩不达标", "impact": "需要重新培训" },
        { "title": "主数据质量差", "description": "旧系统数据需要大量清洗", "impact": "延期风险" },
        { "title": "切换演练发现漏洞", "description": "演练中发现流程缺陷", "impact": "需要修改方案" }
      ]
    },
    {
      "id": "ch6",
      "name": "上线护航与持续优化",
      "activatePhase": "Run",
      "description": "确保系统稳定运行，移交运维",
      "icon": "🛡️",
      "locked": true,
      "prerequisite": "ch5",
      "tools": [
        { "name": "SAP Solution Manager", "usage": "系统监控", "icon": "🖥️" },
        { "name": "JIRA Service Desk", "usage": "问题与事件跟踪", "icon": "🎫" },
        { "name": "Excel", "usage": "Hypercare 问题清单", "icon": "📊" },
        { "name": "Word", "usage": "运维文档与总结报告", "icon": "📝" }
      ],
      "tasks": [
        { "id": "ch6-t1", "name": "上线现场支持 (Hypercare)", "description": "上线后 1-3 个月的现场支持", "status": "pending", "estimatedHours": 120, "riskLevel": "high", "documentType": "DOC-031", "changeTrigger": false },
        { "id": "ch6-t2", "name": "问题跟踪与解决", "description": "记录并解决上线后出现的问题", "status": "pending", "estimatedHours": 80, "riskLevel": "medium", "documentType": "DOC-032", "changeTrigger": true },
        { "id": "ch6-t3", "name": "系统性能监控与调优", "description": "监控系统性能并进行优化", "status": "pending", "estimatedHours": 24, "riskLevel": "medium", "documentType": "DOC-033", "changeTrigger": false },
        { "id": "ch6-t4", "name": "运维体系移交", "description": "将系统移交给运维团队", "status": "pending", "estimatedHours": 16, "riskLevel": "low", "documentType": "DOC-034", "changeTrigger": false },
        { "id": "ch6-t5", "name": "项目总结与验收", "description": "编写项目总结报告并完成验收", "status": "pending", "estimatedHours": 16, "riskLevel": "low", "documentType": "DOC-035", "changeTrigger": false },
        { "id": "ch6-t6", "name": "持续改进规划", "description": "规划后续优化和扩展方向", "status": "pending", "estimatedHours": 8, "riskLevel": "low", "documentType": "DOC-036", "changeTrigger": false }
      ],
      "documents": [
        { "id": "DOC-031", "name": "问题跟踪日志", "status": "pending" },
        { "id": "DOC-032", "name": "运维支持流程文档", "status": "pending" },
        { "id": "DOC-033", "name": "系统性能监控报告", "status": "pending" },
        { "id": "DOC-034", "name": "运维交接文档", "status": "pending" },
        { "id": "DOC-035", "name": "项目总结报告", "status": "pending" },
        { "id": "DOC-036", "name": "验收报告", "status": "pending" },
        { "id": "DOC-037", "name": "持续改进路线图", "status": "pending" }
      ],
      "riskEvents": [
        { "title": "切换后数据不一致", "description": "上线后发现数据差异", "impact": "需要紧急修复" },
        { "title": "用户操作错误频发", "description": "用户不熟悉系统导致错误", "impact": "需要加强培训" },
        { "title": "关键用户流失", "description": "关键用户离职或调岗", "impact": "需要重新培养" }
      ]
    }
  ],
  "changeManagement": {
    "enabled": true,
    "triggerChance": 0.2,
    "process": [
      { "step": 1, "name": "变更请求", "description": "提交变更请求单 (CR)" },
      { "step": 2, "name": "影响分析", "description": "评估对范围/进度/成本的影响" },
      { "step": 3, "name": "变更审批", "description": "CCB 变更控制委员会审批" },
      { "step": 4, "name": "变更执行", "description": "执行变更并记录" },
      { "step": 5, "name": "变更验证", "description": "验证变更效果" },
      { "step": 6, "name": "关闭确认", "description": "关闭变更请求" }
    ],
    "scenarios": [
      { "chapter": "ch1", "title": "高层调整项目范围", "description": "CEO 要求增加新的业务范围，需要更新项目章程", "impact": { "schedule": 7, "cost": 50000 } },
      { "chapter": "ch2", "title": "业务部门要求增加模块", "description": "销售部门要求增加 CRM 模块集成", "impact": { "schedule": 14, "cost": 100000 } },
      { "chapter": "ch3", "title": "调研发现遗漏关键流程", "description": "发现出口业务流程未纳入范围", "impact": { "schedule": 10, "cost": 80000 } },
      { "chapter": "ch4", "title": "测试发现重大设计缺陷", "description": "集成测试发现成本核算逻辑错误", "impact": { "schedule": 21, "cost": 150000 } },
      { "chapter": "ch5", "title": "业务高峰要求推迟上线", "description": "财务部门要求避开月末结账期", "impact": { "schedule": 14, "cost": 30000 } },
      { "chapter": "ch6", "title": "新法规要求变更", "description": "新税法要求调整系统配置", "impact": { "schedule": 7, "cost": 50000 } }
    ]
  },
  "gameState": {
    "currentChapter": "ch1",
    "totalProgress": 0,
    "completedTasks": 0,
    "totalTasks": 0,
    "changeRequests": [],
    "riskEventsTriggered": []
  }
};

/**
 * 加载游戏数据
 */
async function loadGameData() {
  try {
    // 使用内嵌数据，避免 fetch 在 file://协议下失败
    gameData = EMBEDDED_GAME_DATA;

    // 初始化游戏状态
    initGameState();

    console.log('游戏数据加载成功');
    return gameData;
  } catch (error) {
    console.error('加载游戏数据失败:', error);
    throw error;
  }
}

/**
 * 初始化游戏状态
 */
function initGameState() {
  // 从项目数据中加载保存的状态
  const projectId = (typeof ProjectManager !== 'undefined' && ProjectManager.getCurrentProjectId) ? ProjectManager.getCurrentProjectId() : null;

  if (projectId) {
    const projectData = localStorage.getItem(`erp_project_${projectId}`);
    if (projectData) {
      try {
        const parsed = JSON.parse(projectData);
        gameState = parsed.gameState || createDefaultGameState();
        // 将保存的状态合并到游戏数据中
        mergeGameState();
      } catch (e) {
        console.error('加载保存状态失败:', e);
        gameState = createDefaultGameState();
      }
    } else {
      gameState = createDefaultGameState();
    }
  } else {
    gameState = createDefaultGameState();
  }

  // 计算总任务数
  gameState.totalTasks = gameData.chapters.reduce((sum, chapter) => {
    return sum + chapter.tasks.length;
  }, 0);
}

/**
 * 创建默认游戏状态
 */
function createDefaultGameState() {
  return {
    currentChapter: 'ch1',
    totalProgress: 0,
    completedTasks: 0,
    totalTasks: 0,
    changeRequests: [],
    riskEventsTriggered: [],
    documents: {},
    tasks: {}
  };
}

/**
 * 合并保存的游戏状态到章节数据中
 */
function mergeGameState() {
  if (!gameState.tasks) {
    gameState.tasks = {};
  }
  if (!gameState.documents) {
    gameState.documents = {};
  }

  // 更新章节锁定状态和任务状态
  gameData.chapters.forEach(chapter => {
    // 检查前置章节是否完成来更新锁定状态
    if (chapter.prerequisite) {
      const prereqChapter = gameData.chapters.find(c => c.id === chapter.prerequisite);
      if (prereqChapter) {
        const prereqCompleted = prereqChapter.tasks.every(task => {
          const taskState = gameState.tasks[task.id];
          return taskState && taskState.status === 'completed';
        });
        chapter.locked = !prereqCompleted;
      }
    }

    // 更新任务状态
    chapter.tasks.forEach(task => {
      if (gameState.tasks[task.id]) {
        task.status = gameState.tasks[task.id].status;
      }
    });

    // 恢复文档状态
    chapter.documents.forEach(doc => {
      if (gameState.documents[doc.id]) {
        doc.status = gameState.documents[doc.id].status || 'pending';
      }
    });
  });

  // 更新当前章节
  const firstUnlockedChapter = gameData.chapters.find(c => !c.locked);
  if (firstUnlockedChapter) {
    gameState.currentChapter = firstUnlockedChapter.id;
  }

  // 计算进度
  updateGameStateProgress();
}

/**
 * 更新游戏状态进度
 */
function updateGameStateProgress() {
  let completedCount = 0;

  gameData.chapters.forEach(chapter => {
    chapter.tasks.forEach(task => {
      if (task.status === 'completed') {
        completedCount++;
      }
    });
  });

  gameState.completedTasks = completedCount;
  gameState.totalProgress = Math.round((completedCount / gameState.totalTasks) * 100);

  // 保存到 localStorage
  saveGameState();
}

/**
 * 保存游戏状态到 localStorage（项目专属存储）
 */
function saveGameState() {
  try {
    // 写入项目专属存储
    const projectId = (typeof ProjectManager !== 'undefined' && ProjectManager.getCurrentProjectId) ? ProjectManager.getCurrentProjectId() : null;
    if (projectId) {
      const projectData = localStorage.getItem(`erp_project_${projectId}`);
      if (projectData) {
        const parsed = JSON.parse(projectData);
        parsed.gameState = gameState;
        localStorage.setItem(`erp_project_${projectId}`, JSON.stringify(parsed));
      }
    }
    // 同时保留全局键作为兼容备份（防止直接通过 index.html 访问 without project）
    localStorage.setItem('erpSimulationGameState', JSON.stringify(gameState));
  } catch (e) {
    console.error('保存游戏状态失败:', e);
  }
}

/**
 * 获取章节数据
 */
function getChapter(chapterId) {
  return gameData.chapters.find(c => c.id === chapterId) || null;
}

/**
 * 获取任务数据
 */
function getTask(taskId) {
  for (const chapter of gameData.chapters) {
    const task = chapter.tasks.find(t => t.id === taskId);
    if (task) return task;
  }
  return null;
}

/**
 * 获取文档数据
 */
function getDocument(docId) {
  for (const chapter of gameData.chapters) {
    const doc = chapter.documents.find(d => d.id === docId);
    if (doc) return doc;
  }
  return null;
}

/**
 * 更新任务状态
 */
function updateTaskStatus(taskId, newStatus) {
  const task = getTask(taskId);
  if (task) {
    task.status = newStatus;
    gameState.tasks[taskId] = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (newStatus === 'completed') {
      checkChapterUnlock();
    }

    updateGameStateProgress();
    saveGameState();
  }
}

/**
 * 检查并解锁后续章节
 */
function checkChapterUnlock() {
  gameData.chapters.forEach(chapter => {
    if (chapter.prerequisite) {
      const prereqChapter = gameData.chapters.find(c => c.id === chapter.prerequisite);
      if (prereqChapter) {
        const allCompleted = prereqChapter.tasks.every(task => task.status === 'completed');
        if (allCompleted) {
          chapter.locked = false;
        }
      }
    }
  });
}

/**
 * 更新文档状态
 */
function updateDocumentStatus(docId, newStatus, content = '') {
  for (const chapter of gameData.chapters) {
    const doc = chapter.documents.find(d => d.id === docId);
    if (doc) {
      doc.status = newStatus;
      if (content) {
        gameState.documents[docId] = {
          content: content,
          status: newStatus,
          generatedAt: new Date().toISOString()
        };
      }
      saveGameState();
      return true;
    }
  }
  return false;
}

/**
 * 获取生成的文档内容
 */
function getGeneratedDocument(docId) {
  return gameState.documents[docId] || null;
}

/**
 * 添加变更请求
 */
function addChangeRequest(changeRequest) {
  gameState.changeRequests.push({
    ...changeRequest,
    createdAt: new Date().toISOString(),
    status: 'pending'
  });
  saveGameState();
}

/**
 * 获取变更场景
 */
function getChangeScenario(chapterId) {
  const scenarios = gameData.changeManagement.scenarios;
  const availableScenarios = scenarios.filter(s => s.chapter === chapterId);

  if (availableScenarios.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableScenarios.length);
  return availableScenarios[randomIndex];
}

/**
 * 检查是否触发变更事件
 */
function shouldTriggerChange(chapterId) {
  if (!gameData.changeManagement.enabled) return false;

  const triggerChance = gameData.changeManagement.triggerChance || 0.2;
  return Math.random() < triggerChance;
}

/**
 * 重置游戏进度
 */
function resetGameProgress() {
  if (confirm('确定要重置所有进度吗？此操作不可恢复。')) {
    localStorage.removeItem('erpSimulationGameState');
    location.reload();
  }
}

/**
 * 导出游戏状态
 */
function exportGameState() {
  const dataStr = JSON.stringify(gameState, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `erp-simulation-save-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 导出函数
window.GameData = {
  loadGameData,
  getChapter,
  getTask,
  getDocument,
  updateTaskStatus,
  updateDocumentStatus,
  saveGameState,
  getGeneratedDocument,
  addChangeRequest,
  getChangeScenario,
  shouldTriggerChange,
  resetGameProgress,
  exportGameState,
  getGameData: () => gameData,
  getGameState: () => gameState,
  updateGameStateProgress
};
