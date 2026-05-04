/**
 * ERP SAP S4 游戏化增强 - NPC 引导气泡
 *
 * 功能：切换章节时，左上角弹出对话气泡，像游戏 NPC 在引导用户
 *
 * 使用方式：
 * 1. 在 index.html 引入此脚本
 * 2. 调用 NPCBubbles.show(chapterId) 显示气泡
 * 3. 气泡 3 秒后自动淡出
 */

const NPCBubbles = {
  // NPC 引导文案配置
  dialogues: {
    'ch1': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch1') : '欢迎来到项目启动阶段！首先搞清楚一件事：为什么要上 SAP？让我们从业务痛点分析开始。',
      mood: 'curious',
      icon: '🤔'
    },
    'ch2': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch2') : '立项通过！现在是制定详细计划的时候。先组建团队，再画甘特图。',
      mood: 'confident',
      icon: '📋'
    },
    'ch3': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch3') : '该梳理业务流程了。先看看现在是怎么做的（AS-IS），再设计未来怎么做（TO-BE）。',
      mood: 'analytical',
      icon: '🔍'
    },
    'ch4': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch4') : '蓝图确认，进入系统搭建！配置、开发、测试，多线并行，忙起来了。',
      mood: 'focused',
      icon: '⚙️'
    },
    'ch5': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch5') : '关键来了！上线切换不能有差错，UAT、培训、数据迁移，一个一个来。',
      mood: 'serious',
      icon: '🚀'
    },
    'ch6': {
      text: typeof Locale !== 'undefined' ? Locale.t('npc_ch6') : '系统上线了，但战斗还没结束。现场护航、问题跟踪，确保稳定运行。',
      mood: 'calm',
      icon: '🛡️'
    }
  },

  // 当前显示的 bubble 元素
  currentBubble: null,

  // 自动隐藏定时器
  hideTimer: null,

  /**
   * 显示 NPC 气泡
   * @param {string} chapterId - 章节 ID，如 'ch1', 'ch2' 等
   */
  show(chapterId) {
    const dialogue = this.dialogues[chapterId];
    if (!dialogue) {
      console.warn('[NPCBubbles] 未找到章节', chapterId, '的引导文案');
      return;
    }

    // 清除之前的定时器
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // 移除之前的气泡
    if (this.currentBubble) {
      this.currentBubble.remove();
      this.currentBubble = null;
    }

    // 创建气泡元素
    const bubble = this.createBubble(dialogue);
    document.body.appendChild(bubble);
    this.currentBubble = bubble;

    console.log('[NPCBubbles] 显示气泡:', dialogue.text);

    // 3 秒后自动淡出
    this.hideTimer = setTimeout(() => this.hide(), 3000);
  },

  /**
   * 创建气泡 DOM 元素
   */
  createBubble(dialogue) {
    const bubble = document.createElement('div');
    bubble.className = 'npc-bubble';
    bubble.innerHTML = `
      <div class="npc-bubble-icon">${dialogue.icon}</div>
      <div class="npc-bubble-content">
        <div class="npc-bubble-text">${dialogue.text}</div>
        <div class="npc-bubble-arrow"></div>
      </div>
    `;

    // 点击气泡可手动关闭
    bubble.addEventListener('click', () => this.hide());

    return bubble;
  },

  /**
   * 隐藏气泡
   */
  hide() {
    if (!this.currentBubble) return;

    this.currentBubble.classList.add('npc-bubble-hide');

    // 动画结束后移除元素
    setTimeout(() => {
      if (this.currentBubble) {
        this.currentBubble.remove();
        this.currentBubble = null;
      }
    }, 300);

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    console.log('[NPCBubbles] 气泡已隐藏');
  },

  /**
   * 手动重新显示（点击残留图标时调用）
   */
  reShow(chapterId) {
    this.show(chapterId);
  }
};

/**
 * 游戏化 - 角色导航向导
 *
 * 功能：页面右下角放一个 SVG 卡通角色，提供情境感知提示
 */

const CharacterGuide = {
  // 角色状态
  currentMood: 'idle',

  // 情境提示内容
  hints: {
    idle: typeof Locale !== 'undefined' ? Locale.t('guideIdle') : '所有任务都完成了，恭喜你！🎉',
    nextTask: typeof Locale !== 'undefined' ? Locale.t('guideNextTask') : '当前任务：{taskName}',
    parallel: typeof Locale !== 'undefined' ? Locale.t('guideParallel') : '你可以并行做 {taskName}，节省时间 ⚡',
    critical: typeof Locale !== 'undefined' ? Locale.t('guideCritical') : '⚠️ 这个任务在关键路径上，别拖延',
    locked: typeof Locale !== 'undefined' ? Locale.t('guideLocked') : '完成前置阶段才能解锁本阶段 🔒',
    chapterComplete: typeof Locale !== 'undefined' ? Locale.t('guideChapterComplete') : '阶段完成！准备进入下一阶段 🎯',
    aiGenerating: typeof Locale !== 'undefined' ? Locale.t('guideAiGenerating') : '🤖 AI 正在为「{taskName}」生成文档...',
    taskComplete: typeof Locale !== 'undefined' ? Locale.t('guideTaskComplete') : '👍 「{taskName}」完成！做得好',
    changeTrigger: typeof Locale !== 'undefined' ? Locale.t('guideChangeTrigger') : '⚠️ 有个变更需要处理',
    chapterName: typeof Locale !== 'undefined' ? Locale.t('guideChapterName') : '当前：{chapterName}',
  },

  // AI 生成时的轮播文案
  aiGeneratingHints: [
    typeof Locale !== 'undefined' ? Locale.t('aiHint1') : 'AI 正在思考中... 🤔',
    typeof Locale !== 'undefined' ? Locale.t('aiHint2') : '翻阅 20 年 SAP 实施经验... 📚',
    typeof Locale !== 'undefined' ? Locale.t('aiHint3') : '正在组织专业术语... ✍️',
    typeof Locale !== 'undefined' ? Locale.t('aiHint4') : '项目背景信息已读取，开始个性化... 🎯',
    typeof Locale !== 'undefined' ? Locale.t('aiHint5') : '正在构建文档结构... 🏗️',
    typeof Locale !== 'undefined' ? Locale.t('aiHint6') : '思考业务痛点分析... 💭',
    typeof Locale !== 'undefined' ? Locale.t('aiHint7') : '即将完成，稍等片刻... ⏳',
    typeof Locale !== 'undefined' ? Locale.t('aiHint8') : 'AI 说：这个项目很有意思！✨',
    typeof Locale !== 'undefined' ? Locale.t('aiHint9') : '正在生成表格... 📊',
    typeof Locale !== 'undefined' ? Locale.t('aiHint10') : '思考 SAP 最佳实践... 🧠',
  ],
  aiHintIndex: 0,
  aiHintTimer: null,

  // 当前角色元素
  element: null,

  // 提示定时器
  hintTimer: null,

  /**
   * 初始化角色向导
   */
  init() {
    console.log('[CharacterGuide] 初始化');
    this.createCharacter();
    this.bindEvents();
  },

  /**
   * 创建角色 DOM 元素
   */
  createCharacter() {
    const character = document.createElement('div');
    character.className = 'character-guide';
    character.innerHTML = `
      <div class="character-body">
        <svg viewBox="0 0 100 100" class="character-svg">
          <!-- 身体轮廓 -->
          <circle cx="50" cy="50" r="40" fill="none" stroke="#333" stroke-width="3"/>
          <!-- 眼睛 -->
          <circle cx="35" cy="45" r="3.5" fill="#333" class="character-eye"/>
          <circle cx="65" cy="45" r="3.5" fill="#333" class="character-eye"/>
          <!-- 嘴巴 -->
          <path id="character-mouth" d="M 35 65 Q 50 75 65 65" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="character-hint-bubble" id="characterHint">
        <div class="character-hint-text">${this.hints.idle}</div>
        <div class="character-hint-arrow"></div>
      </div>
    `;

    document.body.appendChild(character);
    this.element = character;

    // 添加 CSS 样式（如果尚未添加）
    if (!document.getElementById('character-guide-styles')) {
      this.addStyles();
    }
  },

  /**
   * 添加样式
   */
  addStyles() {
    const styles = document.createElement('style');
    styles.id = 'character-guide-styles';
    styles.textContent = `
      /* 角色向导容器 */
      .character-guide {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        cursor: pointer;
        transition: transform 0.3s ease;
      }

      .character-guide:hover {
        transform: scale(1.1);
      }

      /* 角色身体 */
      .character-body {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        overflow: hidden;
        animation: character-breathe 3s ease-in-out infinite;
      }

      @keyframes character-breathe {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .character-svg {
        width: 100%;
        height: 100%;
      }

      /* 身体轮廓颜色切换 */
      .character-svg circle,
      .character-svg path,
      .character-svg ellipse {
        transition: stroke 0.3s ease, fill 0.3s ease;
      }

      .character-eye {
        animation: character-blink 4s ease-in-out infinite;
      }

      @keyframes character-blink {
        0%, 96%, 100% { transform: scaleY(1); }
        98% { transform: scaleY(0.1); }
      }

      /* 提示气泡 */
      .character-hint-bubble {
        position: absolute;
        bottom: 90px;
        right: 0;
        background: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 320px;
        max-width: 420px;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .character-hint-bubble.show {
        opacity: 1;
        transform: translateY(0);
      }

      .character-hint-text {
        font-size: 0.85rem;
        color: #333;
        line-height: 1.5;
      }

      .character-hint-arrow {
        position: absolute;
        bottom: -8px;
        right: 20px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid white;
      }

      /* 不同情绪的嘴巴形状 */
      .character-mood-happy #character-mouth {
        d: path("M 35 65 Q 50 75 65 65");
      }

      .character-mood-focused #character-mouth {
        d: path("M 40 68 Q 50 68 60 68");
      }

      .character-mood-serious #character-mouth {
        d: path("M 40 70 L 60 70");
      }

      .character-mood-surprised #character-mouth {
        d: path("M 45 65 Q 50 75 55 65");
      }

      /* AI 生成中状态 — 旋转光环 */
      .character-mood-ai-thinking .character-body::after {
        content: '';
        position: absolute;
        top: -6px; left: -6px; right: -6px; bottom: -6px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #ffd700;
        border-right-color: #ff6b6b;
        animation: character-spin 1.5s linear infinite;
      }

      @keyframes character-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .character-mood-ai-thinking .character-body {
        background: linear-gradient(135deg, #667eea22, #764ba222);
      }

      .character-mood-ai-thinking #character-mouth {
        d: path("M 45 65 Q 50 68 55 65");
      }

      /* AI 生成中 — 提示气泡高亮显示 */
      .character-mood-ai-thinking .character-hint-bubble {
        opacity: 1;
        transform: translateY(0);
        border: 2px solid #ffd700;
        box-shadow: 0 4px 25px rgba(255, 215, 0, 0.3);
      }

      /* AI 生成完成 — 开心弹跳 */
      @keyframes character-jump {
        0% { transform: translateY(0); }
        25% { transform: translateY(-20px); }
        50% { transform: translateY(0); }
        75% { transform: translateY(-12px); }
        100% { transform: translateY(0); }
      }

      .character-mood-ai-done .character-body {
        animation: character-jump 0.8s ease-in-out;
      }

      .character-mood-ai-done .character-body {
        background: linear-gradient(135deg, #4caf5022, #66bb6a22);
      }

      .character-mood-ai-done svg circle:not(.character-eye),
      .character-mood-ai-done svg path,
      .character-mood-ai-done svg ellipse {
        stroke: #4caf50;
      }

      .character-mood-ai-done .character-hint-bubble {
        opacity: 1;
        transform: translateY(0);
        border: 2px solid #4caf50;
      }

      /* 警告 — 黄色 */
      .character-mood-warning .character-body {
        background: linear-gradient(135deg, #fff8e1, #ffecb3);
        box-shadow: 0 0 12px rgba(255, 193, 7, 0.4);
      }

      .character-mood-warning svg circle:not(.character-eye),
      .character-mood-warning svg path,
      .character-mood-warning svg ellipse {
        stroke: #e65100;
      }

      .character-mood-warning .character-hint-bubble {
        opacity: 1;
        transform: translateY(0);
        border: 2px solid #ffa726;
        box-shadow: 0 4px 16px rgba(255, 167, 38, 0.3);
      }

      /* 错误 — 红色 */
      .character-mood-error .character-body {
        background: linear-gradient(135deg, #ffebee, #ffcdd2);
        box-shadow: 0 0 12px rgba(244, 67, 54, 0.4);
      }

      .character-mood-error svg circle:not(.character-eye),
      .character-mood-error svg path,
      .character-mood-error svg ellipse {
        stroke: #c62828;
      }

      .character-mood-error .character-hint-bubble {
        opacity: 1;
        transform: translateY(0);
        border: 2px solid #ef5350;
        box-shadow: 0 4px 16px rgba(239, 83, 80, 0.3);
      }

      /* 开心 — 绿色 */
      .character-mood-happy .character-body {
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      }

      .character-mood-happy svg circle:not(.character-eye),
      .character-mood-happy svg path,
      .character-mood-happy svg ellipse {
        stroke: #2e7d32;
      }

      /* ═══════════════════════════════════════
         角色完整面板
         ═══════════════════════════════════════ */
      .character-full-panel {
        position: fixed;
        bottom: 110px;
        right: 20px;
        width: 280px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        z-index: 10000;
        overflow: hidden;
        animation: panelSlideUp 0.25s ease-out;
        font-family: -apple-system, "Microsoft YaHei", sans-serif;
      }
      @keyframes panelSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .cfp-closing {
        animation: panelSlideDown 0.2s ease-in forwards;
      }
      @keyframes panelSlideDown {
        from { opacity: 1; transform: translateY(0); }
        to   { opacity: 0; transform: translateY(16px); }
      }

      .cfp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      .cfp-title {
        font-size: 0.95rem;
        font-weight: 600;
      }
      .cfp-close {
        font-size: 1.4rem;
        cursor: pointer;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      .cfp-close:hover { opacity: 1; }

      .cfp-body { padding: 14px 16px; }

      .cfp-section {
        margin-bottom: 14px;
      }
      .cfp-section:last-child { margin-bottom: 0; }

      .cfp-section-title {
        font-size: 0.8rem;
        color: #888;
        margin-bottom: 8px;
        font-weight: 500;
      }

      /* 进度条 */
      .cfp-progress-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .cfp-progress-text {
        font-size: 0.82rem;
        color: #333;
      }
      .cfp-progress-pct {
        font-size: 0.9rem;
        font-weight: 700;
        color: #667eea;
      }
      .cfp-progress-track {
        height: 8px;
        background: #e8e8e8;
        border-radius: 4px;
        overflow: hidden;
      }
      .cfp-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.3s ease;
      }

      /* 下一步任务 */
      .cfp-next-task {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        padding: 10px;
        background: #f8f9ff;
        border-radius: 8px;
        border-left: 3px solid #667eea;
      }
      .cfp-chapter-tag {
        font-size: 0.7rem;
        background: #667eea22;
        color: #667eea;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
      }
      .cfp-task-name {
        font-size: 0.85rem;
        color: #333;
        font-weight: 500;
        flex: 1;
      }

      .cfp-all-done {
        text-align: center;
        padding: 12px;
        font-size: 1rem;
        color: #43a047;
        font-weight: 600;
      }

      /* 章节徽章 */
      .cfp-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .cfp-badge {
        font-size: 0.78rem;
        padding: 4px 10px;
        border-radius: 12px;
        background: #f0f0f0;
        color: #888;
        font-weight: 500;
        transition: all 0.2s;
      }
      .cfp-badge-done {
        background: linear-gradient(135deg, #4caf50, #66bb6a);
        color: white;
      }
      .cfp-badge-active {
        background: #667eea;
        color: white;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }
    `;
    document.head.appendChild(styles);
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.element) return;

    // 鼠标悬停显示提示
    this.element.addEventListener('mouseenter', () => {
      this.showHint();
    });

    this.element.addEventListener('mouseleave', () => {
      this.hideHint();
    });

    // 点击显示详情
    this.element.addEventListener('click', () => {
      this.showFullPanel();
    });
  },

  /**
   * 显示提示
   */
  showHint() {
    if (!this.element) return;
    const hintBubble = this.element.querySelector('.character-hint-bubble');
    if (hintBubble) {
      hintBubble.classList.add('show');
    }
  },

  /**
   * 隐藏提示
   */
  hideHint() {
    if (!this.element) return;
    const hintBubble = this.element.querySelector('.character-hint-bubble');
    if (hintBubble) {
      hintBubble.classList.remove('show');
    }
  },

  /**
   * 更新提示内容
   */
  updateHint(hintKey, replacements = {}) {
    if (!this.element) return;
    let text = this.hints[hintKey] || this.hints.idle;

    // 替换变量
    Object.keys(replacements).forEach(key => {
      text = text.replace(`{${key}}`, replacements[key]);
    });

    const hintText = this.element.querySelector('.character-hint-text');
    if (hintText) {
      hintText.textContent = text;
    }
  },

  /**
   * 设置角色情绪
   */
  setMood(mood) {
    if (!this.element) return;

    // 移除所有情绪类
    this.element.classList.remove(
      'character-mood-happy',
      'character-mood-focused',
      'character-mood-serious',
      'character-mood-surprised',
      'character-mood-ai-thinking',
      'character-mood-ai-done',
      'character-mood-warning',
      'character-mood-error'
    );

    // 添加新情绪类
    if (mood !== 'idle') {
      this.element.classList.add(`character-mood-${mood}`);
    }

    this.currentMood = mood;
  },

  /**
   * AI 生成中 — 角色进入"思考"状态
   * @param {string} taskName - 当前任务名称
   */
  showAIGenerating(taskName) {
    if (!this.element) return;

    // 设置思考状态
    this.setMood('ai-thinking');
    this.aiHintIndex = 0;

    // 显示初始提示
    this.updateHint('aiGenerating', {
      taskName: taskName || '当前任务'
    });

    // 确保气泡一直显示
    const hintBubble = this.element.querySelector('.character-hint-bubble');
    if (hintBubble) hintBubble.classList.add('show');

    // 每 3 秒轮换一次文案
    this.aiHintTimer = setInterval(() => {
      this.aiHintIndex = (this.aiHintIndex + 1) % this.aiGeneratingHints.length;
      const hintText = this.element.querySelector('.character-hint-text');
      if (hintText) {
        hintText.textContent = this.aiGeneratingHints[this.aiHintIndex];
      }
    }, 3000);
  },

  /**
   * AI 生成完成 — 角色进入"完成"状态
   */
  hideAIGenerating() {
    if (!this.element) return;

    // 停止轮换
    if (this.aiHintTimer) {
      clearInterval(this.aiHintTimer);
      this.aiHintTimer = null;
    }

    // 短暂显示"完成"动画
    this.setMood('ai-done');
    const hintText = this.element.querySelector('.character-hint-text');
    if (hintText) hintText.textContent = typeof Locale !== 'undefined' ? Locale.t('guideAiDone') : '文档生成完成！✅';

    // 1.5 秒后恢复默认状态
    setTimeout(() => {
      this.setMood('idle');
    }, 1500);
  },

  /**
   * 显示非模态通知消息（替代 alert）
   * @param {string} text - 消息文本
   * @param {string} mood - 角色情绪 (happy / warning / error / idle)
   * @param {number} duration - 显示时长（毫秒），默认 4 秒
   */
  showMessage(text, mood, duration) {
    if (!this.element) return;

    duration = duration || 4000;

    // 停止可能正在进行的 AI 生成动画
    if (this.aiHintTimer) {
      clearInterval(this.aiHintTimer);
      this.aiHintTimer = null;
    }

    // 设置情绪
    this.setMood(mood || 'idle');

    // 显示消息
    const hintText = this.element.querySelector('.character-hint-text');
    if (hintText) hintText.textContent = text;

    // 强制显示气泡
    const hintBubble = this.element.querySelector('.character-hint-bubble');
    if (hintBubble) hintBubble.classList.add('show');

    // 指定时间后自动隐藏
    setTimeout(() => {
      if (hintBubble) hintBubble.classList.remove('show');
      this.setMood('idle');
    }, duration);
  },

  // 面板元素引用
  panelElement: null,

  /**
   * 显示完整面板（点击角色时）
   */
  showFullPanel() {
    // 已打开则关闭
    if (this.panelElement) {
      this.closePanel();
      return;
    }

    // 从全局获取数据
    const gameState = typeof GameData !== 'undefined' ? GameData.getGameState() : null;
    const allChapters = typeof GameData !== 'undefined' ? (GameData.getGameData()?.chapters || []) : [];
    const currentCh = typeof currentChapterId !== 'undefined' ? currentChapterId : null;

    // 统计
    const completedTasks = gameState ? gameState.completedTasks : 0;
    const totalTasks = gameState ? gameState.totalTasks : 39;
    const progress = gameState ? gameState.totalProgress : 0;

    // 查找下一个待办任务
    let nextTask = null;
    for (const ch of allChapters) {
      for (const t of (ch.tasks || [])) {
        const taskState = gameState?.tasks?.[t.id];
        if (!taskState || taskState.status === 'pending') {
          nextTask = { ...t, chapterName: typeof Locale !== 'undefined' ? Locale.t(ch.id + 'Name') : ch.name };
          break;
        }
      }
      if (nextTask) break;
    }

    // 章节完成徽章
    const chapterBadges = allChapters.map(ch => {
      const chTasks = (ch.tasks || []).map(t => t.id);
      const allDone = chTasks.length > 0 && chTasks.every(tid => {
        const s = gameState?.tasks?.[tid];
        return s && s.status === 'completed';
      });
      const isActive = ch.id === currentCh;
      return { name: ch.name, shortName: ch.id.toUpperCase().replace('CH', 'Ch.'), done: allDone, active: isActive, id: ch.id };
    });

    // 构建面板 HTML
    const panel = document.createElement('div');
    panel.className = 'character-full-panel';
    panel.innerHTML = `
      <div class="cfp-header">
        <span class="cfp-title">${typeof Locale !== 'undefined' ? Locale.t('panelTitle') : '📋 任务面板'}</span>
        <span class="cfp-close" title="关闭">&times;</span>
      </div>
      <div class="cfp-body">
        <!-- 总进度 -->
        <div class="cfp-section">
          <div class="cfp-section-title">${typeof Locale !== 'undefined' ? Locale.t('panelTotalProgress') : '总进度'}</div>
          <div class="cfp-progress-row">
            <span class="cfp-progress-text">${completedTasks} / ${totalTasks} ${typeof Locale !== 'undefined' ? Locale.t('panelTaskComplete') : '任务完成'}</span>
            <span class="cfp-progress-pct">${progress}%</span>
          </div>
          <div class="cfp-progress-track">
            <div class="cfp-progress-fill" style="width:${progress}%"></div>
          </div>
        </div>
        ${nextTask ? `
        <!-- 下一个任务 -->
        <div class="cfp-section">
          <div class="cfp-section-title">${typeof Locale !== 'undefined' ? Locale.t('panelNext') : '下一步'}</div>
          <div class="cfp-next-task">
            <span class="cfp-chapter-tag">${nextTask.chapterName}</span>
            <span class="cfp-task-name">${nextTask.name}</span>
          </div>
        </div>` : `
        <!-- 全部完成 -->
        <div class="cfp-section">
          <div class="cfp-section-title">🎉 恭喜</div>
          <div class="cfp-all-done">${typeof Locale !== 'undefined' ? Locale.t('panelAllDone') : '所有任务已完成！'}</div>
        </div>`}
        <!-- 章节徽章 -->
        <div class="cfp-section">
          <div class="cfp-section-title">${typeof Locale !== 'undefined' ? Locale.t('panelChapters') : '阶段'}</div>
          <div class="cfp-badges">
            ${chapterBadges.map(b => `
              <div class="cfp-badge ${b.done ? 'cfp-badge-done' : ''} ${b.active ? 'cfp-badge-active' : ''}">
                ${b.done ? '✓' : '○'} ${b.shortName}
              </div>`).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panelElement = panel;

    // 关闭按钮
    panel.querySelector('.cfp-close').addEventListener('click', () => this.closePanel());

    // 点击面板外部关闭
    setTimeout(() => {
      const handler = (e) => {
        if (this.panelElement && !this.panelElement.contains(e.target) && e.target !== this.element && !this.element.contains(e.target)) {
          this.closePanel();
        }
        document.removeEventListener('click', handler);
      };
      document.addEventListener('click', handler);
    }, 10);
  },

  /**
   * 关闭面板
   */
  closePanel() {
    if (this.panelElement) {
      this.panelElement.classList.add('cfp-closing');
      setTimeout(() => {
        if (this.panelElement) {
          this.panelElement.remove();
          this.panelElement = null;
        }
      }, 200);
    }
  },
};

/**
 * 游戏化特性统一入口
 */
const GameFeatures = {
  _initialized: false,

  /**
   * 初始化所有游戏化特性
   */
  init() {
    // 确保 DOM 已加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initGameFeatures());
    } else {
      this.initGameFeatures();
    }
  },

  /**
   * 初始化游戏化特性（内部方法）
   */
  initGameFeatures() {
    if (this._initialized) {
      console.log('[GameFeatures] 已初始化，跳过重复初始化');
      return;
    }
    this._initialized = true;
    console.log('[GameFeatures] 初始化游戏化特性');
    ChapterIllustrations._injectStyles();
    CharacterGuide.init();

    // 定时刷新状态感知（每 30 秒检查一次）
    setInterval(() => this.refreshState(), 30000);
  },

  /**
   * 章节切换时的游戏化效果
   * @param {string} chapterId - 章节 ID
   */
  onChapterChange(chapterId) {
    // 显示 NPC 气泡
    NPCBubbles.show(chapterId);

    // 更新角色提示
    this.updateCharacterForChapter(chapterId);

    // 刷新状态感知
    this.refreshState();
  },

  /**
   * 根据章节更新角色提示
   */
  updateCharacterForChapter(chapterId) {
    const chapterNames = {
      'ch1': typeof Locale !== 'undefined' ? Locale.t('ch1Name') : '战略发现与立项',
      'ch2': typeof Locale !== 'undefined' ? Locale.t('ch2Name') : '项目准备与计划',
      'ch3': typeof Locale !== 'undefined' ? Locale.t('ch3Name') : '业务蓝图与方案设计',
      'ch4': typeof Locale !== 'undefined' ? Locale.t('ch4Name') : '系统配置与开发测试',
      'ch5': typeof Locale !== 'undefined' ? Locale.t('ch5Name') : '上线准备与切换',
      'ch6': typeof Locale !== 'undefined' ? Locale.t('ch6Name') : '上线护航与持续优化'
    };

    CharacterGuide.updateHint('chapterName', {
      chapterName: chapterNames[chapterId] || '当前阶段'
    });
  },

  /**
   * 任务完成时的游戏化效果
   */
  onTaskComplete(task) {
    if (!task) return;

    // 角色开心
    CharacterGuide.setMood('happy');
    CharacterGuide.updateHint('taskComplete', {
      taskName: task.name || '任务'
    });

    // 3 秒后检查是否本章全部完成
    setTimeout(() => {
      this._checkChapterComplete();
      CharacterGuide.setMood('idle');
    }, 3000);
  },

  /**
   * 变更事件触发时的效果
   */
  onChangeTrigger(scenario) {
    if (!scenario) return;

    CharacterGuide.setMood('warning');
    CharacterGuide.updateHint('changeTrigger', {});
    CharacterGuide.showMessage(typeof Locale !== 'undefined' ? Locale.t('guideChangePrefix') + (scenario.title || '请注意') : '⚠️ 变更事件：' + (scenario.title || '请注意'), 'warning', 5000);
  },

  /**
   * 检查当前章节是否全部完成
   */
  _checkChapterComplete() {
    if (typeof currentChapterId === 'undefined' || typeof GameData === 'undefined') return;
    const chapter = GameData.getChapter(currentChapterId);
    if (!chapter) return;

    const gameState = GameData.getGameState();
    const allDone = chapter.tasks.every(t => {
      const s = gameState?.tasks?.[t.id];
      return s && s.status === 'completed';
    });

    if (allDone) {
      CharacterGuide.setMood('happy');
      CharacterGuide.updateHint('chapterComplete', {});
    }
  },

  /**
   * 根据当前游戏状态自动更新角色提示（被定时调用）
   */
  refreshState() {
    if (typeof currentChapterId === 'undefined' || typeof GameData === 'undefined') return;

    const chapter = GameData.getChapter(currentChapterId);
    const gameState = GameData.getGameState();
    if (!chapter || !gameState) return;

    // 查找下一个待办任务
    let nextPending = null;
    for (const t of chapter.tasks) {
      const s = gameState.tasks?.[t.id];
      if (!s || s.status === 'pending') {
        nextPending = t;
        break;
      }
    }

    if (nextPending) {
      CharacterGuide.updateHint('nextTask', {
        taskName: nextPending.name
      });
    } else {
      // 本章所有任务都完成
      const allDone = chapter.tasks.every(t => {
        const s = gameState.tasks?.[t.id];
        return s && s.status === 'completed';
      });
      if (allDone) {
        CharacterGuide.updateHint('chapterComplete', {});
      }
    }
  }
};

/**
 * 游戏化 - 章节场景插画
 *
 * 功能：每个章节头部配一幅 SVG 卡通插画，放在章节描述下方
 * 每章一个场景，有微妙 CSS 动画（齿轮转动、火箭上升、指示灯闪烁等）
 */

const ChapterIllustrations = {

  /**
   * 根据章节 ID 返回 SVG 插画 HTML
   */
  getSVG(chapterId) {
    const fn = this._scenarios[chapterId];
    if (!fn) return '';
    return fn();
  },

  /**
   * 内联 CSS 动画（只注入一次）
   */
  _stylesInjected: false,
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      .chapter-illustration {
        text-align: center;
        margin: 16px 0 8px 0;
        opacity: 0;
        animation: illustrationFadeIn 0.6s ease-out 0.3s forwards;
      }
      @keyframes illustrationFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Ch4 齿轮转动 */
      .ill-gear {
        transform-origin: center;
        animation: gearSpin 4s linear infinite;
      }
      @keyframes gearSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      /* Ch5 火箭上升 */
      .ill-rocket {
        animation: rocketFloat 2s ease-in-out infinite;
      }
      @keyframes rocketFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }

      /* Ch6 指示灯闪烁 */
      .ill-blink {
        animation: lightBlink 1.5s ease-in-out infinite;
      }
      @keyframes lightBlink {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.3; }
      }

      /* Ch1 放大镜晃动 */
      .ill-magnify {
        transform-origin: 80% 80%;
        animation: magnifyWobble 3s ease-in-out infinite;
      }
      @keyframes magnifyWobble {
        0%, 100% { transform: rotate(-8deg); }
        50%      { transform: rotate(8deg); }
      }

      /* Ch2 笔尖书写 */
      .ill-pen {
        animation: penWrite 2s ease-in-out infinite;
      }
      @keyframes penWrite {
        0%, 100% { transform: translate(0, 0); }
        25%      { transform: translate(3px, -2px); }
        50%      { transform: translate(6px, 0); }
        75%      { transform: translate(3px, 2px); }
      }

      /* Ch3 流程线流动 */
      .ill-flow {
        stroke-dasharray: 8 4;
        animation: flowDash 1.5s linear infinite;
      }
      @keyframes flowDash {
        from { stroke-dashoffset: 0; }
        to   { stroke-dashoffset: -12; }
      }
    `;
    document.head.appendChild(style);
  },

  /**
   * 各章节场景 SVG 定义
   */
  _scenarios: {
    // ═══════════════════════════════════════
    // Ch1: 战略发现与立项 — 会议室讨论
    // 场景：3 个小人围在圆桌旁，桌上有放大镜，墙上白板
    // ═══════════════════════════════════════
    'ch1': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景 -->
            <rect width="280" height="110" rx="12" fill="#f0f4ff"/>
            <!-- 白板 -->
            <rect x="90" y="8" width="100" height="40" rx="4" fill="white" stroke="#b0bec5" stroke-width="1.5"/>
            <line x1="100" y1="18" x2="170" y2="18" stroke="#90caf9" stroke-width="2" stroke-linecap="round"/>
            <line x1="100" y1="26" x2="155" y2="26" stroke="#a5d6a7" stroke-width="2" stroke-linecap="round"/>
            <line x1="100" y1="34" x2="165" y2="34" stroke="#ffcc80" stroke-width="2" stroke-linecap="round"/>
            <!-- 圆桌 -->
            <ellipse cx="140" cy="88" rx="50" ry="14" fill="#8d6e63"/>
            <ellipse cx="140" cy="85" rx="50" ry="14" fill="#a1887f"/>
            <!-- 小人 左 -->
            <circle cx="100" cy="60" r="8" fill="#ffcc80"/>
            <rect x="94" y="68" width="12" height="18" rx="4" fill="#42a5f5"/>
            <!-- 小人 右 -->
            <circle cx="180" cy="60" r="8" fill="#ffcc80"/>
            <rect x="174" y="68" width="12" height="18" rx="4" fill="#ef5350"/>
            <!-- 小人 中 -->
            <circle cx="140" cy="52" r="8" fill="#ffcc80"/>
            <rect x="134" y="60" width="12" height="20" rx="4" fill="#66bb6a"/>
            <!-- 放大镜 -->
            <g class="ill-magnify">
              <circle cx="140" cy="82" r="6" fill="none" stroke="#42a5f5" stroke-width="2"/>
              <line x1="144" y1="86" x2="150" y2="92" stroke="#42a5f5" stroke-width="2" stroke-linecap="round"/>
            </g>
          </svg>
        </div>`;
    },

    // ═══════════════════════════════════════
    // Ch2: 项目准备与计划 — 计划制定
    // 场景：甘特图 + 日历 + 笔在书写
    // ═══════════════════════════════════════
    'ch2': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="110" rx="12" fill="#f0faf0"/>
            <!-- 甘特图 -->
            <rect x="16" y="16" width="160" height="70" rx="6" fill="white" stroke="#b0bec5" stroke-width="1.5"/>
            <line x1="16" y1="32" x2="176" y2="32" stroke="#e0e0e0" stroke-width="1"/>
            <line x1="16" y1="48" x2="176" y2="48" stroke="#e0e0e0" stroke-width="1"/>
            <line x1="16" y1="64" x2="176" y2="64" stroke="#e0e0e0" stroke-width="1"/>
            <rect x="28" y="20" width="60" height="8" rx="3" fill="#42a5f5"/>
            <rect x="50" y="36" width="80" height="8" rx="3" fill="#66bb6a"/>
            <rect x="40" y="52" width="50" height="8" rx="3" fill="#ffa726"/>
            <rect x="80" y="68" width="70" height="8" rx="3" fill="#ab47bc"/>
            <!-- 日历 -->
            <rect x="196" y="12" width="52" height="48" rx="4" fill="white" stroke="#b0bec5" stroke-width="1.5"/>
            <rect x="196" y="12" width="52" height="14" rx="4" fill="#ef5350"/>
            <text x="222" y="23" text-anchor="middle" fill="white" font-size="9" font-weight="bold">MAR</text>
            <text x="222" y="42" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">25</text>
            <!-- 笔 -->
            <g class="ill-pen">
              <line x1="220" y1="70" x2="250" y2="50" stroke="#1565c0" stroke-width="3" stroke-linecap="round"/>
              <polygon points="250,50 247,56 253,56" fill="#1565c0"/>
            </g>
            <!-- 团队小人排队 -->
            <circle cx="36" cy="95" r="5" fill="#ffcc80"/>
            <circle cx="48" cy="95" r="5" fill="#ffcc80"/>
            <circle cx="60" cy="95" r="5" fill="#ffcc80"/>
            <circle cx="72" cy="95" r="5" fill="#ffcc80"/>
            <rect x="33" y="100" width="6" height="6" rx="2" fill="#42a5f5"/>
            <rect x="45" y="100" width="6" height="6" rx="2" fill="#ef5350"/>
            <rect x="57" y="100" width="6" height="6" rx="2" fill="#66bb6a"/>
            <rect x="69" y="100" width="6" height="6" rx="2" fill="#ffa726"/>
          </svg>
        </div>`;
    },

    // ═══════════════════════════════════════
    // Ch3: 业务蓝图与方案设计 — 蓝图设计
    // 场景：流程图画板 + 对比表格（AS-IS vs TO-BE）
    // ═══════════════════════════════════════
    'ch3': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="110" rx="12" fill="#f8f0ff"/>
            <!-- 左：AS-IS 流程 -->
            <text x="50" y="16" text-anchor="middle" fill="#ef5350" font-size="8" font-weight="bold">AS-IS</text>
            <rect x="16" y="22" width="36" height="18" rx="3" fill="#ffcdd2" stroke="#ef5350" stroke-width="1"/>
            <text x="34" y="34" text-anchor="middle" fill="#c62828" font-size="6">需求</text>
            <line class="ill-flow" x1="52" y1="31" x2="72" y2="31" stroke="#ef5350" stroke-width="1.5"/>
            <rect x="74" y="22" width="36" height="18" rx="3" fill="#ffcdd2" stroke="#ef5350" stroke-width="1"/>
            <text x="92" y="34" text-anchor="middle" fill="#c62828" font-size="6">审核</text>
            <!-- 右：TO-BE 流程 -->
            <text x="220" y="16" text-anchor="middle" fill="#43a047" font-size="8" font-weight="bold">TO-BE</text>
            <rect x="140" y="22" width="36" height="18" rx="3" fill="#c8e6c9" stroke="#43a047" stroke-width="1"/>
            <text x="158" y="34" text-anchor="middle" fill="#2e7d32" font-size="6">提交</text>
            <line class="ill-flow" x1="176" y1="31" x2="196" y2="31" stroke="#43a047" stroke-width="1.5"/>
            <rect x="198" y="22" width="36" height="18" rx="3" fill="#c8e6c9" stroke="#43a047" stroke-width="1"/>
            <text x="216" y="34" text-anchor="middle" fill="#2e7d32" font-size="6">审批</text>
            <!-- 对比表区域 -->
            <rect x="16" y="52" width="248" height="46" rx="4" fill="white" stroke="#b0bec5" stroke-width="1"/>
            <line x1="140" y1="52" x2="140" y2="98" stroke="#e0e0e0" stroke-width="1"/>
            <text x="74" y="66" text-anchor="middle" fill="#ef5350" font-size="7">手动流程</text>
            <text x="214" y="66" text-anchor="middle" fill="#43a047" font-size="7">SAP 自动化</text>
            <!-- 流程线 -->
            <line class="ill-flow" x1="30" y1="76" x2="110" y2="76" stroke="#ef5350" stroke-width="2" stroke-linecap="round"/>
            <line class="ill-flow" x1="150" y1="76" x2="230" y2="76" stroke="#43a047" stroke-width="2" stroke-linecap="round"/>
            <line class="ill-flow" x1="30" y1="86" x2="90" y2="86" stroke="#ef5350" stroke-width="2" stroke-linecap="round"/>
            <line class="ill-flow" x1="150" y1="86" x2="210" y2="86" stroke="#43a047" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>`;
    },

    // ═══════════════════════════════════════
    // Ch4: 系统配置与开发测试 — 系统搭建
    // 场景：齿轮 + 代码屏幕 + 测试管
    // ═══════════════════════════════════════
    'ch4': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="110" rx="12" fill="#fff8e1"/>
            <!-- 齿轮 1 -->
            <g class="ill-gear" style="transform-origin: 60px 55px;">
              <circle cx="60" cy="55" r="22" fill="none" stroke="#ffa726" stroke-width="4" stroke-dasharray="6 3"/>
              <circle cx="60" cy="55" r="14" fill="#ffb74d" stroke="#ffa726" stroke-width="2"/>
              <circle cx="60" cy="55" r="5" fill="#fff8e1"/>
            </g>
            <!-- 齿轮 2 -->
            <g class="ill-gear" style="transform-origin: 110px 55px; animation-direction: reverse;">
              <circle cx="110" cy="55" r="18" fill="none" stroke="#42a5f5" stroke-width="4" stroke-dasharray="5 3"/>
              <circle cx="110" cy="55" r="11" fill="#64b5f6" stroke="#42a5f5" stroke-width="2"/>
              <circle cx="110" cy="55" r="4" fill="#fff8e1"/>
            </g>
            <!-- 代码屏幕 -->
            <rect x="140" y="16" width="90" height="56" rx="6" fill="#263238"/>
            <rect x="140" y="16" width="90" height="10" rx="6" fill="#37474f"/>
            <rect x="172" y="22" width="26" height="4" rx="2" fill="#78909c"/>
            <line x1="148" y1="34" x2="165" y2="34" stroke="#66bb6a" stroke-width="2" stroke-linecap="round"/>
            <line x1="148" y1="42" x2="195" y2="42" stroke="#42a5f5" stroke-width="2" stroke-linecap="round"/>
            <line x1="154" y1="50" x2="210" y2="50" stroke="#ffa726" stroke-width="2" stroke-linecap="round"/>
            <line x1="148" y1="58" x2="180" y2="58" stroke="#ab47bc" stroke-width="2" stroke-linecap="round"/>
            <!-- 测试管 -->
            <rect x="244" y="30" width="10" height="36" rx="5" fill="#e0e0e0" stroke="#bdbdbd" stroke-width="1"/>
            <rect x="244" y="44" width="10" height="22" rx="5" fill="#66bb6a" opacity="0.6"/>
            <circle cx="249" cy="50" r="2" fill="white" opacity="0.5"/>
            <circle cx="247" cy="56" r="1.5" fill="white" opacity="0.5"/>
            <!-- 底座 -->
            <rect x="148" y="72" width="74" height="6" rx="3" fill="#455a64"/>
          </svg>
        </div>`;
    },

    // ═══════════════════════════════════════
    // Ch5: 上线准备与切换 — 火箭发射
    // 场景：火箭 + 发射台 + 进度条 + 星星
    // ═══════════════════════════════════════
    'ch5': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="110" rx="12" fill="#e3f2fd"/>
            <!-- 星星 -->
            <circle cx="30" cy="20" r="2" fill="#ffd54f"><animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/></circle>
            <circle cx="250" cy="15" r="1.5" fill="#ffd54f"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite"/></circle>
            <circle cx="60" cy="10" r="1" fill="#ffd54f"/>
            <!-- 火箭 -->
            <g class="ill-rocket">
              <!-- 火箭体 -->
              <path d="M134 18 Q140 8 146 18 L146 52 L134 52 Z" fill="#ef5350"/>
              <path d="M134 18 Q140 8 146 18" fill="#c62828"/>
              <!-- 火箭头 -->
              <polygon points="140,4 137,14 143,14" fill="#ffd54f"/>
              <!-- 窗户 -->
              <circle cx="140" cy="30" r="5" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.5"/>
              <!-- 翼 -->
              <polygon points="134,46 126,56 134,52" fill="#ef5350"/>
              <polygon points="146,46 154,56 146,52" fill="#ef5350"/>
              <!-- 火焰 -->
              <ellipse cx="140" cy="58" rx="6" ry="10" fill="#ffa726" opacity="0.8">
                <animate attributeName="ry" values="10;14;10" dur="0.5s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="140" cy="60" rx="3" ry="7" fill="#ffd54f">
                <animate attributeName="ry" values="7;10;7" dur="0.5s" repeatCount="indefinite"/>
              </ellipse>
            </g>
            <!-- 发射台 -->
            <rect x="124" y="70" width="32" height="4" rx="2" fill="#78909c"/>
            <rect x="130" y="74" width="20" height="6" fill="#546e7a"/>
            <!-- 进度条 -->
            <rect x="40" y="86" width="200" height="10" rx="5" fill="#e0e0e0"/>
            <rect x="40" y="86" width="140" height="10" rx="5" fill="#43a047"/>
            <text x="245" y="95" fill="#43a047" font-size="8" font-weight="bold">70%</text>
          </svg>
        </div>`;
    },

    // ═══════════════════════════════════════
    // Ch6: 上线护航与持续优化 — 运维护航
    // 场景：盾牌 + 服务器 + 监控屏（指示灯闪烁）
    // ═══════════════════════════════════════
    'ch6': function() {
      return `
        <div class="chapter-illustration">
          <svg width="280" height="110" viewBox="0 0 280 110" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="110" rx="12" fill="#f3e5f5"/>
            <!-- 盾牌 -->
            <path d="M60 14 L80 8 L100 14 L100 44 Q100 64 80 72 Q60 64 60 44 Z" fill="#7e57c2" opacity="0.85"/>
            <path d="M64 18 L80 13 L96 18 L96 42 Q96 60 80 67 Q64 60 64 42 Z" fill="#9575cd"/>
            <path d="M74 34 L78 40 L88 30" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- 服务器 -->
            <rect x="124" y="16" width="56" height="30" rx="4" fill="#37474f"/>
            <rect x="130" y="22" width="16" height="4" rx="1" fill="#66bb6a"/>
            <circle class="ill-blink" cx="152" cy="24" r="3" fill="#66bb6a"/>
            <line x1="130" y1="32" x2="174" y2="32" stroke="#546e7a" stroke-width="1"/>
            <rect x="124" y="50" width="56" height="30" rx="4" fill="#37474f"/>
            <rect x="130" y="56" width="16" height="4" rx="1" fill="#66bb6a"/>
            <circle class="ill-blink" cx="152" cy="58" r="3" fill="#42a5f5"/>
            <line x1="130" y1="66" x2="174" y2="66" stroke="#546e7a" stroke-width="1"/>
            <!-- 监控屏 -->
            <rect x="200" y="14" width="64" height="46" rx="4" fill="#263238" stroke="#455a64" stroke-width="2"/>
            <rect x="204" y="18" width="56" height="34" rx="2" fill="#1b5e20"/>
            <!-- 监控曲线 -->
            <polyline points="210,42 218,36 226,38 234,28 242,32 250,24 256,20" fill="none" stroke="#66bb6a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle class="ill-blink" cx="256" cy="20" r="2.5" fill="#66bb6a"/>
            <!-- 监控屏底座 -->
            <rect x="224" y="60" width="16" height="8" fill="#455a64"/>
            <rect x="218" y="68" width="28" height="4" rx="2" fill="#546e7a"/>
            <!-- 心电/状态指示 -->
            <polyline points="12,86 20,86 24,80 28,92 32,86 40,86" fill="none" stroke="#7e57c2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>`;
    }
  }
};

/**
 * 章节开场全屏动画 — 游戏化章节过渡效果
 *
 * 打开章节时：全屏覆盖层 + 章节插画（放大版）+ 标题 + 引导文案
 * 用户点击 → 向上滑出 + 缩小淡出 → 章节内容淡入
 * 已看过的章节不再弹全屏动画（sessionStorage 记录），只弹快速缩略动画
 */

const ChapterIntro = {
  // 每章开场文案（复用 NPC 气泡文案 + 扩展）
  dialogues: {
    'ch1': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch1') : '欢迎来到项目启动阶段！首先搞清楚一件事：为什么要上 SAP？',
      icon: '🤔',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch1sub') : 'Discover — 战略发现与立项'
    },
    'ch2': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch2') : '立项通过！现在是"排兵布阵"的时候。组建团队、制定计划、开好启动会。',
      icon: '📋',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch2sub') : 'Prepare — 项目准备与计划'
    },
    'ch3': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch3') : '该梳理业务流程了。先看看现在是怎么做的，再设计未来怎么做。',
      icon: '🔍',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch3sub') : 'Explore — 业务蓝图与方案设计'
    },
    'ch4': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch4') : '蓝图确认，进入系统搭建！配置、开发、测试，多线并行。',
      icon: '⚙️',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch4sub') : 'Realize — 系统配置与开发测试'
    },
    'ch5': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch5') : '关键来了！上线切换不能有差错，UAT、培训、数据迁移，一个一个来。',
      icon: '🚀',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch5sub') : 'Deploy — 上线准备与切换'
    },
    'ch6': {
      text: typeof Locale !== 'undefined' ? Locale.t('intro_ch6') : '系统上线了，但战斗还没结束。现场护航、问题跟踪，确保稳定运行。',
      icon: '🛡️',
      subtitle: typeof Locale !== 'undefined' ? Locale.t('intro_ch6sub') : 'Run — 上线护航与持续优化'
    }
  },

  // 不再需要 sessionStorage 追踪（每次都显示全屏动画）

  /**
   * 构建章节开场走马灯字幕 HTML
   */
  _buildCreditsHTML(chapter, taskList, docList) {
    if (!taskList?.length && !docList?.length) return '';

    const t = typeof Locale !== 'undefined' ? Locale.t.bind(Locale) : (k => k);

    const taskItems = (taskList || []).map((name, i) => {
      const taskObj = chapter.tasks?.[i];
      const descKey = taskObj ? ('taskDesc_' + taskObj.id.replace('-', '_')) : null;
      const desc = descKey ? (t(descKey) || name) : name;
      return `<div class="intro-credit-line" style="animation-delay:${0.8 + i * 0.2}s">
        <span class="intro-credit-icon">▶</span>${desc}
      </div>`;
    }).join('');

    const docItems = (docList || []).map((name, i) => {
      const docObj = chapter.documents?.[i];
      const docKey = docObj ? ('doc_' + docObj.id) : null;
      const docName = docKey ? (t(docKey) || name) : name;
      return `<div class="intro-credit-line" style="animation-delay:${1.8 + i * 0.2}s">
        <span class="intro-credit-icon">📄</span>${docName}
      </div>`;
    }).join('');

    return `
      <div class="intro-credits">
        <div class="intro-credits-section">
          <div class="intro-credits-title" style="animation-delay:${0.6 + taskList.length * 0.2}s">📋 ${typeof Locale !== 'undefined' ? Locale.t('introCreditsTasks') : '本阶段任务'}</div>
          ${taskItems}
        </div>
        <div class="intro-credits-section" style="animation-delay:${1.2 + taskList.length * 0.2}s">
          <div class="intro-credits-title">📄 ${typeof Locale !== 'undefined' ? Locale.t('introCreditsDocs') : '本阶段交付文档'}</div>
          ${docItems}
        </div>
      </div>`;
  },

  /**
   * 显示章节开场动画（每次都显示全屏动画）
   */
  show(chapterId) {
    console.log('[ChapterIntro] show(' + chapterId + ')');
    const chapter = typeof GameData !== 'undefined' ? GameData.getChapter(chapterId) : null;
    if (!chapter) { console.warn('[ChapterIntro] chapter not found:', chapterId); return; }

    const dialogue = this.dialogues[chapterId];
    if (!dialogue) { console.warn('[ChapterIntro] dialogue not found:', chapterId); return; }

    // 获取 SVG 插画（放大版）
    const svgFn = typeof ChapterIllustrations !== 'undefined' ? ChapterIllustrations._scenarios[chapterId] : null;
    const illustrationHTML = svgFn ? svgFn() : '';

    // 构建本章节文档列表（走马灯字幕）
    const docList = (chapter.documents || []).map(d => d.name);
    const taskList = (chapter.tasks || []).map(t => t.name);

    // 始终全屏动画
    this._createFullscreenOverlay(chapterId, chapter, dialogue, illustrationHTML, docList, taskList);
  },

  /**
   * 创建全屏覆盖层
   */
  _createFullscreenOverlay(chapterId, chapter, dialogue, illustrationHTML, docList, taskList) {
    // 移除旧覆盖层
    const existing = document.getElementById('chapterIntroOverlay');
    if (existing) existing.remove();

    // 构建走马灯字幕：任务列表 + 文档列表
    const creditsHTML = this._buildCreditsHTML(chapter, taskList, docList);

    // 创建覆盖层
    const overlay = document.createElement('div');
    overlay.id = 'chapterIntroOverlay';
    overlay.innerHTML = `
      <div class="chapter-intro-content">
        ${illustrationHTML ? '<div class="chapter-intro-illustration">' + illustrationHTML + '</div>' : ''}
        <h1 class="chapter-intro-title">${typeof Locale !== 'undefined' ? Locale.t(chapter.id + 'Name') : chapter.name}</h1>
        <div class="chapter-intro-subtitle">${dialogue.subtitle}</div>
        <p class="chapter-intro-text">${dialogue.text}</p>
        ${creditsHTML}
        <div class="chapter-intro-hint">— ${typeof Locale !== 'undefined' ? Locale.t('introDismiss') : '点击任意处继续'} —</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 注入动画样式（只注入一次）
    this._injectStyles();

    // 点击关闭
    const dismiss = () => this._dismiss(overlay);
    overlay.addEventListener('click', dismiss, { once: true });

    // ESC 键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        dismiss();
      }
    };
    document.addEventListener('keydown', escHandler, { once: true });
  },

  /**
   * 关闭动画（上滑 + 缩小 + 淡出）
   */
  _dismiss(overlay) {
    overlay.classList.add('chapter-intro-dismiss');
    setTimeout(() => overlay.remove(), 600);
  },

  /**
   * 注入 CSS 样式
   */
  _stylesInjected: false,
  _injectStyles() {
    if (this._stylesInjected) return;
    this._stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      /* ═══════════════════════════════════════
         全屏章节开场动画
         ═══════════════════════════════════════ */
      #chapterIntroOverlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        animation: intro-fadeIn 0.5s ease-out forwards;
        -webkit-animation: intro-fadeIn 0.5s ease-out forwards;
      }
      @keyframes intro-fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @-webkit-keyframes intro-fadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      #chapterIntroOverlay.chapter-intro-dismiss {
        animation: intro-dismiss 0.6s ease-in forwards;
      }
      @keyframes intro-dismiss {
        0%   { opacity: 1; transform: scale(1) translateY(0); }
        100% { opacity: 0; transform: scale(0.92) translateY(-40px); }
      }

      .chapter-intro-content {
        text-align: center;
        color: white;
        max-width: 500px;
        padding: 40px;
        animation: intro-content-rise 0.6s ease-out 0.2s both;
      }
      @keyframes intro-content-rise {
        from { opacity: 0; transform: translateY(30px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .chapter-intro-illustration {
        margin: 20px auto;
        animation: intro-ill-fade 0.8s ease-out 0.4s both;
      }
      .chapter-intro-illustration svg {
        width: 380px;
        height: auto;
      }
      @keyframes intro-ill-fade {
        from { opacity: 0; transform: scale(0.9); }
        to   { opacity: 1; transform: scale(1); }
      }

      .chapter-intro-title {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 20px 0 8px 0;
        text-shadow: 0 2px 20px rgba(0,0,0,0.5);
      }

      .chapter-intro-subtitle {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 24px;
        letter-spacing: 2px;
      }

      .chapter-intro-text {
        font-size: 1.15rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 32px;
      }

      .chapter-intro-hint {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.4);
        animation: intro-pulse 2s ease-in-out infinite;
      }
      @keyframes intro-pulse {
        0%, 100% { opacity: 0.4; }
        50%      { opacity: 0.8; }
      }

      /* ═══════════════════════════════════════
         走马灯字幕（章节任务 + 文档列表）
         ═══════════════════════════════════════ */
      .intro-credits {
        margin: 24px auto 20px auto;
        max-width: 440px;
        text-align: left;
      }
      .intro-credits-section {
        margin-bottom: 16px;
        opacity: 0;
        animation: credit-fade-in 0.5s ease-out forwards;
      }
      @keyframes credit-fade-in {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .intro-credits-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        text-align: center;
      }
      .intro-credit-line {
        font-size: 0.82rem;
        color: rgba(255, 255, 255, 0.7);
        padding: 4px 8px;
        opacity: 0;
        animation: credit-line-in 0.4s ease-out forwards;
        line-height: 1.5;
      }
      @keyframes credit-line-in {
        from { opacity: 0; transform: translateX(-12px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      .intro-credit-line:hover {
        color: rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.06);
        border-radius: 4px;
      }
      .intro-credit-icon {
        margin-right: 6px;
        font-size: 0.9rem;
      }
    `;
    document.head.appendChild(style);
  }
};

// 导出全局
window.NPCBubbles = NPCBubbles;
window.CharacterGuide = CharacterGuide;
window.ChapterIllustrations = ChapterIllustrations;
window.ChapterIntro = ChapterIntro;
window.GameFeatures = GameFeatures;

console.log('[GameFeatures] 模块加载完成');
