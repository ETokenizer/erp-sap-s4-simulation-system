/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * 认证模块 - 基于 Supabase Auth REST API（零 CDN 依赖）
 * 游客可体验 Ch.1，Ch.2+ 需要注册
 */

const SUPABASE_AUTH_URL = 'https://sracmvaxtzqepqzxnafa.supabase.co/auth/v1';
const SUPABASE_KEY = 'sb_publishable_sPIokknjgWneVhLhcu0vEQ_HfDbZPAm';

const AuthService = {

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return !!localStorage.getItem('erpSimulationUser');
  },

  /**
   * 获取当前用户（从 localStorage 缓存）
   */
  getCurrentUser() {
    const data = localStorage.getItem('erpSimulationUser');
    return data ? JSON.parse(data) : null;
  },

  /**
   * 使用 Supabase REST API 注册（邮箱 + 密码）
   */
  async signUpWithEmail(email, password) {
    try {
      console.log('[AuthService] signUpWithEmail: 开始注册', email);
      const resp = await fetch(`${SUPABASE_AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({ email, password })
      });
      console.log('[AuthService] signUpWithEmail: 响应状态', resp.status);
      const data = await resp.json();
      console.log('[AuthService] signUpWithEmail: 响应数据', JSON.stringify(data));

      if (data.error) return { success: false, error: data.error.message || data.error };

      // 缓存用户信息到 localStorage
      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          registeredAt: data.user.created_at,
          lastLoginAt: new Date().toISOString()
        };
        localStorage.setItem('erpSimulationUser', JSON.stringify(user));
        // 同时设置 erpSimulationCurrentUser（project-list.html 需要）
        localStorage.setItem('erpSimulationCurrentUser', JSON.stringify(user));
        console.log('[AuthService] signUpWithEmail: 已保存用户到 localStorage');
      }

      return { success: true, user: data.user };
    } catch (e) {
      console.error('[AuthService] signUpWithEmail: 异常', e);
      const msg = this._getFriendlyErrorMessage(e);
      return { success: false, error: msg };
    }
  },

  /**
   * 使用 Supabase REST API 登录（邮箱 + 密码）
   */
  async signInWithEmail(email, password) {
    try {
      console.log('[AuthService] signInWithEmail: 开始登录', email);
      const resp = await fetch(`${SUPABASE_AUTH_URL}/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'x-client-info': 'supabase-auth-web'
        },
        body: JSON.stringify({ email, password })
      });
      console.log('[AuthService] signInWithEmail: 响应状态', resp.status);
      const data = await resp.json();
      console.log('[AuthService] signInWithEmail: 响应数据 keys', Object.keys(data));
      console.log('[AuthService] signInWithEmail: 完整响应', JSON.stringify(data));

      // 检查 HTTP 状态码
      if (!resp.ok) {
        console.error('[AuthService] signInWithEmail: HTTP 错误', resp.status, data);
        return { success: false, error: data.msg || data.error_message || data.error || '登录失败' };
      }

      // 检查是否有 user 字段
      if (!data.user) {
        console.error('[AuthService] signInWithEmail: 响应中没有 user 字段', data);
        return { success: false, error: '登录响应异常：缺少 user 字段' };
      }

      // 缓存用户信息到 localStorage
      const user = {
        id: data.user.id,
        email: data.user.email,
        lastLoginAt: new Date().toISOString()
      };
      console.log('[AuthService] signInWithEmail: 保存用户到 localStorage', user);
      localStorage.setItem('erpSimulationUser', JSON.stringify(user));
      // 同时设置 erpSimulationCurrentUser（project-list.html 需要）
      localStorage.setItem('erpSimulationCurrentUser', JSON.stringify(user));
      console.log('[AuthService] signInWithEmail: 验证读取 erpSimulationUser', localStorage.getItem('erpSimulationUser'));
      console.log('[AuthService] signInWithEmail: 验证读取 erpSimulationCurrentUser', localStorage.getItem('erpSimulationCurrentUser'));

      return { success: true, user: data.user };
    } catch (e) {
      console.error('[AuthService] signInWithEmail: 异常', e);
      const msg = this._getFriendlyErrorMessage(e);
      return { success: false, error: msg };
    }
  },

  /**
   * 将底层网络错误翻译为用户友好的中文提示
   */
  _getFriendlyErrorMessage(e) {
    const msg = (e.message || e.toString()).toLowerCase();
    // fetch 被 reject（网络不通、域名解析失败、CORS 等）
    if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to connect') || msg.includes('load failed')) {
      return '无法连接到认证服务器，请检查网络后重试';
    }
    if (msg.includes('timeout')) {
      return '请求超时，请检查网络后重试';
    }
    return '网络异常，请稍后重试';
  },

  /**
   * 退出登录（同步）
   * 注意：项目数据清理由调用方（logout 函数）按 createdBy 精确处理
   */
  signOut(isGuest = false) {
    // 清除认证信息
    localStorage.removeItem('erpSimulationUser');
    localStorage.removeItem('erpSimulationCurrentUser');
  },

  /**
   * 清除游客本地数据
   */
  cleanGuestData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key === 'erpSimulationUser' ||
        key === 'erpSimulationCurrentUser' ||
        key === 'erpSimulationProjects' ||
        key === 'erpSimulationCurrentProject' ||
        key.startsWith('erp_project_') ||
        key.startsWith('erp_project_') && key.includes('_payment')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  /**
   * 清除 IndexedDB 中的文档缓存
   */
  async cleanIndexedDB() {
    if (typeof DocumentFileStore === 'undefined') return;
    try {
      await DocumentFileStore.clearAll();
    } catch (e) {
      console.warn('清理 IndexedDB 失败:', e);
    }
  },

  /**
   * 弹出注册引导对话框
   */
  showRegisterModal() {
    return new Promise((resolve) => {
      const modal = document.getElementById('registerModal');
      if (!modal) {
        if (confirm('注册账号解锁全部功能！\n\n点击"确定"前往注册页面。')) {
          window.location.replace('login.html?_=' + Date.now());
          resolve(false);
        } else {
          resolve(false);
        }
        return;
      }
      modal._resolveCallback = resolve;
      modal.classList.add('active');
      modal.style.display = 'flex';
    });
  },

  closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (modal._resolveCallback) {
        modal._resolveCallback(false);
        modal._resolveCallback = null;
      }
    }
  },

  showLoginModal() {
    return new Promise((resolve) => {
      const modal = document.getElementById('loginModal');
      if (!modal) {
        window.location.replace('login.html?_=' + Date.now());
        resolve(false);
        return;
      }
      modal._resolveCallback = resolve;
      modal.classList.add('active');
      modal.style.display = 'flex';
    });
  },

  closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (modal._resolveCallback) {
        modal._resolveCallback(false);
        modal._resolveCallback = null;
      }
    }
  },

  onLoginSuccess(user) {
    this.closeLoginModal();
    this.closeRegisterModal();
    window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
    if (typeof renderChapterList === 'function') {
      renderChapterList();
    }
  },

  quickLogin(displayName) {
    // 只清理会话信息，不清除项目数据
    // 项目隔离由 createProject 的 createdBy 标签 + loadProjects 的过滤实现
    localStorage.removeItem('erpSimulationCurrentUser');
    localStorage.removeItem('erpSimulationCurrentProject');

    const guest = {
      id: 'guest_' + Date.now(),
      displayName: displayName || '访客',
      isGuest: true,
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem('erpSimulationUser', JSON.stringify(guest));
    return guest;
  },

  isGuest() {
    const user = this.getCurrentUser();
    return user && user.isGuest;
  }
};

window.AuthService = AuthService;
console.log('Auth Service loaded (REST API mode, zero CDN)');
