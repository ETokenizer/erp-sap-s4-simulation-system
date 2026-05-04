/**
 * 文档文件存储 (IndexedDB)
 * 可靠持久化文档内容，避免 localStorage 数据丢失
 */
const DocumentFileStore = {
  DB_NAME: 'ERPSimulationDocs',
  DB_VERSION: 1,
  STORE_NAME: 'documents',
  db: null,

  /**
   * 打开数据库
   */
  open() {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('projectId', 'projectId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 保存文档
   */
  async save(projectId, docId, content) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const key = `${projectId}__${docId}`;

        store.put({
          key: key,
          projectId: projectId,
          docId: docId,
          content: content,
          savedAt: new Date().toISOString()
        });

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.save 失败:', err);
      return false;
    }
  },

  /**
   * 读取文档
   */
  async load(projectId, docId) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const key = `${projectId}__${docId}`;

        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.load 失败:', err);
      return null;
    }
  },

  /**
   * 删除文档
   */
  async remove(projectId, docId) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        const key = `${projectId}__${docId}`;

        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.remove 失败:', err);
      return false;
    }
  },

  /**
   * 获取项目下所有文档
   */
  async listByProject(projectId) {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);
        const index = store.index('projectId');

        const req = index.getAll(projectId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.listByProject 失败:', err);
      return [];
    }
  },

  /**
   * 清除指定项目的所有文档
   */
  async clearByProjectId(projectId) {
    try {
      const docs = await this.listByProject(projectId);
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        docs.forEach(doc => {
          store.delete(doc.key);
        });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.clearByProjectId 失败:', err);
      return false;
    }
  },

  /**
   * 清除所有文档
   */
  async clearAll() {
    try {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error('DocumentFileStore.clearAll 失败:', err);
      return false;
    }
  }
};
