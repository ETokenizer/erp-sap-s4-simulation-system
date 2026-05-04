/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 项目管理模块 - 项目仓库化管理核心
 */

const ProjectManager = {
  // 项目目录结构（10 个文件夹，对应 6 个章节）
  FOLDER_STRUCTURE: [
    { id: 'folder-01', name: '01_项目启动',         key: '01_project_init',        chapterIds: ['ch1'], expectedDocCount: 5 },
    { id: 'folder-02', name: '02_项目计划',          key: '02_project_plan',       chapterIds: ['ch2'], expectedDocCount: 6 },
    { id: 'folder-03', name: '03_业务调研与蓝图',     key: '03_business_blueprint', chapterIds: ['ch3'], expectedDocCount: 5 },
    { id: 'folder-04a', name: '04a_系统配置与开发',  key: '04a_system_config',     chapterIds: ['ch4'], expectedDocCount: 4 },
    { id: 'folder-04b', name: '04b_主数据准备',      key: '04b_master_data',       chapterIds: ['ch4'], expectedDocCount: 1 },
    { id: 'folder-04c', name: '04c_测试与演练',      key: '04c_testing',           chapterIds: ['ch4','ch5'], expectedDocCount: 3 },
    { id: 'folder-04d', name: '04d_用户培训',        key: '04d_training',          chapterIds: ['ch4','ch5'], expectedDocCount: 3 },
    { id: 'folder-05', name: '05_上线切换',          key: '05_cutover',            chapterIds: ['ch5'], expectedDocCount: 3 },
    { id: 'folder-06', name: '06_上线支持与复盘',     key: '06_support',            chapterIds: ['ch6'], expectedDocCount: 7 },
  ],

  // 章节与文件夹多对一映射
  CHAPTER_FOLDER_MAP: {
    'ch1': ['01_project_init'],
    'ch2': ['02_project_plan'],
    'ch3': ['03_business_blueprint'],
    'ch4': ['04a_system_config', '04b_master_data', '04c_testing', '04d_training'],
    'ch5': ['04c_testing', '04d_training', '05_cutover'],
    'ch6': ['06_support'],
  },

  /**
   * 获取所有项目
   */
  getAllProjects() {
    const projectsStr = localStorage.getItem('erpSimulationProjects');
    if (!projectsStr) return [];

    try {
      return JSON.parse(projectsStr);
    } catch (e) {
      console.error('解析项目列表失败:', e);
      return [];
    }
  },

  /**
   * 保存项目列表
   */
  saveProjects(projects) {
    localStorage.setItem('erpSimulationProjects', JSON.stringify(projects));
  },

  /**
   * 创建新项目
   */
  createProject(projectData) {
    const projects = this.getAllProjects();
    const projectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 记录创建者用户 ID，用于项目数据隔离
    let createdBy = null;
    try {
      const user = (typeof AuthService !== 'undefined' && AuthService.getCurrentUser)
        ? AuthService.getCurrentUser() : null;
      createdBy = user ? user.id : null;
    } catch (e) {
      // 忽略
    }

    const project = {
      id: projectId,
      code: projectData.code,
      name: projectData.name,
      customerName: projectData.customerName,
      projectManager: projectData.projectManager || '',
      startDate: projectData.startDate,
      goLiveDate: projectData.goLiveDate,
      background: projectData.background || {},
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 初始化项目存储空间
    this.initProjectStorage(projectId);

    projects.push(project);
    this.saveProjects(projects);

    return project;
  },

  /**
   * 初始化项目存储空间
   */
  initProjectStorage(projectId) {
    const initialData = {
      project: {
        folders: this.FOLDER_STRUCTURE.map(f => ({ ...f })),
        files: {}, // 存储文件内容
        fileIndex: {} // 文件名到内容的索引
      },
      gameState: {
        currentChapter: 'ch1',
        totalProgress: 0,
        completedTasks: 0,
        totalTasks: 0,
        changeRequests: [],
        riskEventsTriggered: [],
        documents: {},
        tasks: {}
      }
    };

    localStorage.setItem(`erp_project_${projectId}`, JSON.stringify(initialData));
  },

  /**
   * 获取项目数据
   */
  getProjectData(projectId) {
    const dataStr = localStorage.getItem(`erp_project_${projectId}`);
    if (!dataStr) return null;

    try {
      return JSON.parse(dataStr);
    } catch (e) {
      console.error('解析项目数据失败:', e);
      return null;
    }
  },

  /**
   * 保存项目数据
   */
  saveProjectData(projectId, data) {
    data.project.updatedAt = new Date().toISOString();
    localStorage.setItem(`erp_project_${projectId}`, JSON.stringify(data));
  },

  /**
   * 获取当前选中的项目 ID
   */
  getCurrentProjectId() {
    return localStorage.getItem('erpSimulationCurrentProject');
  },

  /**
   * 设置当前项目
   */
  setCurrentProject(projectId) {
    localStorage.setItem('erpSimulationCurrentProject', projectId);
  },

  /**
   * 获取当前项目数据
   */
  getCurrentProjectData() {
    const projectId = this.getCurrentProjectId();
    if (!projectId) return null;
    return this.getProjectData(projectId);
  },

  /**
   * 保存当前项目数据
   */
  saveCurrentProjectData(data) {
    const projectId = this.getCurrentProjectId();
    if (projectId) {
      this.saveProjectData(projectId, data);
    }
  },

  /**
   * 更新项目信息
   */
  updateProject(projectId, updates) {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === projectId);

    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveProjects(projects);
    return projects[index];
  },

  /**
   * 删除项目
   */
  deleteProject(projectId) {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);

    this.saveProjects(filtered);

    // 删除项目存储
    localStorage.removeItem(`erp_project_${projectId}`);

    // 如果删除的是当前项目，清除当前项目
    if (this.getCurrentProjectId() === projectId) {
      localStorage.removeItem('erpSimulationCurrentProject');
    }

    return true;
  },

  /**
   * 克隆项目
   */
  cloneProject(projectId) {
    console.log('[ProjectManager.cloneProject] 开始克隆, sourceId =', projectId);
    const sourceProject = this.getProjectData(projectId);
    if (!sourceProject) { console.error('[ProjectManager.cloneProject] 项目数据不存在'); return null; }

    const projects = this.getAllProjects();
    const sourceProjectInfo = projects.find(p => p.id === projectId);
    if (!sourceProjectInfo) { console.error('[ProjectManager.cloneProject] 项目信息不存在'); return null; }

    console.log('[ProjectManager.cloneProject] 源项目 background =', JSON.stringify(sourceProjectInfo.background));

    const newProjectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 复制项目信息
    let createdBy = null;
    try {
      const user = (typeof AuthService !== 'undefined' && AuthService.getCurrentUser)
        ? AuthService.getCurrentUser() : null;
      createdBy = user ? user.id : sourceProjectInfo.createdBy || null;
    } catch (e) {
      createdBy = sourceProjectInfo.createdBy || null;
    }

    const newProject = {
      id: newProjectId,
      code: sourceProjectInfo.code + '_COPY',
      name: sourceProjectInfo.name + ' (副本)',
      customerName: sourceProjectInfo.customerName,
      projectManager: sourceProjectInfo.projectManager,
      startDate: sourceProjectInfo.startDate,
      goLiveDate: sourceProjectInfo.goLiveDate,
      background: sourceProjectInfo.background ? JSON.parse(JSON.stringify(sourceProjectInfo.background)) : {},
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('[ProjectManager.cloneProject] 克隆项目 background =', JSON.stringify(newProject.background));

    // 深度克隆项目数据
    const clonedData = JSON.parse(JSON.stringify(sourceProject));
    clonedData.project.updatedAt = new Date().toISOString();

    // 重置游戏状态（可选，如果希望克隆时保留进度则注释掉）
    clonedData.gameState = {
      currentChapter: 'ch1',
      totalProgress: 0,
      completedTasks: 0,
      totalTasks: clonedData.gameState.totalTasks || 0,
      changeRequests: [],
      riskEventsTriggered: [],
      documents: {},
      tasks: {}
    };

    // 保存克隆的数据
    localStorage.setItem(`erp_project_${newProjectId}`, JSON.stringify(clonedData));

    projects.push(newProject);
    this.saveProjects(projects);

    return newProject;
  },

  /**
   * 计算项目进度
   */
  calculateProjectProgress(projectId) {
    const data = this.getProjectData(projectId);
    if (!data || !data.gameState) return 0;
    return data.gameState.totalProgress || 0;
  },

  /**
   * 获取项目信息
   */
  getProjectInfo(projectId) {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  },

  /**
   * 添加文件到项目
   */
  addFile(projectId, folderKey, fileName, content, metadata = {}) {
    const data = this.getProjectData(projectId);
    if (!data) return false;

    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const file = {
      id: fileId,
      name: fileName,
      folderKey: folderKey,
      content: content,
      metadata: {
        type: 'document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...metadata
      }
    };

    data.project.files[fileId] = file;

    // 更新文件索引
    const indexKey = `${folderKey}/${fileName}`;
    data.project.fileIndex[indexKey] = fileId;

    this.saveProjectData(projectId, data);
    return fileId;
  },

  /**
   * 获取文件夹中的所有文件
   */
  getFilesInFolder(projectId, folderKey) {
    const data = this.getProjectData(projectId);
    if (!data) return [];

    return Object.values(data.project.files)
      .filter(file => file.folderKey === folderKey)
      .sort((a, b) => new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt));
  },

  /**
   * 获取文件内容
   */
  getFileContent(projectId, fileId) {
    const data = this.getProjectData(projectId);
    if (!data || !data.project.files[fileId]) return null;
    return data.project.files[fileId].content;
  },

  /**
   * 更新文件内容
   */
  updateFile(projectId, fileId, content) {
    const data = this.getProjectData(projectId);
    if (!data || !data.project.files[fileId]) return false;

    data.project.files[fileId].content = content;
    data.project.files[fileId].metadata.updatedAt = new Date().toISOString();

    this.saveProjectData(projectId, data);
    return true;
  },

  /**
   * 删除文件
   */
  deleteFile(projectId, fileId) {
    const data = this.getProjectData(projectId);
    if (!data || !data.project.files[fileId]) return false;

    const file = data.project.files[fileId];
    const indexKey = `${file.folderKey}/${file.name}`;

    delete data.project.files[fileId];
    delete data.project.fileIndex[indexKey];

    this.saveProjectData(projectId, data);
    return true;
  },

  /**
   * 根据文档类型删除项目文件
   */
  removeFileByDocType(projectId, docType) {
    const data = this.getProjectData(projectId);
    if (!data) return false;

    Object.keys(data.project.files).forEach(fileId => {
      const file = data.project.files[fileId];
      if (file.metadata && file.metadata.docType === docType) {
        const indexKey = `${file.folderKey}/${file.name}`;
        delete data.project.files[fileId];
        delete data.project.fileIndex[indexKey];
      }
    });

    this.saveProjectData(projectId, data);
    return true;
  },

  /**
   * 导出项目为 JSON
   */
  exportProject(projectId) {
    const projectInfo = this.getProjectInfo(projectId);
    const projectData = this.getProjectData(projectId);

    if (!projectInfo || !projectData) return null;

    const exportData = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      project: projectInfo,
      data: projectData
    };

    return exportData;
  },

  /**
   * 导出项目所有文档为 Markdown 包
   */
  exportProjectMarkdown(projectId) {
    const data = this.getProjectData(projectId);
    if (!data) return null;

    const projectInfo = this.getProjectInfo(projectId);
    const files = data.project.files;

    // 按文件夹分组
    const folderFiles = {};
    this.FOLDER_STRUCTURE.forEach(folder => {
      folderFiles[folder.key] = [];
    });

    Object.values(files).forEach(file => {
      if (folderFiles[file.folderKey]) {
        folderFiles[file.folderKey].push(file);
      }
    });

    return {
      projectInfo,
      folders: this.FOLDER_STRUCTURE,
      files: folderFiles
    };
  },

  /**
   * 下载文件
   */
  downloadFile(filename, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * 从 JSON 导入项目
   */
  importProject(exportData) {
    if (!exportData || !exportData.project || !exportData.data) {
      throw new Error('无效的导入文件');
    }

    const newProjectId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    const newProject = {
      id: newProjectId,
      code: exportData.project.code + '_IMP',
      name: exportData.project.name + ' (导入)',
      customerName: exportData.project.customerName,
      projectManager: exportData.project.projectManager,
      startDate: exportData.project.startDate,
      goLiveDate: exportData.project.goLiveDate,
      background: exportData.project.background || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存项目数据
    localStorage.setItem(`erp_project_${newProjectId}`, JSON.stringify(exportData.data));

    // 添加到项目列表
    const projects = this.getAllProjects();
    projects.push(newProject);
    this.saveProjects(projects);

    return newProject;
  },

  /**
   * 获取文件夹名称
   */
  getFolderName(folderKey) {
    const folder = this.FOLDER_STRUCTURE.find(f => f.key === folderKey);
    return folder ? folder.name : folderKey;
  },

  /**
   * 获取章节对应的文件夹（返回第一个）
   */
  getFolderForChapter(chapterId) {
    const keys = this.CHAPTER_FOLDER_MAP[chapterId];
    return (keys && keys[0]) || '01_project_init';
  },

  /**
   * 重置项目进度
   */
  resetProjectProgress(projectId) {
    const data = this.getProjectData(projectId);
    if (!data) return false;

    // 重置游戏状态但保留项目结构和文件
    data.gameState = {
      currentChapter: 'ch1',
      totalProgress: 0,
      completedTasks: 0,
      totalTasks: data.gameState.totalTasks || 0,
      changeRequests: [],
      riskEventsTriggered: [],
      documents: {},
      tasks: {}
    };

    this.saveProjectData(projectId, data);
    return true;
  }
};

// 导出到全局
window.ProjectManager = ProjectManager;

console.log('Project Manager loaded');
