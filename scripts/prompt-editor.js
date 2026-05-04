/**
 * AI 提示词编辑器
 *
 * 流程：
 * 1. PromptEditor.show(docType, context) → 弹出双 Tab 对话框
 * 2. Tab 1 结构化编辑：项目基本信息 + 背景 + 文档字段 + 风格
 * 3. Tab 2 提示词编辑：完整的 prose-style 提示词文本，可直接修改
 * 4. 确认 → resolve(finalPrompt) → 调用 AI
 * 5. 取消 → reject
 */

// ═══════════════════════════════════════
// 各文档类型的额外字段
// ═══════════════════════════════════════

const DOC_EXTRA_FIELDS = {
  'DOC-001': [
    { key: 'budgetCap', label: '预算上限', type: 'text', placeholder: '如：5000 万' },
    { key: 'expectedROI', label: '预期 ROI', type: 'text', placeholder: '如：15-20%' },
    { key: 'timeRange', label: '分析周期', type: 'text', placeholder: '如：3 年 / 5 年' },
  ],
  'DOC-002': [
    { key: 'budgetTotal', label: '项目预算总额', type: 'text', placeholder: '如：5000 万' },
    { key: 'teamSize', label: '团队规模', type: 'text', placeholder: '如：50 人' },
    { key: 'vendorCount', label: '外部供应商数量', type: 'text', placeholder: '如：3 家' },
  ],
  'DOC-003': [
    { key: 'vendorList', label: '候选供应商列表', type: 'text', placeholder: '如：SAP, Oracle, 用友' },
    { key: 'selectionCriteria', label: '选型核心标准', type: 'text', placeholder: '如：功能完整性、总拥有成本' },
  ],
  'DOC-004': [
    { key: 'budgetCap', label: '投资总额', type: 'text', placeholder: '如：5000 万' },
    { key: 'returnYears', label: '回报周期', type: 'text', placeholder: '如：3 年' },
  ],
  'DOC-005': [
    { key: 'budgetTotal', label: '项目预算总额', type: 'text', placeholder: '如：5000 万' },
    { key: 'teamSize', label: '团队规模', type: 'text', placeholder: '如：50 人' },
    { key: 'vendorCount', label: '外部供应商数量', type: 'text', placeholder: '如：3 家' },
  ],
  'DOC-006': [
    { key: 'teamSize', label: '团队规模', type: 'text', placeholder: '如：50 人' },
    { key: 'governanceLevel', label: '治理层级', type: 'text', placeholder: '如：指导委员会 → PMO → 模块负责人' },
    { key: 'externalVendorCount', label: '外部顾问数量', type: 'text', placeholder: '如：15 人' },
  ],
  'DOC-007': [
    { key: 'consultantCount', label: '顾问人数', type: 'text', placeholder: '如：30' },
    { key: 'outsourceRatio', label: '外包比例', type: 'text', placeholder: '如：40%' },
    { key: 'keyMilestone', label: '关键时间节点', type: 'textarea', placeholder: '如：蓝图 6 月确认，UAT 12 月，上线次年 3 月' },
  ],
  'DOC-008': [
    { key: 'attendeeCount', label: '参会人数', type: 'text', placeholder: '如：80 人' },
    { key: 'meetingFormat', label: '会议形式', type: 'text', placeholder: '如：现场 + 视频' },
  ],
  'DOC-009': [
    { key: 'communicationChannels', label: '沟通渠道', type: 'text', placeholder: '如：邮件、企业微信、JIRA' },
    { key: 'escalationLevels', label: '升级汇报层级', type: 'text', placeholder: '如：组长 → 项目经理 → 指导委员会' },
  ],
  'DOC-010': [
    { key: 'approvalLevels', label: '变更审批层级', type: 'text', placeholder: '如：CCB → 项目经理 → 指导委员会' },
    { key: 'urgentCR', label: '紧急变更定义', type: 'text', placeholder: '如：影响生产系统、24h 内响应' },
  ],
  'DOC-011': [
    { key: 'environmentCount', label: '系统环境数量', type: 'text', placeholder: '如：4 个（DEV/QAS/PRD/TST）' },
    { key: 'infraType', label: '部署方式', type: 'text', placeholder: '如：公有云 / 私有云 / 混合云' },
  ],
  'DOC-012': [
    { key: 'processCount', label: '流程数量', type: 'text', placeholder: '如：30 个核心流程' },
    { key: 'departmentList', label: '调研部门', type: 'text', placeholder: '如：财务、采购、销售、生产、仓储' },
  ],
  'DOC-013': [
    { key: 'workshopCount', label: '研讨会数量', type: 'text', placeholder: '如：12 场' },
    { key: 'moduleList', label: '涉及的模块', type: 'text', placeholder: '如：FI, CO, MM, SD, PP' },
  ],
  'DOC-014': [
    { key: 'existingSystemCount', label: '现有系统数量', type: 'text', placeholder: '如：8 个' },
    { key: 'devTendency', label: '二次开发倾向', type: 'select', options: ['低（尽量标准）', '中（适度增强）', '高（大量定制）'] },
  ],
  'DOC-015': [
    { key: 'processCount', label: '流程数量', type: 'text', placeholder: '如：35 个' },
    { key: 'optimizationFocus', label: '优化重点', type: 'textarea', placeholder: '如：减少人工环节、自动化审批' },
  ],
  'DOC-016': [
    { key: 'reviewerList', label: '评审参与人', type: 'text', placeholder: '如：业务部门负责人、IT 负责人' },
    { key: 'signoffMethod', label: '签字确认方式', type: 'text', placeholder: '如：线下签字 / 邮件确认' },
  ],
  'DOC-017': [
    { key: 'orgUnitCount', label: '组织单元数量', type: 'text', placeholder: '如：1 个集团 + 3 个工厂 + 5 个销售公司' },
    { key: 'configModules', label: '配置模块', type: 'text', placeholder: '如：FI, CO, MM, SD, PP' },
  ],
  'DOC-018': [
    { key: 'reportCount', label: '报表数量', type: 'text', placeholder: '如：15 个' },
    { key: 'enhancementCount', label: '增强数量', type: 'text', placeholder: '如：10 个' },
  ],
  'DOC-019': [
    { key: 'dataCategoryCount', label: '数据类型数量', type: 'text', placeholder: '如：6 类（物料、客户、供应商、BOM、工艺路线、库存）' },
    { key: 'migrationTool', label: '数据迁移工具', type: 'text', placeholder: '如：LSMW / LTMC' },
  ],
  'DOC-020': [
    { key: 'testCaseCount', label: '测试用例数', type: 'text', placeholder: '如：80 个' },
  ],
  'DOC-021': [
    { key: 'integratedSystemCount', label: '集成系统数量', type: 'text', placeholder: '如：5 个' },
    { key: 'testEnvStatus', label: '测试环境状态', type: 'text', placeholder: '如：已就绪 / 进行中' },
    { key: 'testCaseCount', label: '测试用例数', type: 'text', placeholder: '如：100 个' },
  ],
  'DOC-022': [
    { key: 'roleCount', label: '角色数量', type: 'text', placeholder: '如：40 个' },
  ],
  'DOC-023': [
    { key: 'userCount', label: '测试用户数', type: 'text', placeholder: '如：50 人' },
    { key: 'testCaseCount', label: 'UAT 测试用例数', type: 'text', placeholder: '如：120 个' },
  ],
  'DOC-024': [
    { key: 'trainerCount', label: '关键用户数', type: 'text', placeholder: '如：15 人' },
    { key: 'trainingDuration', label: '培训时长', type: 'text', placeholder: '如：3 天/模块' },
  ],
  'DOC-025': [
    { key: 'targetUserCount', label: '目标用户数', type: 'text', placeholder: '如：200 人' },
    { key: 'userITLevel', label: '用户 IT 水平', type: 'select', options: ['较低（需要详细指引）', '中等', '较高'] },
  ],
  'DOC-026': [
    { key: 'dataVolume', label: '数据量级', type: 'text', placeholder: '如：物料主数据 50000 条' },
    { key: 'cleaningStatus', label: '数据清洗进度', type: 'text', placeholder: '如：已完成 80%' },
  ],
  'DOC-027': [
    { key: 'drillCount', label: '演练次数', type: 'text', placeholder: '如：2 次' },
  ],
  'DOC-028': [
    { key: 'downtimeWindow', label: '停机时间窗口', type: 'text', placeholder: '如：4 月 1 日 -7 日（7 天）' },
    { key: 'rollbackDecision', label: '回退决策人', type: 'text', placeholder: '如：项目经理 + IT 总监' },
    { key: 'cutoverStrategy', label: '切换策略', type: 'select', options: ['大爆炸', '分步切换', '并行运行'] },
  ],
  'DOC-029': [
    { key: 'rtoRequirement', label: 'RTO 要求', type: 'text', placeholder: '如：2 小时内恢复' },
    { key: 'rpoRequirement', label: 'RPO 要求', type: 'text', placeholder: '如：15 分钟内数据' },
    { key: 'criticalSystemCount', label: '关键业务系统数', type: 'text', placeholder: '如：5 个' },
  ],
  'DOC-030': [
    { key: 'goLiveDate', label: '上线日期', type: 'text', placeholder: '如：2027 年 4 月 1 日' },
    { key: 'teamOnCall', label: '上线保障团队', type: 'text', placeholder: '如：内部 20 人 + 顾问 15 人' },
  ],
  'DOC-031': [
    { key: 'hypercareDuration', label: '护航期', type: 'text', placeholder: '如：3 个月' },
    { key: 'supportTeamSize', label: '支持团队规模', type: 'text', placeholder: '如：20 人' },
  ],
  'DOC-032': [
    { key: 'issueTrackingTool', label: '问题跟踪工具', type: 'text', placeholder: '如：JIRA' },
    { key: 'slaLevels', label: 'SLA 级别', type: 'text', placeholder: '如：P1-2h, P2-4h, P3-24h' },
  ],
  'DOC-033': [
    { key: 'monitoringTool', label: '监控工具', type: 'text', placeholder: '如：SolMan, HP' },
  ],
  'DOC-034': [
    { key: 'handoverTeam', label: '接收运维团队', type: 'text', placeholder: '如：IT 运维部（10 人）' },
  ],
  'DOC-035': [
    { key: 'actualBudget', label: '实际项目预算', type: 'text', placeholder: '如：4800 万' },
    { key: 'actualTeamSize', label: '实际团队规模', type: 'text', placeholder: '如：55 人' },
  ],
  'DOC-036': [
    { key: 'improvementAreas', label: '改进领域', type: 'textarea', placeholder: '如：BPC 预算模块、BW 报表增强' },
  ],
};

// 文档名称映射
const DOC_NAMES = {
  'DOC-001': '业务案例分析报告', 'DOC-002': '可行性研究报告', 'DOC-003': '供应商选型评估报告',
  'DOC-004': '投资回报分析 (ROI)', 'DOC-005': '项目章程', 'DOC-006': '项目组织与治理结构',
  'DOC-007': '项目主计划', 'DOC-008': '项目启动会纪要', 'DOC-009': '沟通管理机制',
  'DOC-010': '变更管理流程', 'DOC-011': '技术环境规划方案', 'DOC-012': '现状调研报告 (AS-IS)',
  'DOC-013': '需求收集与研讨会纪要', 'DOC-014': 'Fit-Gap 差异分析报告', 'DOC-015': '未来流程设计 (TO-BE)',
  'DOC-016': '蓝图评审与确认书', 'DOC-017': '系统配置文档', 'DOC-018': '增强开发文档',
  'DOC-019': '数据迁移程序文档', 'DOC-020': '单元测试报告', 'DOC-021': '集成测试报告',
  'DOC-022': '安全与权限配置文档', 'DOC-023': '用户验收测试 (UAT) 报告',
  'DOC-024': '关键用户培训材料', 'DOC-025': '用户操作手册', 'DOC-026': '主数据清洗与导入报告',
  'DOC-027': '上线切换演练报告', 'DOC-028': '上线切换执行方案', 'DOC-029': '上线应急预案',
  'DOC-030': '正式切换执行记录', 'DOC-031': '上线现场支持报告', 'DOC-032': '问题跟踪报告',
  'DOC-033': '系统性能监控报告', 'DOC-034': '运维体系移交文档',
  'DOC-035': '项目总结报告', 'DOC-036': '持续改进规划',
};

// 各文档类型的标准章节结构（AI 生成时给出明确指引，确保输出稳定）
const DOC_STRUCTURES = {
  'DOC-001': [
    '执行摘要（核心发现、关键结论、投资建议）',
    '企业背景与现状分析（组织架构、业务网络、发展历程）',
    '业务痛点深度分析（至少 5 个痛点，每个含现状描述、影响量化、典型案例）',
    '现有系统架构评估（当前系统清单、集成复杂度、技术债务）',
    '业务影响量化分析（财务影响、运营影响、合规风险）',
    'SAP 解决方案价值主张（核心能力、与痛点对照、预期收益）',
    '投资回报分析（TCO 总拥有成本、收益预测、ROI/NPV/IRR 计算）',
    '风险评估与缓解策略（技术风险、业务风险、组织风险、应对方案）',
    '结论与建议（实施建议、下一步行动计划）',
    '签字栏',
  ],
  'DOC-005': [
    '项目基本信息（项目名称、编号、发起人、经理、日期）',
    '项目背景（为什么做这个项目）',
    '项目目标（SMART 原则，业务目标 + 技术目标）',
    '项目范围（组织范围、模块范围、排除范围）',
    '项目组织与角色职责（表格列出各角色）',
    '关键里程碑（启动、蓝图、系统就绪、上线、验收）',
    '预算概算',
    '审批签字栏',
  ],
  'DOC-007': [
    '文档头（编号 DOC-007-PMP-001、版本 V1.0、日期、密级、适用项目）',
    '修订记录表（版本、日期、修订人、内容）',
    '项目总体计划（SAP ACTIVATE 6 阶段的时间线表格，含阶段名称、起止日期、工期、关键交付物、负责人）',
    'Design Workshop 计划（各模块研讨会的安排表格，含模块、日期、参与人、引导顾问、产出物）',
    '数据迁移计划（各类主数据的迁移时间表，含数据类型、数据量级、清洗/测试/导入日期）',
    '开发计划 RICEF（报表、表单、接口、增强、转换的开发周期表格，含工作量、日期、负责人）',
    '系统配置计划（各模块配置工作安排表格，含模块、任务、人天、日期、顾问、确认人）',
    '测试计划（单元测试、集成测试、UAT、性能测试、切换演练的安排表格）',
    '关键里程碑（10-15 个里程碑节点表格，含里程碑名称、计划日期、完成标准、责任方）',
    '资源需求汇总（各阶段人力资源配置表格，含角色、人数、总人天）',
    '风险与假设（项目实施的前提假设和已识别风险列表）',
    '签字栏',
  ],
  'DOC-010': [
    '文档头（编号 DOC-010-CMP-001、版本、日期）',
    '变更管理目的与范围',
    '变更管理组织（CCB 成员及职责表格）',
    '变更管理流程（流程步骤描述：请求→评估→审批→执行→验证→关闭）',
    '变更优先级定义（P1-P4 及响应时限表格）',
    '变更请求单 CR 模板（完整表格模板）',
    '变更升级机制',
    '签字栏',
  ],
  'DOC-014': [
    '文档头（编号 DOC-014-FG-001、版本、日期）',
    '分析概述（目的、范围、方法）',
    '差异汇总表格（流程、需求、SAP 标准功能、差异程度、解决方案）',
    '各模块详细差异分析（FI、CO、MM、SD、PP，每模块至少 3 个差异项）',
    '差异解决策略（标准功能、配置、增强开发、第三方的选择标准）',
    '风险评估与建议',
    '签字栏',
  ],
  'DOC-021': [
    '文档头（编号 DOC-021-IT-001、版本、日期）',
    '测试概述（目的、范围、时间、参与人）',
    '测试环境说明',
    '测试执行情况汇总（用例总数、通过数、失败数、通过率）',
    '各流程测试结果（采购到付款、销售到收款、计划到生产、财务到报表）',
    '缺陷汇总与分析（缺陷列表、严重程度分布、修复状态）',
    '测试结论与建议',
    '签字栏',
  ],
  'DOC-025': [
    '文档头（编号 DOC-025-UM-001、版本、日期）',
    '手册说明（目的、适用范围、读者对象）',
    '系统登录与界面介绍',
    '各模块常用操作（FI 财务、MM 采购、SD 销售、库存管理，每个含操作步骤和注意事项）',
    '常见问题 FAQ',
    '附录（术语表、快捷键）',
    '签字栏',
  ],
  'DOC-028': [
    '文档头（编号 DOC-028-CS-001、版本、日期）',
    '切换策略（大爆炸/分步/并行，选择及理由）',
    '切换组织与职责',
    '切换前准备条件清单',
    '详细切换时间表（精确到小时，T-2 到 T+7 的任务分解）',
    '数据迁移步骤',
    '切换检查清单',
    '上线后支持安排',
    '签字栏',
  ],
  'DOC-029': [
    '文档头（编号 DOC-029-EP-001、版本、日期）',
    '应急组织架构（指挥部、技术组、业务组及联系方式）',
    '风险场景与应对措施（至少 10 个场景：系统无法登录、数据错误、功能异常、性能问题等）',
    '回退条件和决策流程',
    '回退步骤详解',
    '演练计划',
    '签字栏',
  ],
  'DOC-035': [
    '文档头（编号 DOC-035-PS-001、版本、日期）',
    '项目回顾（时间线、里程碑达成情况）',
    '项目目标达成情况',
    '项目交付物清单',
    '预算执行情况',
    '成功经验总结',
    '教训与改进建议',
    '后续运维建议',
    '持续改进路线图',
    '签字栏',
  ],
};

// 行业 / 规模转文本
function getIndustryText(code) {
  const t = typeof Locale !== 'undefined' ? Locale.t.bind(Locale) : (k => k);
  const map = { manufacturing:t('bgIndustry_manufacturing'), finance:t('bgIndustry_finance'), retail:t('bgIndustry_retail'), pharma:t('bgIndustry_pharma'), energy:t('bgIndustry_energy'), telecom:t('bgIndustry_telecom'), government:t('bgIndustry_government'), other:t('bgIndustry_other') };
  return map[code] || code || '';
}
function getCompanySizeText(code) {
  const t = typeof Locale !== 'undefined' ? Locale.t.bind(Locale) : (k => k);
  const map = { small:t('bgSize_small'), medium:t('bgSize_medium'), large:t('bgSize_large'), enterprise:t('bgSize_enterprise') };
  return map[code] || code || '';
}

// 日期格式化
function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' });
  } catch(e) { return d; }
}

const PromptEditor = {

  // 当前状态
  _resolve: null,
  _reject: null,
  _docType: '',
  _context: null,

  // ═══════════════════════════════════════
  // 公开方法
  // ═══════════════════════════════════════

  /**
   * 显示对话框
   * @param {string} docType - DOC-001, DOC-002, ...
   * @param {object} context - { projectInfo, task, chapterId }
   * @returns {Promise<{finalPrompt: string}>}
   */
  show(docType, context) {
    console.log('[PromptEditor.show] 收到参数: docType =', docType, ', context.task =', context?.task);
    return new Promise((resolve, reject) => {
      this._docType = docType;
      this._context = context;
      this._resolve = resolve;
      this._reject = reject;

      console.log('[PromptEditor.show] 设置: this._docType =', this._docType, ', DOC_NAMES[docType] =', DOC_NAMES[docType]);

      // 设置文档名
      const docNameKey = 'doc_' + docType.replace('-', '_');
      document.getElementById('peDocName').textContent = (typeof Locale !== 'undefined' ? Locale.t(docNameKey) : DOC_NAMES[docType]) || DOC_NAMES[docType] || '项目文档';

      // 渲染项目基本信息
      this._renderProjectInfo(context.projectInfo);

      // 渲染背景字段（预填已有数据）
      this._renderBgFields(context.projectInfo?.background || {});

      // 渲染文档专用字段
      this._renderExtraFields(docType);

      // 重置样式字段
      document.getElementById('peStyle').value = '';
      document.getElementById('peExamples').value = '';
      document.getElementById('peTables').value = '';
      document.getElementById('peCustomPrompt').value = '';

      // 生成初始 prompt
      this._rebuildPromptInternal();

      // 切到结构化 Tab
      this.switchTab('structured');

      // 显示对话框
      const modal = document.getElementById('promptEditorModal');
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);

      // 绑定按钮
      document.getElementById('btnPromptConfirm').onclick = () => this.confirm();
    });
  },

  /**
   * 关闭对话框
   */
  close() {
    const modal = document.getElementById('promptEditorModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  },

  /**
   * 取消对话框
   */
  cancel() {
    this.close();
    if (this._reject) {
      this._reject(new Error(typeof Locale !== 'undefined' ? Locale.t('promptCancelMsg') : '用户取消了 AI 生成'));
    }
    this._resolve = null;
    this._reject = null;
  },

  /**
   * 切换 Tab
   */
  switchTab(tab) {
    const t1 = document.getElementById('peTab1');
    const t2 = document.getElementById('peTab2');
    const c1 = document.getElementById('peContent-structured');
    const c2 = document.getElementById('peContent-text');

    if (tab === 'structured') {
      t1.classList.add('active'); t2.classList.remove('active');
      c1.style.display = ''; c2.style.display = 'none';
    } else {
      // 切到文本 Tab 时，重新生成 prompt
      this._rebuildPromptInternal();
      t2.classList.add('active'); t1.classList.remove('active');
      c2.style.display = ''; c1.style.display = 'none';
    }
  },

  /**
   * 从结构化数据重新生成提示词文本
   */
  rebuildPrompt() {
    this._rebuildPromptInternal();
  },

  /**
   * 重置所有字段
   */
  resetAll() {
    // 清空背景字段
    ['peBgIndustry','peBgSize','peBgIt','peBgPain','peBgGoals','peBgModules','peBgOrg','peBgMilestones'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    // 清空文档专用字段
    const extra = DOC_EXTRA_FIELDS[this._docType] || [];
    extra.forEach(f => {
      const el = document.getElementById('pe_extra_' + f.key);
      if (el) el.value = '';
    });
    // 清空样式
    document.getElementById('peStyle').value = '';
    document.getElementById('peExamples').value = '';
    document.getElementById('peTables').value = '';
    document.getElementById('peCustomPrompt').value = '';
  },

  /**
   * 确认生成
   */
  confirm() {
    const finalPrompt = document.getElementById('pePromptPreview').value;
    const resolve = this._resolve;
    this._saveBackgroundToProject();
    this.close();
    if (resolve) resolve({ finalPrompt, extraFields: {}, commonFields: {}, customPrompt: '' });
    this._resolve = null;
    this._reject = null;
  },

  /**
   * 把用户在提示词编辑器中修改的背景信息保存回项目主数据
   * 避免用户每次打开新任务都要重新填写行业、规模、痛点等
   */
  _saveBackgroundToProject() {
    try {
      const projectId = localStorage.getItem('erpSimulationCurrentProject');
      console.log('[PromptEditor._saveBackgroundToProject] projectId =', projectId);
      if (!projectId || typeof ProjectManager === 'undefined') return;

      const projects = ProjectManager.getAllProjects();
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        console.warn('[PromptEditor._saveBackgroundToProject] 项目未找到, projectId =', projectId);
        return;
      }

      // 读取用户当前填写的背景字段值
      const newBg = {
        industry: getVal('peBgIndustry') || '',
        companySize: getVal('peBgSize') || '',
        itLandscape: getVal('peBgIt') || '',
        painPoints: getVal('peBgPain') || '',
        goals: getVal('peBgGoals') || '',
        modules: getVal('peBgModules') || '',
        orgStructure: getVal('peBgOrg') || '',
        milestones: getVal('peBgMilestones') || '',
      };

      // 合并：只更新用户有输入的非空字段
      const oldBg = project.background || {};
      project.background = {
        ...oldBg,
        industry: newBg.industry || oldBg.industry,
        companySize: newBg.companySize || oldBg.companySize,
        itLandscape: newBg.itLandscape || oldBg.itLandscape,
        painPoints: newBg.painPoints || oldBg.painPoints,
        goals: newBg.goals || oldBg.goals,
        modules: newBg.modules || oldBg.modules,
        orgStructure: newBg.orgStructure || oldBg.orgStructure,
        milestones: newBg.milestones || oldBg.milestones,
      };

      // 保存回 localStorage
      ProjectManager.saveProjects(projects);
      console.log('[PromptEditor._saveBackgroundToProject] 背景已保存:', JSON.stringify(project.background));
    } catch (e) {
      console.warn('[PromptEditor] 保存背景信息失败:', e);
    }
  },

  // ═══════════════════════════════════════
  // 渲染方法
  // ═══════════════════════════════════════

  /**
   * 渲染项目基本信息（只读）
   */
  _renderProjectInfo(info) {
    if (!info) info = {};
    document.getElementById('peProjCode').textContent = info.code || '';
    document.getElementById('peProjName').textContent = info.name || '';
    document.getElementById('peProjCustomer').textContent = info.customerName || '';
    document.getElementById('peProjPM').textContent = info.projectManager || '';
    document.getElementById('peProjStart').textContent = fmtDate(info.startDate);
    document.getElementById('peProjGoLive').textContent = fmtDate(info.goLiveDate);
  },

  /**
   * 渲染背景字段（预填已有数据）
   */
  _renderBgFields(bg) {
    console.log('[PromptEditor._renderBgFields] 接收到背景数据:', JSON.stringify(bg));
    document.getElementById('peBgIndustry').value = bg.industry || '';
    document.getElementById('peBgSize').value = bg.companySize || '';
    document.getElementById('peBgIt').value = bg.itLandscape || '';
    document.getElementById('peBgPain').value = bg.painPoints || '';
    document.getElementById('peBgGoals').value = bg.goals || '';
    document.getElementById('peBgModules').value = bg.modules || '';
    document.getElementById('peBgOrg').value = bg.orgStructure || '';
    document.getElementById('peBgMilestones').value = bg.milestones || '';
  },

  /**
   * 渲染文档专用字段
   */
  _renderExtraFields(docType) {
    const extra = DOC_EXTRA_FIELDS[docType] || [];
    const hint = document.getElementById('peSectionHint');
    hint.textContent = extra.length > 0 ? `（${extra.length} ${typeof Locale !== 'undefined' ? Locale.t('promptOptionalFields') : '个可选字段'}）` : '';

    const html = extra.map(f => {
      if (f.type === 'textarea') {
        return `<div class="pe-field">
          <label>${f.label}</label>
          <textarea id="pe_extra_${f.key}" rows="2" placeholder="${f.placeholder}"></textarea>
        </div>`;
      }
      if (f.type === 'select') {
        const opts = f.options.map(o => `<option value="${o}">${o}</option>`).join('');
        return `<div class="pe-field">
          <label>${f.label}</label>
          <select id="pe_extra_${f.key}">
            <option value="">${typeof Locale !== 'undefined' ? Locale.t('bgIndustryPlaceholder') : '请选择'}</option>${opts}
          </select>
        </div>`;
      }
      return `<div class="pe-field">
        <label>${f.label}</label>
        <input type="text" id="pe_extra_${f.key}" placeholder="${f.placeholder}">
      </div>`;
    }).join('');

    document.getElementById('peExtraFields').innerHTML = html;
  },

  // ═══════════════════════════════════════
  // 提示词组装（prose style）
  // ═══════════════════════════════════════

  /**
   * 收集结构化数据并组装 prompt
   */
  _rebuildPromptInternal() {
    const docType = this._docType;
    const docNameKey = 'doc_' + docType.replace('-', '_');
    const docName = (typeof Locale !== 'undefined' ? Locale.t(docNameKey) : DOC_NAMES[docType]) || DOC_NAMES[docType] || '项目文档';
    const info = this._context?.projectInfo || {};
    const task = this._context?.task || {};
    const bg = info.background || {};

    console.log('[PromptEditor._rebuildPromptInternal] docType =', docType, ', docName =', docName, ', task.name =', task.name, ', task.id =', task.id);

    // 收集用户当前编辑的背景字段值（优先级高于已保存的背景数据）
    const currentBg = {
      industry: getVal('peBgIndustry') || bg.industry || '',
      companySize: getVal('peBgSize') || bg.companySize || '',
      itLandscape: getVal('peBgIt') || bg.itLandscape || '',
      painPoints: getVal('peBgPain') || bg.painPoints || '',
      goals: getVal('peBgGoals') || bg.goals || '',
      modules: getVal('peBgModules') || bg.modules || '',
      orgStructure: getVal('peBgOrg') || bg.orgStructure || '',
      milestones: getVal('peBgMilestones') || bg.milestones || '',
    };

    // 收集文档专用字段
    const extra = DOC_EXTRA_FIELDS[docType] || [];
    const extraData = {};
    extra.forEach(f => {
      const v = getVal('pe_extra_' + f.key);
      if (v) extraData[f.key] = v;
    });

    // 收集样式设置
    const style = getVal('peStyle') || '';
    const examples = getVal('peExamples') || '';
    const tables = getVal('peTables') || '';
    const custom = getVal('peCustomPrompt') || '';

    // 日期
    const date = new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric' });

    // ── 组装 prose-style prompt ──
    let prompt = '';

    // 1. 角色 + 任务
    prompt += `你是一个拥有 20 年 SAP ERP 实施经验的项目经理，正在为以下项目编写文档。\n`;

    // 2. 文档名称 + 当前任务
    prompt += `\n## 文档信息`;
    prompt += `\n- 文档类型：${docType}`;
    prompt += `\n- 文档名称：${docName}`;
    if (task.name) prompt += `\n- 当前任务：${task.name}`;
    if (task.description) prompt += `\n- 任务说明：${task.description}`;

    // 3. 项目基本信息
    prompt += `\n\n## 项目基本信息`;
    if (info.code) prompt += `\n- 项目编号：${info.code}`;
    if (info.name) prompt += `\n- 项目名称：${info.name}`;
    if (info.customerName) prompt += `\n- 客户/公司：${info.customerName}`;
    if (info.projectManager) prompt += `\n- 项目经理：${info.projectManager}`;
    if (info.startDate && info.goLiveDate) {
      prompt += `\n- 项目周期：${fmtDate(info.startDate)} 至 ${fmtDate(info.goLiveDate)}`;
    } else {
      if (info.startDate) prompt += `\n- 开始日期：${fmtDate(info.startDate)}`;
      if (info.goLiveDate) prompt += `\n- 计划上线：${fmtDate(info.goLiveDate)}`;
    }

    // 4. 项目背景信息（只输出有值的）
    const hasAnyBg = currentBg.industry || currentBg.companySize || currentBg.itLandscape ||
      currentBg.painPoints || currentBg.goals || currentBg.modules || currentBg.orgStructure || currentBg.milestones;
    if (hasAnyBg) {
      prompt += `\n\n## 项目背景信息（请根据这些信息个性化文档内容，让文档贴合实际业务场景）`;
      if (currentBg.industry) prompt += `\n- 行业类型：${getIndustryText(currentBg.industry)}`;
      if (currentBg.companySize) prompt += `\n- 企业规模：${getCompanySizeText(currentBg.companySize)}`;
      if (currentBg.itLandscape) prompt += `\n- 现有 IT 架构：${currentBg.itLandscape}`;
      if (currentBg.painPoints) prompt += `\n- 企业痛点：${currentBg.painPoints}`;
      if (currentBg.goals) prompt += `\n- 实施目标：${currentBg.goals}`;
      if (currentBg.modules) prompt += `\n- SAP 模块范围：${currentBg.modules}`;
      if (currentBg.orgStructure) prompt += `\n- 组织架构：${currentBg.orgStructure}`;
      if (currentBg.milestones) prompt += `\n- 关键里程碑：${currentBg.milestones}`;
    }

    // 5. 文档专用补充信息
    if (Object.keys(extraData).length > 0) {
      prompt += `\n\n## 文档专用补充信息`;
      extra.forEach(f => {
        if (extraData[f.key]) prompt += `\n- ${f.label}：${extraData[f.key]}`;
      });
    }

    // 6. 文档风格
    const styleParts = [];
    if (style) styleParts.push(`语言风格：${style}`);
    if (examples) styleParts.push(`示例数据：${examples}`);
    if (tables) styleParts.push(`表格：${tables}`);
    if (styleParts.length > 0) {
      prompt += `\n\n## 文档风格要求`;
      styleParts.forEach(s => prompt += `\n- ${s}`);
    }

    // 7. 补充说明
    if (custom) {
      prompt += `\n\n## 补充说明`;
      prompt += `\n${custom}`;
    }

    // 8. 输出要求
    prompt += `\n\n## 输出要求`;
    prompt += `\n1. 文档头：包含文档编号 (${docType})、版本号 (V1.0)、编制日期 (${date})`;
    prompt += `\n2. 使用 Markdown 格式输出`;
    prompt += `\n3. 使用专业、正式的商务文档语言`;
    prompt += `\n4. 适当使用表格和列表使文档结构清晰`;
    prompt += `\n5. 文档尾包含编制人、审核人、批准人签字栏`;
    prompt += `\n6. 请根据上方项目背景信息，生成贴合实际业务场景的内容，避免空泛`;

    // 9. 文档特定结构要求（针对各文档类型给出明确的章节结构指引）
    const docStructure = DOC_STRUCTURES[docType];
    if (docStructure) {
      prompt += `\n\n## 文档结构要求`;
      prompt += `\n请严格按照以下章节结构生成文档：`;
      docStructure.forEach((s, i) => {
        prompt += `\n${i + 1}. ${s}`;
      });
      prompt += `\n\n> 注意：以上章节结构是本文档的标准框架，请确保覆盖所有章节，每章内容要充实具体，包含实际的业务数据和场景，不要留空或使用占位符。`;
    }

    // 7. 写入文本框
    const preview = document.getElementById('pePromptPreview');
    if (preview) preview.value = prompt;
  },
};

// 辅助：获取元素值
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

// 暴露全局
window.PromptEditor = PromptEditor;
console.log('[PromptEditor] 模块加载完成');
