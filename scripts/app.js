/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 主应用逻辑 - 基础版（用于 project-list 直接访问时的兼容）
 */

// 当前状态
let currentChapterId = 'ch1';
let currentTaskId = null;
let selectedOperation = null;

/**
 * 初始化应用（基础版，用于非项目页面）
 */
async function initAppBase() {
  try {
    // 加载游戏数据
    await GameData.loadGameData();

    // 初始化主题
    initTheme();

    // 渲染章节列表
    renderChapterList();

    // 渲染当前章节
    const firstChapter = GameData.getGameState().currentChapter || 'ch1';
    showChapter(firstChapter);

    // 更新进度条
    updateProgressBar();

    // 更新用户状态显示
    updateUserInfo();

    // 初始化游戏化特性
    if (typeof GameFeatures !== 'undefined') {
      GameFeatures.init();
    }

    console.log('应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
    // 不显示 alert，因为可能被 project-app.js 覆盖
  }
}

/**
 * 初始化主题
 */
function initTheme() {
  const savedTheme = localStorage.getItem('erpSimulationTheme') || 'default';
  applyTheme(savedTheme);
  updateThemeDropdown(savedTheme);

  // 主题切换按钮事件
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dropdown = document.getElementById('themeDropdown');
      dropdown.classList.toggle('active');
    });
  }

  // 主题选项点击事件
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      applyTheme(theme);
      updateThemeDropdown(theme);
      localStorage.setItem('erpSimulationTheme', theme);
      document.getElementById('themeDropdown').classList.remove('active');
    });
  });

  // 点击其他地方关闭主题下拉框
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-switcher')) {
      document.getElementById('themeDropdown').classList.remove('active');
    }
  });
}

/**
 * 应用主题
 */
function applyTheme(theme) {
  document.body.className = '';
  if (theme !== 'default') {
    document.body.classList.add(`theme-${theme}`);
  }
}

/**
 * 更新主题下拉框显示
 */
function updateThemeDropdown(activeTheme) {
  document.querySelectorAll('.theme-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === activeTheme) {
      option.classList.add('active');
    }
  });
}

/**
 * 渲染章节列表
 */
function renderChapterList() {
  const chapterList = document.getElementById('chapterList');
  if (!chapterList) return;

  const chapters = GameData.getGameData().chapters;
  const gameState = GameData.getGameState();

  chapterList.innerHTML = chapters.map(chapter => {
    const isCompleted = chapter.tasks.every(t => t.status === 'completed');
    const isActive = chapter.id === currentChapterId;
    const statusIcon = chapter.locked ? '🔒' : (isCompleted ? '✓' : (isActive ? '►' : ''));
    const statusClass = chapter.locked ? 'locked' : (isCompleted ? 'completed' : '');

    // Use locale keys for chapter name/description
    const nameKey = chapter.id + 'Name';
    const descKey = chapter.id + 'Desc';
    const chapterName = typeof Locale !== 'undefined' ? Locale.t(nameKey) : chapter.name;
    const chapterDesc = typeof Locale !== 'undefined' ? Locale.t(descKey) : chapter.description;

    return `
      <div class="chapter-nav-item ${statusClass} ${isActive ? 'active' : ''}"
           onclick="showChapter('${chapter.id}')">
        <span class="chapter-icon">${chapter.icon}</span>
        <div class="chapter-info">
          <div class="chapter-name">${chapterName}</div>
          <div class="chapter-phase">${chapter.activatePhase}</div>
        </div>
        <span class="chapter-status ${chapter.locked ? 'chapter-lock' : 'chapter-check'}">${statusIcon}</span>
      </div>
    `;
  }).join('');
}

/**
 * 显示指定章节
 */
function showChapter(chapterId) {
  const chapter = GameData.getChapter(chapterId);
  if (!chapter) return;

  // 游客只能访问 Ch.1
  if (chapterId !== 'ch1' && typeof AuthService !== 'undefined' && AuthService.isGuest()) {
    if (typeof AuthService.showRegisterModal === 'function') {
      AuthService.showRegisterModal();
    } else {
      alert(typeof Locale !== 'undefined' ? Locale.t('guestLockMsg') : '🎉 注册账号解锁全部6章内容！');
      window.location.href = 'login.html';
    }
    return;
  }

  // 检查是否已解锁
  if (chapter.locked) {
    alert(typeof Locale !== 'undefined' ? Locale.t('lockedChapterMsg') : '请先完成前置章节以解锁本章节');
    return;
  }

  currentChapterId = chapterId;

  // 渲染章节头部
  renderChapterHeader(chapter);

  // 渲染任务列表
  renderTaskList(chapter);

  // 渲染文档列表
  renderDocumentList(chapter);

  // 重新渲染章节列表以更新选中状态
  renderChapterList();

  // 刷新文件夹树（章节联动高亮）
  if (typeof renderFolderTree === 'function') {
    renderFolderTree();
  }

  // 章节开场动画（首次全屏，再次快速缩略）
  if (typeof ChapterIntro !== 'undefined') {
    ChapterIntro.show(chapterId);
  }

  // 游戏化效果：章节切换时显示 NPC 气泡
  if (typeof GameFeatures !== 'undefined') {
    GameFeatures.onChapterChange(chapterId);
  }
}

/**
 * 渲染章节头部
 */
function renderChapterHeader(chapter) {
  const header = document.getElementById('chapterHeader');
  if (!header) return;

  // Build tool map for locale lookup
  const toolMap = {
    'PowerPoint': 'toolPPTUsage', 'Word': 'toolWordUsage', 'Excel': 'toolExcelUsage',
    'MS Project': 'toolMSProjectUsage', 'Visio': 'toolVisioUsage', 'SAP Signavio': 'toolSignavioUsage',
    'SAP GUI': 'toolSAPGUIUsage', 'Solution Manager': 'toolSolManUsage', 'JIRA': 'toolJIRAUsage',
    'Solution Manager Operations': 'toolSolMonOpsUsage', 'JIRA Operations': 'toolJIRAOpsUsage'
  };

  const toolsHtml = chapter.tools.map(tool => {
    const usageKey = toolMap[tool.name] || null;
    const usageText = usageKey && typeof Locale !== 'undefined' ? Locale.t(usageKey) : tool.usage;
    return `
    <div class="tool-item">
      <span class="tool-icon">${tool.icon}</span>
      <div>
        <span class="tool-name">${tool.name}</span>
        <span class="tool-usage">- ${usageText}</span>
      </div>
    </div>
  `}).join('');

  // 获取章节插画
  const illustrationHtml = (typeof ChapterIllustrations !== 'undefined')
    ? ChapterIllustrations.getSVG(chapter.id) || ''
    : '';

  const nameKey = chapter.id + 'Name';
  const descKey = chapter.id + 'Desc';
  const chapterName = typeof Locale !== 'undefined' ? Locale.t(nameKey) : chapter.name;
  const chapterDesc = typeof Locale !== 'undefined' ? Locale.t(descKey) : chapter.description;

  header.innerHTML = `
    <div class="chapter-title-section">
      <span class="chapter-big-icon">${chapter.icon}</span>
      <h2 class="chapter-title">${chapterName}</h2>
      <span class="chapter-phase-badge">${chapter.activatePhase}</span>
    </div>
    <p class="chapter-description">${chapterDesc}</p>
    ${illustrationHtml}
    <div class="tools-section">
      <span style="color: var(--text-secondary); font-size: 0.85rem; margin-right: 8px;" data-i18n="recommendedTools">${typeof Locale !== 'undefined' ? Locale.t('recommendedTools') : '推荐工具:'}</span>
      ${toolsHtml}
    </div>
  `;
}

/**
 * 渲染任务列表
 */
function renderTaskList(chapter) {
  const taskList = document.getElementById('taskList');
  if (!taskList) return;

  taskList.innerHTML = chapter.tasks.map(task => {
    const statusClass = task.status === 'completed' ? 'completed' :
                        task.status === 'in-progress' ? 'in-progress' : 'pending';
    const statusText = task.status === 'completed' ? '✓' :
                       task.status === 'in-progress' ? '►' : '○';
    const riskClass = task.riskLevel || 'low';
    const riskText = {
      'low': typeof Locale !== 'undefined' ? Locale.t('riskLow') : '低',
      'medium': typeof Locale !== 'undefined' ? Locale.t('riskMedium') : '中',
      'high': typeof Locale !== 'undefined' ? Locale.t('riskHigh') : '高',
      'critical': typeof Locale !== 'undefined' ? Locale.t('riskCritical') : '严重'
    }[riskClass];

    // Use locale keys for task name/description (id: ch1-t1 → key: task_ch1_t1)
    const taskKey = 'task_' + task.id.replace('-', '_');
    const taskDescKey = 'taskDesc_' + task.id.replace('-', '_');
    const taskName = typeof Locale !== 'undefined' ? Locale.t(taskKey) : task.name;
    const taskDesc = typeof Locale !== 'undefined' ? Locale.t(taskDescKey) : task.description;

    return `
      <div class="task-card ${statusClass}">
        <span class="task-status-dot"></span>
        <div class="task-content" onclick="openTaskModal('${task.id}')">
          <div class="task-name">${taskName}</div>
          <div class="task-description">${taskDesc}</div>
          <div class="task-meta">
            <span class="task-risk ${riskClass}">${riskText}</span>
          </div>
        </div>
        <div class="task-actions" style="display:flex;align-items:center;gap:6px;">
          ${task.status === 'completed' ? `<button class="btn-task-reset" onclick="event.stopPropagation();resetTask('${task.id}')" title="重置任务">🔄</button>` : ''}
          <span class="task-action">${statusText}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 渲染文档列表
 */
function renderDocumentList(chapter) {
  const documentList = document.getElementById('documentList');
  if (!documentList) return;

  documentList.innerHTML = chapter.documents.map(doc => {
    const isGenerated = doc.status === 'generated';
    const docKey = 'doc_' + doc.id;
    const docName = typeof Locale !== 'undefined' ? Locale.t(docKey) : doc.name;

    return `
      <div class="document-item ${isGenerated ? 'generated' : ''}">
        <span class="document-icon">${isGenerated ? '📄' : '📝'}</span>
        <div class="document-info">
          <div class="document-name">${docName}</div>
          <div class="document-status">${isGenerated ? (typeof Locale !== 'undefined' ? Locale.t('docGenerated') : '已生成') : (typeof Locale !== 'undefined' ? Locale.t('docNotGenerated') : '未生成')}</div>
        </div>
        <div class="document-actions">
          ${isGenerated ? `
            <button class="btn-doc btn-preview" onclick="openDocumentModal('${doc.id}')">${typeof Locale !== 'undefined' ? Locale.t('btnPreview') : '预览'}</button>
          ` : `
            <button class="btn-doc" disabled style="opacity:0.4;cursor:not-allowed;">${typeof Locale !== 'undefined' ? Locale.t('btnPreview') : '预览'}</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 更新进度条
 */
function updateProgressBar() {
  const gameState = GameData.getGameState();
  const progressFill = document.getElementById('totalProgress');
  const progressPercent = document.getElementById('progressPercent');
  const completedTasks = document.getElementById('completedTasks');
  const totalTasks = document.getElementById('totalTasks');

  if (progressFill) progressFill.style.width = `${gameState.totalProgress}%`;
  if (progressPercent) progressPercent.textContent = `${gameState.totalProgress}%`;
  if (completedTasks) completedTasks.textContent = gameState.completedTasks;
  if (totalTasks) totalTasks.textContent = gameState.totalTasks;
}

/**
 * 打开任务模态框
 */
function openTaskModal(taskId) {
  const task = GameData.getTask(taskId);
  if (!task) return;

  // 检查任务是否已完成
  if (task.status === 'completed') {
    const docId = task.documentType;
    const doc = GameData.getDocument(docId);
    if (doc && doc.status === 'generated') {
      openDocumentModal(docId);
    } else {
      if (typeof CharacterGuide !== 'undefined') {
        CharacterGuide.showMessage('任务已完成 ✅', 'happy', 3000);
      }
    }
    return;
  }

  currentTaskId = taskId;
  selectedOperation = null;

  const modalTitle = document.getElementById('taskModalTitle');
  const modalDesc = document.getElementById('taskModalDescription');
  const modalRisk = document.getElementById('taskModalRisk');
  const modalDoc = document.getElementById('taskModalDocument');
  const modalFolder = document.getElementById('taskModalFolder');
  const btnComplete = document.getElementById('btnCompleteTask');

  if (modalTitle) modalTitle.textContent = task.name;
  if (modalDesc) modalDesc.textContent = task.description;

  const riskText = {
    'low': typeof Locale !== 'undefined' ? Locale.t('riskLow') : '低风险',
    'medium': typeof Locale !== 'undefined' ? Locale.t('riskMedium') : '中等风险',
    'high': typeof Locale !== 'undefined' ? Locale.t('riskHigh') : '高风险',
    'critical': typeof Locale !== 'undefined' ? Locale.t('riskCritical') : '严重风险'
  }[task.riskLevel || 'low'];
  if (modalRisk) modalRisk.textContent = riskText;

  const doc = GameData.getDocument(task.documentType);
  if (modalDoc) modalDoc.textContent = doc ? doc.name : '无';

  // 显示归档目录
  if (modalFolder) {
    const folderKey = ProjectManager ? ProjectManager.getFolderForChapter(currentChapterId) : '01_project_init';
    const folderName = ProjectManager ? ProjectManager.getFolderName(folderKey) : folderKey;
    modalFolder.textContent = folderName;
  }

  // 游客模式：灰化 AI 生成选项
  const opAi = document.getElementById('op-ai');
  const isGuest = typeof AuthService !== 'undefined' && AuthService.isGuest();
  if (isGuest) {
    opAi.style.opacity = '0.4';
    opAi.style.cursor = 'not-allowed';
    opAi.style.pointerEvents = 'none';
    opAi.title = '🔒 注册后解锁 AI 生成功能';
    opAi.onclick = null;
  } else {
    opAi.style.opacity = '';
    opAi.style.cursor = '';
    opAi.style.pointerEvents = '';
    opAi.title = '';
    opAi.onclick = function() { selectOperation('ai'); };
  }

  // 更新完成任务按钮状态
  if (btnComplete) btnComplete.disabled = true;

  // 显示模态框
  document.getElementById('taskModal').classList.add('active');
}

/**
 * 关闭任务模态框
 */
function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('active');
  currentTaskId = null;
  selectedOperation = null;
  document.getElementById('op-manual')?.classList.remove('selected');
  document.getElementById('op-ai')?.classList.remove('selected');
}

/**
 * 选择操作方式
 */
function selectOperation(operation) {
  selectedOperation = operation;

  document.querySelectorAll('.operation-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  document.getElementById(`op-${operation}`)?.classList.add('selected');
  document.getElementById('btnCompleteTask').disabled = false;

  // 绑定完成任务按钮事件
  document.getElementById('btnCompleteTask').onclick = () => {
    if (operation === 'manual') {
      completeTaskManual();
    } else {
      completeTaskAI();
    }
  };
}

/**
 * 手动完成任务
 */
function completeTaskManual() {
  if (!currentTaskId) return;

  console.log('[completeTaskManual] 开始处理任务:', currentTaskId);

  // 更新任务状态
  GameData.updateTaskStatus(currentTaskId, 'completed');

  // 生成标准文档
  const task = GameData.getTask(currentTaskId);
  console.log('[completeTaskManual] task:', task);
  const docType = task ? task.documentType : null;
  console.log('[completeTaskManual] documentType:', docType);
  const docName = docType ? GameData.getDocument(docType)?.name : '文档';

  closeTaskModal();

  // 重新渲染
  const chapter = GameData.getChapter(currentChapterId);
  renderTaskList(chapter);

  if (docType) {
    generateStandardDocument(docType);

    // 验证文档状态是否已更新
    const updatedDoc = GameData.getDocument(docType);
    console.log('[completeTaskManual] 文档更新后状态:', updatedDoc ? updatedDoc.status : 'not found');
  } else {
    console.warn('[completeTaskManual] 文档类型不存在，跳过文档生成');
  }

  renderDocumentList(chapter);
  updateProgressBar();

  // 检查是否触发变更事件
  checkAndTriggerChange();

  // 检查是否所有章节都已完成
  checkAllChaptersComplete();

  // 游戏化效果：任务完成动画
  if (typeof GameFeatures !== 'undefined') {
    GameFeatures.onTaskComplete(task);
  }

  // 提示用户文档已生成
  setTimeout(() => {
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage('✅ 任务完成！文档 "' + docName + '" 已生成，请在右侧预览', 'happy', 5000);
    }
  }, 300);
}

/**
 * AI 完成任务
 */
async function completeTaskAI() {
  if (!currentTaskId) return;

  console.log('[completeTaskAI] 开始执行, currentTaskId =', currentTaskId);

  // 权限检查：只有付费用户可以使用 AI 生成
  if (!isPaidUser()) {
    console.log('[completeTaskAI] 未付费，弹出升级对话框');
    showUpgradeModal();
    return;
  }

  const task = GameData.getTask(currentTaskId);
  console.log('[completeTaskAI] task =', task);
  if (!task || !task.documentType) {
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage('⚠️ 该任务没有关联的文档类型', 'warning', 3000);
    }
    return;
  }

  console.log('[completeTaskAI] task.id =', task.id, ', task.name =', task.name, ', task.documentType =', task.documentType);


  try {
    // 弹出提示词编辑对话框
    let editorResult;
    if (typeof PromptEditor !== 'undefined') {
      const projectInfo = window.currentProjectId
        ? (typeof ProjectManager !== 'undefined' ? ProjectManager.getProjectInfo(window.currentProjectId) : null)
        : null;
      console.log('[completeTaskAI] window.currentProjectId =', window.currentProjectId);
      console.log('[completeTaskAI] projectInfo =', projectInfo ? JSON.stringify({ id: projectInfo.id, name: projectInfo.name, background: projectInfo.background }) : 'null');
      console.log('[completeTaskAI] 弹出 PromptEditor, docType =', task.documentType, ', task.name =', task.name);
      editorResult = await PromptEditor.show(task.documentType, {
        projectInfo: projectInfo || {},
        task: task,
        chapterId: currentChapterId,
      });
      console.log('[completeTaskAI] PromptEditor 确认返回');
    } else {
      // 如果 PromptEditor 未加载，使用默认 prompt
      editorResult = { finalPrompt: null, extraFields: {}, customPrompt: '' };
    }

    // 显示加载状态
    const btnComplete = document.getElementById('btnCompleteTask');
    if (btnComplete) {
      btnComplete.textContent = 'AI 生成中...';
      btnComplete.disabled = true;
    }

    // 调用 AI 生成文档（传入用户编辑后的 prompt）
    // 角色向导进入"AI 生成中"状态，缓解等待冷场
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showAIGenerating(task.name);
    }

    const content = await window.AIDocumentGenerator.generate(
      task.documentType,
      {},
      editorResult?.finalPrompt || null
    );

    console.log('[completeTaskAI] AI 生成完成, docType =', task.documentType);

    // 角色向导显示"完成"动画
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.hideAIGenerating();
    }

    // 更新任务状态
    GameData.updateTaskStatus(currentTaskId, 'completed');

    // 保存 AI 生成的文档
    GameData.updateDocumentStatus(task.documentType, 'generated', content);

    // 保存到项目仓库
    if (window.saveDocumentToRepository && currentProjectId) {
      window.saveDocumentToRepository(task.documentType, content);
    }

    closeTaskModal();

    // 重新渲染
    const chapter = GameData.getChapter(currentChapterId);
    renderTaskList(chapter);
    renderDocumentList(chapter);
    updateProgressBar();

    // 检查是否触发变更事件
    checkAndTriggerChange();

  } catch (error) {
    console.error('AI 生成失败:', error);
    // 用户取消不提示
    if (error.message === '用户取消了 AI 生成') return;
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage('❌ AI 生成失败：' + error.message, 'error', 5000);
    }
  } finally {
    const btnComplete = document.getElementById('btnCompleteTask');
    if (btnComplete) {
      btnComplete.textContent = '完成任务';
      btnComplete.disabled = false;
    }
  }
}

/**
 * 检查是否为付费用户
 */
function isPaidUser() {
  // 检查当前项目是否有支付记录
  if (currentProjectId) {
    const paymentKey = `erp_project_${currentProjectId}_payment`;
    const payment = localStorage.getItem(paymentKey);
    if (payment) {
      try {
        const paymentData = JSON.parse(payment);
        return paymentData.purchased === true;
      } catch (e) {
        return false;
      }
    }
  }
  return false;
}

/**
 * 显示付费升级对话框
 */
function showUpgradeModal() {
  const modal = document.getElementById('upgradeModal');
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  } else {
    // 如果没有模态框，使用 alert 引导
    const user = AuthService.getCurrentUser();
    const isGuest = user && user.isGuest;

    if (isGuest) {
      if (confirm('🔐 AI 文档生成是付费功能。\n\n请先注册账号，然后购买 AI 文档生成套件（￥99/项目）。\n\n点击"确定"前往注册。')) {
        window.location.href = 'login.html';
      }
    } else {
      if (confirm('💳 AI 文档生成是付费功能。\n\n购买 AI 文档生成套件：￥99/项目\n- 37 种标准文档不限量生成\n- 根据项目背景智能定制\n- 支持导出 Word/PDF\n\n点击"确定"前往支付。')) {
        // 打开支付对话框（如果有）
        if (typeof PaymentService !== 'undefined' && PaymentService.showPaymentModal) {
          PaymentService.showPaymentModal(currentProjectId);
        } else {
          alert(typeof Locale !== 'undefined' ? Locale.t('msgPaymentPending') : '支付功能开发中...');
        }
      }
    }
  }
}

/**
 * 生成标准文档（非 AI）
 */
function generateStandardDocument(docId) {
  console.log('[generateStandardDocument] 开始生成文档:', docId);
  const doc = GameData.getDocument(docId);
  if (!doc) {
    console.error('[generateStandardDocument] 文档不存在:', docId);
    return;
  }

  console.log('[generateStandardDocument] 文档名称:', doc.name, '当前状态:', doc.status);

  // 根据用户类型生成不同质量的文档
  const paid = isPaidUser();
  console.log('[generateStandardDocument] 是否付费用户:', paid);
  let content;

  if (paid) {
    // 付费用户：使用文档生成器生成完整模板
    if (window.DocumentGenerator) {
      content = window.DocumentGenerator.generate(docId);
    } else {
      content = '<p>文档模板待生成</p>';
    }
  } else {
    // 游客/未付费用户：生成简化版固定模板
    content = generateSimpleTemplate(docId, doc.name);
  }

  console.log('[generateStandardDocument] 更新文档状态为 generated');
  GameData.updateDocumentStatus(docId, 'generated', content);

  // 验证状态更新
  console.log('[generateStandardDocument] 更新后 doc.status =', doc.status);

  // 保存到项目仓库
  if (window.saveDocumentToRepository && currentProjectId) {
    window.saveDocumentToRepository(docId, content);
  }

  // 重新渲染文档列表
  const chapter = GameData.getChapter(currentChapterId);
  console.log('[generateStandardDocument] 重新渲染文档列表，章节:', currentChapterId, '文档列表:', chapter ? chapter.documents.map(d => d.id + ':' + d.status).join(', ') : 'null');
  renderDocumentList(chapter);
}

/**
 * 生成简化版固定模板（用于游客和未付费用户）
 */
function generateSimpleTemplate(docId, docName) {
  const project = window.ProjectManager && currentProjectId ?
    window.ProjectManager.getProject(currentProjectId) : null;

  const companyName = project ? (project.customerName || project.company || '某某公司') : '某某公司';
  const projectName = project ? project.name : 'ERP 实施项目';

  // 简化的固定模板内容
  return `# ${docName}

## 基本信息

- **客户名称**：${companyName}
- **项目名称**：${projectName}
- **生成时间**：${new Date().toLocaleDateString('zh-CN')}

## 文档说明

> 这是一个简化版文档模板。

### 升级为付费用户解锁完整功能

- ✅ 完整的标准文档模板（37 种文档类型）
- ✅ 根据项目背景智能定制内容
- ✅ 支持导出 Word/PDF 格式
- ✅ AI 智能文档生成

---

## ${docName} - 大纲

### 1. 概述
（此处为简化版内容，付费后显示完整内容）

### 2. 主要内容
（此处为简化版内容，付费后显示完整内容）

### 3. 总结
（此处为简化版内容，付费后显示完整内容）

---

*付费解锁完整文档内容，立即体验 AI 智能文档生成服务！*
`;
}

/**
 * 生成文档
 */
function generateDocument(docId) {
  const task = GameData.getTask(currentTaskId);
  if (task && task.documentType === docId) {
    // 如果当前有选中的任务，直接从任务生成
    if (selectedOperation === 'ai') {
      completeTaskAI();
    } else {
      completeTaskManual();
    }
  } else {
    // 否则直接生成文档
    generateStandardDocument(docId);
  }
}

/**
 * 打开文档预览模态框
 */
async function openDocumentModal(docId) {
  const doc = GameData.getDocument(docId);
  if (!doc) return;

  const modalTitle = document.getElementById('documentModalTitle');
  if (modalTitle) modalTitle.textContent = doc.name;

  // 优先级 1：从 IndexedDB 读取（最可靠）
  let content = null;
  const projectId = (typeof currentProjectId !== 'undefined') ? currentProjectId : '';
  if (projectId) {
    const fileDoc = await DocumentFileStore.load(projectId, docId);
    if (fileDoc && fileDoc.content) {
      content = fileDoc.content;
    }
  }

  // 优先级 2：从 gameState 读取（localStorage）
  if (!content) {
    const generatedDoc = GameData.getGeneratedDocument(docId);
    if (generatedDoc && generatedDoc.content) {
      content = generatedDoc.content;
    }
  }

  // 优先级 3：重新生成模板
  if (!content && window.DocumentGenerator) {
    content = window.DocumentGenerator.generate(docId);
  }

  // 仍然没有内容，报错
  if (!content) {
    content = '<p style="color:#dc3545;text-align:center;padding:40px;">文件链接无效（可能被移动了位置）</p>';
  }

  // 渲染 Markdown
  const renderedContent = (content && (content.includes('#') || content.includes('##')))
    ? MarkdownRenderer.renderFullDocument(doc.name, content)
    : content;

  document.getElementById('documentContent').innerHTML = renderedContent;
  document.getElementById('documentModal').classList.add('active');

  // 保存当前预览文档 ID
  window.currentPreviewDocId = docId;
}

/**
 * 关闭文档预览模态框
 */
function closeDocumentModal() {
  document.getElementById('documentModal').classList.remove('active');
}

/**
 * 导出文档
 */
function exportDocument() {
  const docId = window.currentPreviewDocId;
  if (!docId) return;

  const doc = GameData.getDocument(docId);
  const generatedDoc = GameData.getGeneratedDocument(docId);

  if (!doc) return;

  const content = generatedDoc?.content || '文档内容';
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.name}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 检查并触发变更事件
 */
function checkAndTriggerChange() {
  if (GameData.shouldTriggerChange(currentChapterId)) {
    const scenario = GameData.getChangeScenario(currentChapterId);
    if (scenario) {
      showChangeModal(scenario);
    }
  }
}

/**
 * 显示变更管理模态框
 */
function showChangeModal(scenario) {
  const changeAlertDesc = document.getElementById('changeAlertDesc');
  const changeImpactSchedule = document.getElementById('changeImpactSchedule');
  const changeImpactCost = document.getElementById('changeImpactCost');

  // currentChapterId = 'ch1', locale key = 'change_ch1' / 'change_ch1d'
  const changeKey = 'change_' + currentChapterId; // 'change_ch1'
  const changeDescKey = 'change_' + currentChapterId + 'd'; // 'change_ch1d'

  if (changeAlertDesc) changeAlertDesc.textContent = typeof Locale !== 'undefined' ? (Locale.t(changeDescKey) || scenario.description) : scenario.description;
  if (changeImpactSchedule) changeImpactSchedule.textContent = `+${scenario.impact.schedule} ${typeof Locale !== 'undefined' ? Locale.t('dayUnit') : '天'}`;
  if (changeImpactCost) changeImpactCost.textContent = `+${typeof Locale !== 'undefined' ? Locale.t('costPrefix') : '￥'}${scenario.impact.cost.toLocaleString()}`;

  // 游戏化效果：变更触发
  if (typeof GameFeatures !== 'undefined') {
    GameFeatures.onChangeTrigger(scenario);
  }

  // 重置步骤状态
  for (let i = 1; i <= 6; i++) {
    const step = document.getElementById(`changeStep${i}`);
    if (step) step.className = 'change-step';
  }

  // 高亮第一步
  const step1 = document.getElementById('changeStep1');
  if (step1) step1.classList.add('active');

  // 存储当前变更场景
  window.currentChangeScenario = scenario;

  document.getElementById('changeModal').classList.add('active');
}

/**
 * 关闭变更管理模态框
 */
function closeChangeModal() {
  document.getElementById('changeModal').classList.remove('active');
}

/**
 * 批准变更
 */
function approveChange() {
  const scenario = window.currentChangeScenario;
  if (!scenario) return;

  // 添加变更请求记录
  GameData.addChangeRequest(scenario);

  // 更新变更步骤
  for (let i = 1; i <= 6; i++) {
    const step = document.getElementById(`changeStep${i}`);
    if (step) step.classList.add('completed');
  }

  // 显示成功消息
  if (typeof CharacterGuide !== 'undefined') {
    CharacterGuide.showMessage(typeof Locale !== 'undefined' ? Locale.t('msgChangeApproved').replace('{days}', scenario.impact.schedule).replace('{cost}', scenario.impact.cost.toLocaleString()) : '变更已批准！延迟 ' + scenario.impact.schedule + ' 天，成本增加 ￥' + scenario.impact.cost.toLocaleString(), 'happy', 4000);
  }

  closeChangeModal();
}

/**
 * 检查所有章节是否完成
 */
function checkAllChaptersComplete() {
  const chapters = GameData.getGameData().chapters;
  const allComplete = chapters.every(chapter => {
    return chapter.tasks.every(task => task.status === 'completed');
  });

  if (allComplete) {
    setTimeout(() => {
      if (typeof CharacterGuide !== 'undefined') {
        CharacterGuide.showMessage(typeof Locale !== 'undefined' ? Locale.t('msgAllChaptersDone') : '🎉 恭喜完成全部演练！你已掌握 SAP 上线全流程！', 'happy', 6000);
      }
    }, 500);
  }
}

/**
 * 重置单个任务（恢复未完成状态）
 */
function resetTask(taskId) {
  if (!confirm('确定要重置该任务吗？\n任务状态将恢复为未完成，关联的文档也会被清除。')) {
    return;
  }

  const task = GameData.getTask(taskId);
  if (!task) return;

  const docId = task.documentType;

  // 重置任务状态
  GameData.updateTaskStatus(taskId, 'pending');

  // 重置关联文档状态和内容（仅当没有其他任务依赖该文档时）
  if (docId) {
    const chapters = GameData.getGameData().chapters;
    const otherTaskForDoc = chapters.some(ch =>
      ch.tasks.some(t => t.documentType === docId && t.id !== taskId)
    );
    if (!otherTaskForDoc) {
      GameData.updateDocumentStatus(docId, 'pending', '');
      DocumentFileStore.remove(typeof currentProjectId !== 'undefined' ? currentProjectId : '', docId);
    }
  }

  // 清除项目仓库中的文档文件
  if (typeof currentProjectId !== 'undefined' && currentProjectId && typeof ProjectManager !== 'undefined') {
    ProjectManager.removeFileByDocType(currentProjectId, docId);
  }

  // 重新渲染
  const chapter = GameData.getChapter(currentChapterId);
  renderTaskList(chapter);
  renderDocumentList(chapter);
  updateProgressBar();

  // 刷新项目文件列表
  if (typeof renderCurrentFolderFiles === 'function') {
    renderCurrentFolderFiles();
  }
}

// 暴露全局函数
window.showChapter = showChapter;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.selectOperation = selectOperation;
window.completeTaskManual = completeTaskManual;
window.completeTaskAI = completeTaskAI;
window.generateDocument = generateDocument;
window.openDocumentModal = openDocumentModal;
window.closeDocumentModal = closeDocumentModal;
window.exportDocument = exportDocument;
window.closeChangeModal = closeChangeModal;
window.approveChange = approveChange;
window.resetTask = resetTask;
window.updateUserInfo = updateUserInfo;

// 登录对话框 Tab 切换
window.switchLoginTab = function(tab) {
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');

  if (tab === 'signIn') {
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
    tabSignIn.style.color = 'var(--primary-color)';
    tabSignIn.style.borderBottom = '2px solid var(--primary-color)';
    tabSignUp.style.color = '#999';
    tabSignUp.style.borderBottom = '2px solid transparent';
  } else {
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    tabSignUp.style.color = 'var(--primary-color)';
    tabSignUp.style.borderBottom = '2px solid var(--primary-color)';
    tabSignIn.style.color = '#999';
    tabSignIn.style.borderBottom = '2px solid transparent';
  }
};

// 处理登录
window.handleSignIn = async function() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    errorEl.textContent = '请输入邮箱和密码';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  const result = await AuthService.signInWithEmail(email, password);

  if (result.success) {
    AuthService.closeLoginModal();
    window.dispatchEvent(new CustomEvent('auth:login', { detail: result.user }));
    // 关键：登录成功后必须重定向到项目列表
    // 因为当前页面仍在显示游客项目（currentProjectId 指向游客项目）
    // 注册用户需要看到自己的项目
    window.location.replace('project-list.html?_=' + Date.now());
  } else {
    errorEl.textContent = result.error || '登录失败';
    errorEl.style.display = 'block';
  }
};

// 处理注册
window.handleSignUp = async function() {
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');

  if (!email || !password) {
    errorEl.textContent = '请输入邮箱和密码';
    errorEl.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = '密码至少 6 位';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  const result = await AuthService.signUpWithEmail(email, password);

  if (result.success) {
    AuthService.closeLoginModal();
    window.dispatchEvent(new CustomEvent('auth:login', { detail: result.user }));
    // 关键：注册成功后必须重定向到项目列表
    // 游客项目数据不应和新注册用户关联
    window.location.replace('project-list.html?_=' + Date.now());
  } else {
    errorEl.textContent = result.error || '注册失败';
    errorEl.style.display = 'block';
  }
};

// 处理登录按钮点击
window.handleLoginAction = function() {
  if (typeof AuthService === 'undefined') return;

  // 已登录（含游客）：退出
  if (AuthService.isLoggedIn()) {
    if (confirm(typeof Locale !== 'undefined' ? Locale.t('msgLogoutConfirm') : '确定要退出登录吗？')) {
      // 判断是否为游客
      const user = AuthService.getCurrentUser();
      const isGuest = user && user.isGuest;
      const currentUserId = user ? user.id : null;

      // 清除认证信息
      localStorage.removeItem('erpSimulationUser');
      localStorage.removeItem('erpSimulationCurrentUser');

      // 游客退出：只清除游客自己创建的项目（按 createdBy 匹配）
      if (isGuest && currentUserId) {
        const allProjects = ProjectManager.getAllProjects();
        const guestProjectIds = [];
        const remainingProjects = [];

        allProjects.forEach(p => {
          if (p.createdBy === currentUserId) {
            guestProjectIds.push(p.id);
          } else {
            remainingProjects.push(p);
          }
        });

        // 更新项目列表（保留非游客创建的项目）
        ProjectManager.saveProjects(remainingProjects);

        // 清除游客创建的项目存储数据
        guestProjectIds.forEach(pid => {
          localStorage.removeItem(`erp_project_${pid}`);
        });

        // 清理 IndexedDB 中游客的文档缓存
        if (typeof DocumentFileStore !== 'undefined') {
          guestProjectIds.forEach(pid => {
            DocumentFileStore.clearByProjectId(pid).catch(() => {});
          });
        }
      }

      // 调用 AuthService
      AuthService.signOut(isGuest);
      window.location.replace('login.html?_=' + Date.now());
    }
  } else {
    // 未登录：弹出登录对话框
    AuthService.showLoginModal();
  }
};

// 更新用户信息显示
function updateUserInfo() {
  try {
    const user = AuthService.getCurrentUser();
    const displayNameEl = document.getElementById('userDisplayName');
    const loginBtn = document.getElementById('btnLogin');
    if (!displayNameEl || !loginBtn) return;

    if (user && !user.isGuest) {
      displayNameEl.textContent = user.email || user.displayName || (typeof Locale !== 'undefined' ? Locale.t('userLoggedIn') : '用户');
      loginBtn.textContent = typeof Locale !== 'undefined' ? Locale.t('btnLogoutShort') : '退出';
    } else if (user && user.isGuest) {
      displayNameEl.textContent = user.displayName || (typeof Locale !== 'undefined' ? Locale.t('userGuest') : '游客');
      loginBtn.textContent = typeof Locale !== 'undefined' ? Locale.t('btnGuestLogoutShort') : '游客退出';
    } else {
      displayNameEl.textContent = typeof Locale !== 'undefined' ? Locale.t('userGuest') : '游客';
      loginBtn.textContent = typeof Locale !== 'undefined' ? Locale.t('btnLogin') : '登录';
    }
  } catch (e) {
    console.error('updateUserInfo 失败:', e);
  }
}

console.log('App base loaded');
