/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 项目应用逻辑 - 集成项目管理功能
 */

// 当前状态
let currentProjectId = null;
let currentFolderKey = '01_project_init';
let projectData = null;
let projectDirHandle = null; // 本地文件夹句柄（File System Access API）
let projectFolderName = ''; // 项目文件夹名称

/**
 * 用户选择项目保存文件夹
 */
async function selectSaveFolder() {
  if (!('showDirectoryPicker' in window)) {
    alert(typeof Locale !== 'undefined' ? Locale.t('msgBrowserNotSupported') : '当前浏览器不支持文件夹选择功能。\n\n请使用 Chromium 内核浏览器（Chrome、Edge 等）。\n\n替代方案：点击顶部"📦 导出交付物"按钮手动导出。');
    return;
  }

  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'downloads',
    });

    // 创建项目专属子文件夹
    const projectInfo = ProjectManager.getProjectInfo(currentProjectId);
    const folderName = projectInfo ? (projectInfo.name + '_' + projectInfo.code).replace(/[^a-zA-Z0-9一-龥_-]/g, '_') : 'ERP_Project';

    // 在选定的位置创建项目子文件夹
    const projectDir = await dirHandle.getDirectoryHandle(folderName, { create: true });

    // 保存句柄
    projectDirHandle = projectDir;
    projectFolderName = folderName;

    // 创建 8 个标准子文件夹
    for (const folder of ProjectManager.FOLDER_STRUCTURE) {
      await projectDir.getDirectoryHandle(folder.name, { create: true });
    }

    // 更新按钮状态
    const btn = document.getElementById('btnSaveLocation');
    btn.textContent = typeof Locale !== 'undefined' ? Locale.t('msgSavedLocationBtn') : '✅ 已选择保存位置';
    btn.style.background = 'linear-gradient(135deg,#4caf50,#388e3c)';
    btn.disabled = true;

    const status = document.getElementById('saveLocationStatus');
    status.textContent = folderName;

    // 重新保存所有已有文件到本地
    const savedCount = await saveExistingFilesToFolder();

    const extraMsg = savedCount > 0 ? `\n\n${typeof Locale !== 'undefined' ? Locale.t('msgSavedLocationSync') : '已将之前生成的'} ${savedCount} ${typeof Locale !== 'undefined' ? Locale.t('msgSavedLocationSync2') : '个文档同步到本地文件夹。之后完成任务生成的文档会自动保存到对应子文件夹中。'}` : '';
    alert(`${typeof Locale !== 'undefined' ? Locale.t('msgSavedLocation') : '✅ 已选择保存位置！\n\n项目文件夹：'}${folderName}${typeof Locale !== 'undefined' ? Locale.t('msgSavedLocationFolders') : '\n10 个标准子文件夹已创建。'}${extraMsg}`);
  } catch (err) {
    if (err.name === 'AbortError') {
      // 用户取消了选择
      return;
    }
    alert((typeof Locale !== 'undefined' ? Locale.t('msgSelectFolderFail') : '选择文件夹失败：') + err.message);
  }
}

/**
 * 将已有文件保存到本地文件夹
 * 从 gameState.documents + IndexedDB 双源读取内容
 */
async function saveExistingFilesToFolder() {
  if (!projectDirHandle) return;

  const gameState = GameData.getGameState();
  const savedDocs = gameState.documents || {};
  const files = projectData.project.files || {};
  let successCount = 0;

  // 先从 localStorage 保存已知文件
  for (const file of Object.values(files)) {
    if (file.content) {
      const ok = await saveFileToFolder(file.folderKey, file.name, file.content);
      if (ok) successCount++;
    }
  }

  // 构建 docId → chapterId 映射，用于定位文件夹
  const docToChapter = {};
  const chapterFolderMap = ProjectManager.CHAPTER_FOLDER_MAP;
  for (const chapter of GameData.getGameData().chapters) {
    const folderKey = chapterFolderMap[chapter.id] ? chapterFolderMap[chapter.id][0] : null;
    for (const doc of chapter.documents) {
      docToChapter[doc.id] = folderKey;
    }
  }

  // 从 gameState 查找已生成但文件里没有的文档
  for (const [docId, docData] of Object.entries(savedDocs)) {
    if (docData.status === 'generated' && docData.content) {
      const folderKey = docToChapter[docId] || '01_project_init';
      const doc = GameData.getDocument(docId);
      const fileName = doc ? `${doc.name.replace(/[^a-zA-Z0-9一-龥]/g, '_')}.md` : `${docId}.md`;
      const ok = await saveFileToFolder(folderKey, fileName, docData.content);
      if (ok) successCount++;
    }
  }

  // 从 IndexedDB 反查可能遗漏的大文件
  try {
    const indexedDocs = await DocumentFileStore.listByProject(currentProjectId);
    for (const docId of indexedDocs) {
      const content = await DocumentFileStore.load(currentProjectId, docId);
      if (content) {
        const folderKey = docToChapter[docId] || '01_project_init';
        const doc = GameData.getDocument(docId);
        const fileName = doc ? `${doc.name.replace(/[^a-zA-Z0-9一-龥]/g, '_')}.md` : `${docId}.md`;
        const ok = await saveFileToFolder(folderKey, fileName, content);
        if (ok) successCount++;
      }
    }
  } catch (e) {
    console.warn('IndexedDB 反查失败:', e);
  }

  console.log(`[saveExistingFiles] 成功保存 ${successCount} 个文档到本地`);
  return successCount;
}

/**
 * 将文件保存到本地文件夹（实时写入）
 */
async function saveFileToFolder(folderKey, fileName, content) {
  if (!projectDirHandle) return false;

  try {
    const folderInfo = ProjectManager.FOLDER_STRUCTURE.find(f => f.key === folderKey);
    const folderDisplayName = folderInfo ? folderInfo.name : 'other';

    const subDir = await projectDirHandle.getDirectoryHandle(folderDisplayName, { create: true });
    const fileHandle = await subDir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch (err) {
    console.error(`保存文件失败 [${folderKey}/${fileName}]:`, err);
    return false;
  }
}

/**
 * 从 IndexedDB 反查文档内容，同步文档状态
 * 解决：localStorage 数据丢失/不一致导致"文件夹有文件但文档列表显示未生成"
 */
async function syncDocumentStatusFromIndexedDB() {
  if (!currentProjectId) return;

  try {
    const indexedDocs = await DocumentFileStore.listByProject(currentProjectId);
    if (!indexedDocs || indexedDocs.length === 0) return;

    const gameState = GameData.getGameState();

    for (const docEntry of indexedDocs) {
      const docId = docEntry.docId;
      if (!docId || !docEntry.content) continue;

      // 更新 chapter.documents 中的状态
      const chapters = GameData.getGameData().chapters;
      for (const chapter of chapters) {
        const doc = chapter.documents.find(d => d.id === docId);
        if (doc && doc.status !== 'generated') {
          doc.status = 'generated';
        }
      }

      // 同步 gameState 状态
      if (!gameState.documents[docId]) {
        gameState.documents[docId] = {};
      }
      gameState.documents[docId].status = 'generated';
      gameState.documents[docId].content = docEntry.content;
      gameState.documents[docId].generatedAt = docEntry.savedAt;
    }

    // 重新计算进度
    GameData.updateGameStateProgress();

    // 持久化同步后的状态到 localStorage
    GameData.saveGameState();
  } catch (err) {
    console.error('从 IndexedDB 同步文档状态失败:', err);
  }
}

/**
 * 初始化应用
 */
async function initApp() {
  try {
    // 获取当前项目
    currentProjectId = ProjectManager.getCurrentProjectId();
    if (!currentProjectId) {
      window.location.href = 'project-list.html';
      return;
    }

    // 同步到 window 全局（app.js 的 completeTaskAI 需要使用）
    window.currentProjectId = currentProjectId;

    // 加载项目数据
    projectData = ProjectManager.getProjectData(currentProjectId);
    if (!projectData) {
      alert(typeof Locale !== 'undefined' ? Locale.t('msgDataLoadFail') : '项目数据加载失败');
      // 游客可能因旧数据被清理而找不到项目，清除 currentProjectId 避免循环重定向
      if (typeof AuthService !== 'undefined' && AuthService.isGuest()) {
        localStorage.removeItem('erpSimulationCurrentProject');
      }
      window.location.href = 'project-list.html';
      return;
    }

    // 加载游戏数据
    await GameData.loadGameData();

    // 同步项目状态到游戏数据
    syncProjectState();

    // 从 IndexedDB 反查文档内容，同步文档状态（解决数据不一致问题）
    await syncDocumentStatusFromIndexedDB();

    // 初始化主题
    initTheme();

    // 渲染项目信息
    renderProjectInfo();

    // 渲染章节列表
    renderChapterList();

    // 渲染文件夹树
    renderFolderTree();

    // 显示当前章节
    const savedChapter = projectData.gameState.currentChapter || 'ch1';
    showChapter(savedChapter);

    // 更新进度条
    updateProgressBar();

    console.log('应用初始化完成');

    // 初始化游戏化特性（NPC 气泡 + 角色向导）
    if (typeof GameFeatures !== 'undefined') {
      GameFeatures.init();
    }
  } catch (error) {
    console.error('应用初始化失败:', error);
    alert((typeof Locale !== 'undefined' ? Locale.t('msgInitFail') : '应用初始化失败：') + error.message);
  } finally {
    // 更新用户状态显示 — 无论前面是否出错都执行
    if (typeof updateUserInfo === 'function') updateUserInfo();
  }
}

/**
 * 同步项目状态到游戏数据
 */
function syncProjectState() {
  const gameState = projectData.gameState;

  // 将项目状态应用到游戏数据
  GameData.getGameState().currentChapter = gameState.currentChapter || 'ch1';
  GameData.getGameState().tasks = gameState.tasks || {};
  GameData.getGameState().documents = gameState.documents || {};

  // 更新任务状态
  GameData.getGameData().chapters.forEach(chapter => {
    chapter.tasks.forEach(task => {
      const taskState = gameState.tasks[task.id];
      if (taskState) {
        task.status = taskState.status;
      }
    });

    // 恢复文档状态
    chapter.documents.forEach(doc => {
      const docState = gameState.documents[doc.id];
      if (docState) {
        doc.status = docState.status || 'pending';
      }
    });
  });
}

/**
 * 渲染项目信息
 */
function renderProjectInfo() {
  const projectInfo = ProjectManager.getProjectInfo(currentProjectId);
  if (!projectInfo) return;

  const t = typeof Locale !== 'undefined' ? Locale.t.bind(Locale) : (k => k);

  // 更新页面标题
  document.getElementById('projectNameDisplay').textContent = `${projectInfo.name} - ERP ${t('infoProject') || '实施项目'}`;

  // 渲染项目信息面板
  const infoBody = document.getElementById('projectInfoBody');
  infoBody.innerHTML = `
    <div class="info-section">
      <div class="info-section-title">${t('infoBasic')}</div>
      <div class="info-item">
        <span class="info-label">${t('infoCode')}</span>
        <span class="info-value">${projectInfo.code}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoName')}</span>
        <span class="info-value">${projectInfo.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoCustomer')}</span>
        <span class="info-value">${projectInfo.customerName}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoPM')}</span>
        <span class="info-value">${projectInfo.projectManager || t('notSpecified')}</span>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title">${t('infoSchedule')}</div>
      <div class="info-item">
        <span class="info-label">${t('infoStart')}</span>
        <span class="info-value">${projectInfo.startDate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoGoLive')}</span>
        <span class="info-value">${projectInfo.goLiveDate}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoCreated')}</span>
        <span class="info-value">${new Date(projectInfo.createdAt).toLocaleDateString('zh-CN')}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoUpdated')}</span>
        <span class="info-value">${new Date(projectInfo.updatedAt).toLocaleDateString('zh-CN')}</span>
      </div>
    </div>

    <div class="info-section">
      <div class="info-section-title">${t('infoStats')}</div>
      <div class="info-item">
        <span class="info-label">${t('infoDocCount')}</span>
        <span class="info-value">${Object.keys(projectData.project.files || {}).length} ${t('infoDocUnit')}</span>
      </div>
      <div class="info-item">
        <span class="info-label">${t('infoFolders')}</span>
        <span class="info-value">${ProjectManager.FOLDER_STRUCTURE.length} 个（${Object.keys(ProjectManager.CHAPTER_FOLDER_MAP).length} 个阶段）</span>
      </div>
    </div>
  `;

  // 项目背景信息（如果有）
  const background = projectInfo.background;
  if (background && Object.keys(background).length > 0) {
    const hasAnyBg = background.industry || background.companySize || background.itLandscape ||
      background.painPoints || background.goals || background.modules ||
      background.orgStructure || background.milestones;

    if (hasAnyBg) {
      const industryMap = {
        manufacturing: t('bgIndustry_manufacturing'), finance: t('bgIndustry_finance'), retail: t('bgIndustry_retail'),
        pharma: t('bgIndustry_pharma'), energy: t('bgIndustry_energy'), telecom: t('bgIndustry_telecom'),
        government: t('bgIndustry_government'), other: t('bgIndustry_other')
      };
      const sizeMap = {
        small: t('bgSize_small'), medium: t('bgSize_medium'),
        large: t('bgSize_large'), enterprise: t('bgSize_enterprise')
      };

      infoBody.innerHTML += `
        <div class="info-section">
          <div class="info-section-title">📋 ${t('infoBgTitle')}</div>
          ${background.industry ? `<div class="info-item"><span class="info-label">${t('infoBgIndustry')}</span><span class="info-value">${industryMap[background.industry] || background.industry}</span></div>` : ''}
          ${background.companySize ? `<div class="info-item"><span class="info-label">${t('infoBgSize')}</span><span class="info-value">${sizeMap[background.companySize] || background.companySize}</span></div>` : ''}
          ${background.itLandscape ? `<div class="info-item"><span class="info-label">${t('infoBgIT')}</span><span class="info-value">${background.itLandscape}</span></div>` : ''}
          ${background.painPoints ? `<div class="info-item"><span class="info-label">${t('infoBgPain')}</span><span class="info-value">${background.painPoints}</span></div>` : ''}
          ${background.goals ? `<div class="info-item"><span class="info-label">${t('infoBgGoals')}</span><span class="info-value">${background.goals}</span></div>` : ''}
          ${background.modules ? `<div class="info-item"><span class="info-label">${t('infoBgModules')}</span><span class="info-value">${background.modules}</span></div>` : ''}
          ${background.orgStructure ? `<div class="info-item"><span class="info-label">${t('infoBgOrg')}</span><span class="info-value">${background.orgStructure}</span></div>` : ''}
          ${background.milestones ? `<div class="info-item"><span class="info-label">${t('infoBgMilestones')}</span><span class="info-value">${background.milestones}</span></div>` : ''}
        </div>
      `;
    }
  }

  infoBody.innerHTML += `
    <div class="info-section">
      <div class="info-section-title">${t('infoRaw')}</div>
      <button class="btn-toolbar" onclick="showRawJson()">${t('btnViewJson')}</button>
    </div>
  `;
}

/**
 * 渲染文件夹树
 */
function renderFolderTree() {
  const folderTree = document.getElementById('folderTree');
  const folders = ProjectManager.FOLDER_STRUCTURE;
  const linkedFolderKeys = (ProjectManager.CHAPTER_FOLDER_MAP[currentChapterId] || []);
  const t = typeof Locale !== 'undefined' ? Locale.t.bind(Locale) : (k => k);

  folderTree.innerHTML = folders.map(folder => {
    const localeKey = 'folder_' + folder.key;
    const displayName = t(localeKey) !== localeKey ? t(localeKey) : folder.name;
    const fileCount = Object.values(projectData.project.files || {})
      .filter(f => f.folderKey === folder.key).length;
    const isActive = folder.key === currentFolderKey;
    const isLinked = linkedFolderKeys.includes(folder.key);
    const expected = folder.expectedDocCount || 0;
    const pct = expected > 0 ? Math.round(fileCount / expected * 100) : 0;

    return `
      <div class="folder-item">
        <div class="folder-header ${isActive ? 'active' : ''} ${isLinked && !isActive ? 'chapter-linked' : ''}"
             onclick="selectFolder('${folder.key}')">
          <span class="folder-icon">📁</span>
          <div class="folder-body">
            <div class="folder-name">${displayName}</div>
            <div class="folder-meta">
              <span class="folder-count">${fileCount}/${expected}</span>
              <div class="folder-progress-track">
                <div class="folder-progress-fill" style="width:${pct}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 选择文件夹
 */
function selectFolder(folderKey) {
  currentFolderKey = folderKey;
  window.currentFolderKey = folderKey;
  renderFolderTree();
  renderCurrentFolderFiles();
}

/**
 * 渲染当前文件夹文件列表
 */
function renderCurrentFolderFiles() {
  const fileList = document.getElementById('currentFolderFiles');
  const files = ProjectManager.getFilesInFolder(currentProjectId, currentFolderKey);

  if (files.length === 0) {
    fileList.innerHTML = `<div style="color: #999; font-size: 0.85rem; padding: 10px;">${typeof Locale !== 'undefined' ? Locale.t('noFiles') : '暂无文件'}</div>`;
    return;
  }

  fileList.innerHTML = files.map(file => `
    <div class="file-item" onclick="openFilePreview('${file.id}')">
      <span class="file-icon">📄</span>
      <span class="file-name">${file.name}</span>
      <div class="file-actions" onclick="event.stopPropagation()">
        <button class="btn-file-action" onclick="copyFileContent('${file.id}')" title="复制">📋</button>
        <button class="btn-file-action" onclick="downloadFile('${file.id}')" title="下载">⬇️</button>
      </div>
    </div>
  `).join('');
}

/**
 * 打开文件预览
 */
function openFilePreview(fileId) {
  const file = projectData.project.files[fileId];
  if (!file) return;

  const content = MarkdownRenderer.render(file.content);
  document.getElementById('documentModalTitle').textContent = file.name;
  document.getElementById('documentContent').innerHTML = content;
  document.getElementById('documentModal').classList.add('active');

  // 保存当前预览文件 ID
  window.currentPreviewFileId = fileId;
}

/**
 * 复制文件内容
 */
async function copyFileContent(fileId) {
  const file = projectData.project.files[fileId];
  if (!file) return;

  await MarkdownRenderer.copyToClipboard(file.content);
  alert(typeof Locale !== 'undefined' ? Locale.t('msgCopied') : '已复制到剪贴板');
}

/**
 * 下载文件
 */
function downloadFile(fileId) {
  const file = projectData.project.files[fileId];
  if (!file) return;

  // 根据内容类型决定导出格式
  const isMarkdown = file.content.includes('#') || file.content.includes('##');
  if (isMarkdown) {
    MarkdownRenderer.exportMarkdown(`${file.name}.md`, file.content);
  } else {
    ProjectManager.downloadFile(`${file.name}.txt`, file.content);
  }
}

/**
 * 导出所有交付物到本地文件夹
 * 支持两种方式：
 * 1. File System Access API（现代 Chromium 浏览器）- 用户选择文件夹，直接写入
 * 2. 回退方案（所有浏览器）- 逐个下载文件
 */
async function exportAllDeliverables() {
  const files = projectData.project.files;
  const fileCount = Object.keys(files).length;

  if (fileCount === 0) {
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage(typeof Locale !== 'undefined' ? Locale.t('msgNoFilesExport') : '⚠️ 暂无交付物可导出，请先完成任务生成文档', 'warning', 3000);
    }
    return;
  }

  // 从 IndexedDB 加载可能缺失的内容
  for (const file of Object.values(files)) {
    if (!file.content) {
      const docId = file.metadata?.docType;
      if (docId) {
        const content = await DocumentFileStore.load(currentProjectId, docId);
        if (content) file.content = content;
      }
    }
  }

  const projectInfo = ProjectManager.getProjectInfo(currentProjectId);
  const folderName = (projectInfo ? projectInfo.name : 'ERP_Deliverables').replace(/[^a-zA-Z0-9一-龥_-]/g, '_');

  // 检查 File System Access API 支持
  if ('showDirectoryPicker' in window) {
    try {
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'downloads',
      });

      await exportToDirectory(dirHandle, files, folderName);
      return;
    } catch (err) {
      if (err.name === 'AbortError') {
        // 用户取消了选择
        return;
      }
      // 其他错误，回退到逐个下载
      console.warn('File System Access API 失败，回退到逐个下载:', err);
    }
  }

  // 回退方案：逐个下载
  exportByDownloads(files, folderName);
}

/**
 * 通过 File System Access API 写入文件夹
 */
async function exportToDirectory(dirHandle, files, folderName) {
  // 按文件夹分组
  const folderGroups = {};
  ProjectManager.FOLDER_STRUCTURE.forEach(f => {
    folderGroups[f.key] = [];
  });

  Object.values(files).forEach(file => {
    if (folderGroups[file.folderKey]) {
      folderGroups[file.folderKey].push(file);
    }
  });

  let totalFiles = 0;
  let successCount = 0;

  // 创建项目根文件夹
  const projectDir = await dirHandle.getDirectoryHandle(folderName, { create: true });

  for (const [folderKey, folderFiles] of Object.entries(folderGroups)) {
    if (folderFiles.length === 0) continue;

    const folderInfo = ProjectManager.FOLDER_STRUCTURE.find(f => f.key === folderKey);
    const folderDisplayName = folderInfo ? folderInfo.name : folderKey;

    // 创建子文件夹
    const subDir = await projectDir.getDirectoryHandle(folderDisplayName, { create: true });

    for (const file of folderFiles) {
      totalFiles++;
      try {
        const fileHandle = await subDir.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.content);
        await writable.close();
        successCount++;
      } catch (err) {
        console.error(`写入文件失败 ${file.name}:`, err);
      }
    }
  }

  if (successCount === totalFiles) {
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage(`✅ ${typeof Locale !== 'undefined' ? Locale.t('msgExportSuccess') : '导出成功！共导出'} ${successCount} ${typeof Locale !== 'undefined' ? Locale.t('msgExportFilesTo') : '个文件到'} ${folderName}`, 'happy', 4000);
    }
  } else {
    if (typeof CharacterGuide !== 'undefined') {
      CharacterGuide.showMessage(`⚠️ ${typeof Locale !== 'undefined' ? Locale.t('msgExportPartial') : '导出完成：'}${successCount}/${totalFiles}`, 'warning', 4000);
    }
    // 重新下载失败的文件
    exportByDownloads(files, folderName);
  }
}

/**
 * 回退方案：逐个下载文件
 */
function exportByDownloads(files, folderName) {
  const fileArray = Object.values(files);

  // 按文件夹排序
  fileArray.sort((a, b) => {
    const orderA = ProjectManager.FOLDER_STRUCTURE.findIndex(f => f.key === a.folderKey);
    const orderB = ProjectManager.FOLDER_STRUCTURE.findIndex(f => f.key === b.folderKey);
    return orderA - orderB;
  });

  let index = 0;

  function downloadNext() {
    if (index >= fileArray.length) {
      if (typeof CharacterGuide !== 'undefined') {
        CharacterGuide.showMessage(`✅ ${typeof Locale !== 'undefined' ? Locale.t('msgExportDownloads') : '全部文件已下载！'} ${fileArray.length}`, 'happy', 4000);
      }
      return;
    }

    const file = fileArray[index];
    const folderInfo = ProjectManager.FOLDER_STRUCTURE.find(f => f.key === file.folderKey);
    const folderName2 = folderInfo ? folderInfo.name : 'other';

    // 文件名加上文件夹前缀，方便用户手动归类
    const downloadName = `${folderName2}_${file.name}`;

    // 创建下载
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    index++;

    // 间隔 500ms 下载下一个，避免浏览器拦截批量下载
    if (index < fileArray.length) {
      setTimeout(downloadNext, 500);
    } else {
      setTimeout(() => {
        alert(`✅ ${typeof Locale !== 'undefined' ? Locale.t('msgExportDownloads') : '全部文件已下载！'}\n\n${typeof Locale !== 'undefined' ? Locale.t('msgExportDownloadsDetail') : '共下载' + fileArray.length + ' 个文件。\n文件名已包含文件夹前缀，方便归类。'}`);
      }, 500);
    }
  }

  // 显示进度
  const result = confirm(
    `${typeof Locale !== 'undefined' ? Locale.t('msgExportConfirm') : '准备导出'} ${fileArray.length} ${typeof Locale !== 'undefined' ? Locale.t('msgExportConfirm2') : '个交付物文件。\n\n推荐方式：点击「确定」选择本地文件夹直接保存\n回退方式：点击「取消」逐个下载文件到下载目录\n\n是否使用逐个下载方式？'}`
  );

  if (result) {
    // 用户确认使用逐个下载
    downloadNext();
  }
  // 如果用户取消，回到 File System Access API（已在 exportAllDeliverables 中处理）
}

/**
 * 复制 Markdown
 */
async function copyMarkdown() {
  const docId = window.currentPreviewDocId;

  // 优先从 IndexedDB 读取
  if (docId) {
    const projectId = (typeof currentProjectId !== 'undefined') ? currentProjectId : '';
    if (projectId) {
      const fileDoc = await DocumentFileStore.load(projectId, docId);
      if (fileDoc && fileDoc.content) {
        await MarkdownRenderer.copyToClipboard(fileDoc.content);
        alert(typeof Locale !== 'undefined' ? Locale.t('msgSavedToClipboard') : '已复制 Markdown 源码到剪贴板');
        return;
      }
    }

    // 回退到 gameState
    const generatedDoc = GameData.getGeneratedDocument(docId);
    if (generatedDoc && generatedDoc.content) {
      await MarkdownRenderer.copyToClipboard(generatedDoc.content);
      alert(typeof Locale !== 'undefined' ? Locale.t('msgSavedToClipboard') : '已复制 Markdown 源码到剪贴板');
      return;
    }
  }

  // File list flow
  const fileId = window.currentPreviewFileId;
  if (!fileId) return;

  const file = projectData.project.files[fileId];
  if (!file) return;

  await MarkdownRenderer.copyToClipboard(file.content);
  alert(typeof Locale !== 'undefined' ? Locale.t('msgSavedToClipboard') : '已复制 Markdown 源码到剪贴板');
}

/**
 * 导出 Markdown 文件
 */
async function exportMarkdownFile() {
  const docId = window.currentPreviewDocId;

  // 优先从 IndexedDB 读取
  if (docId) {
    const doc = GameData.getDocument(docId);
    const projectId = (typeof currentProjectId !== 'undefined') ? currentProjectId : '';
    if (projectId) {
      const fileDoc = await DocumentFileStore.load(projectId, docId);
      if (fileDoc && fileDoc.content) {
        MarkdownRenderer.exportMarkdown(`${doc.name}.md`, fileDoc.content);
        return;
      }
    }

    const generatedDoc = GameData.getGeneratedDocument(docId);
    if (generatedDoc && generatedDoc.content) {
      MarkdownRenderer.exportMarkdown(`${doc.name}.md`, generatedDoc.content);
      return;
    }
  }

  // File list flow
  const fileId = window.currentPreviewFileId;
  if (!fileId) return;

  const file = projectData.project.files[fileId];
  if (!file) return;

  MarkdownRenderer.exportMarkdown(`${file.name}.md`, file.content);
}

/**
 * 导出 HTML 文件
 */
async function exportHtmlFile() {
  const docId = window.currentPreviewDocId;

  // 优先从 IndexedDB 读取
  if (docId) {
    const doc = GameData.getDocument(docId);
    const projectId = (typeof currentProjectId !== 'undefined') ? currentProjectId : '';
    if (projectId) {
      const fileDoc = await DocumentFileStore.load(projectId, docId);
      if (fileDoc && fileDoc.content) {
        MarkdownRenderer.exportHtml(`${doc.name}.html`, doc.name, fileDoc.content);
        return;
      }
    }

    const generatedDoc = GameData.getGeneratedDocument(docId);
    if (generatedDoc && generatedDoc.content) {
      MarkdownRenderer.exportHtml(`${doc.name}.html`, doc.name, generatedDoc.content);
      return;
    }
  }

  // File list flow
  const fileId = window.currentPreviewFileId;
  if (!fileId) return;

  const file = projectData.project.files[fileId];
  if (!file) return;

  MarkdownRenderer.exportHtml(`${file.name}.html`, file.name, file.content);
}

/**
 * 显示原始 JSON
 */
function showRawJson() {
  const jsonStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project-${currentProjectId}-data.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 保存进度
 */
function saveProgress() {
  // 同步当前状态
  const gameState = GameData.getGameState();
  projectData.gameState = {
    ...projectData.gameState,
    ...gameState
  };

  ProjectManager.saveCurrentProjectData(projectData);
  GameData.saveGameState();
  alert(typeof Locale !== 'undefined' ? Locale.t('msgProgressSaved') : '进度已保存');
}

/**
 * 重置项目
 */
function resetProject() {
  if (confirm(typeof Locale !== 'undefined' ? Locale.t('msgResetProjectConfirm') : '确定要重置项目进度吗？所有任务状态将被重置，但文档会保留。')) {
    ProjectManager.resetProjectProgress(currentProjectId);
    location.reload();
  }
}

/**
 * 导出项目
 */
function exportProject() {
  const exportData = ProjectManager.exportProject(currentProjectId);
  if (!exportData) return;

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project-${exportData.project.code}-export.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 切换项目面板
 */
function toggleProjectPanel() {
  const tree = document.getElementById('folderTree');
  if (tree) {
    tree.classList.toggle('open');
  }
}

/**
 * 切换项目信息面板
 */
function toggleProjectInfo() {
  const panel = document.getElementById('projectInfoPanel');
  panel.classList.toggle('open');
}

/**
 * 完成任务后保存文档到项目仓库
 */
function saveDocumentToRepository(docId, content) {
  const folderKey = ProjectManager.getFolderForChapter(currentChapterId);
  const doc = GameData.getDocument(docId);

  if (!doc) return;

  // 生成文件名
  const fileName = `${doc.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.md`;

  // 1. 立即保存到 IndexedDB（最可靠，刷新页面也不会丢失）
  DocumentFileStore.save(currentProjectId, docId, content);

  // 2. 持久化到 GameData
  GameData.updateDocumentStatus(docId, 'generated', content);

  // 保存到 localStorage 项目文件仓库
  ProjectManager.addFile(currentProjectId, folderKey, fileName, content, {
    docType: docId,
    generatedAt: new Date().toISOString()
  });

  // 保存到本地文件夹（如果已选择）
  if (projectDirHandle) {
    saveFileToFolder(folderKey, fileName, content);
  }

  // 刷新文件列表
  renderCurrentFolderFiles();
}

// 重写完成任务函数，增加保存到仓库
window.saveDocumentToRepository = saveDocumentToRepository;

// 暴露全局函数
window.selectFolder = selectFolder;
window.openFilePreview = openFilePreview;
window.copyFileContent = copyFileContent;
window.downloadFile = downloadFile;
window.copyMarkdown = copyMarkdown;
window.exportMarkdownFile = exportMarkdownFile;
window.exportHtmlFile = exportHtmlFile;
window.showRawJson = showRawJson;
window.saveProgress = saveProgress;
window.resetProject = resetProject;
window.exportProject = exportProject;
window.toggleProjectInfo = toggleProjectInfo;
window.selectSaveFolder = selectSaveFolder;
window.exportAllDeliverables = exportAllDeliverables;

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);
