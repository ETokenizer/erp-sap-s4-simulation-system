/**
 * ERP SAP S4 HANA 上线模拟演练系统
 * Cloudflare Worker — DashScope API 代理
 *
 * 用途：在前端和 DashScope API 之间做代理
 * - 隐藏 API Key（存在环境变量中，前端看不到）
 * - 解决 CORS 问题（Worker 天然支持跨域）
 * - 统一管理模型调用
 *
 * 部署：粘贴到 Cloudflare Workers 编辑器，或 wrangler deploy
 */

// ═══════════════════════════════════════════════════════════
// 环境变量（在 Cloudflare Dashboard → Worker → Settings → Variables 中配置）
// DASHSCOPE_API_KEY — 阿里云 DashScope API Key
// ═══════════════════════════════════════════════════════════

const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// 允许的来源（只允许你的前端域名调用）
const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  // 部署后在这里添加你的线上域名
  // 'https://your-domain.com',
];

export default {
  async fetch(request, env, ctx) {
    // 处理预检请求（OPTIONS）
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // 只允许 POST /generate
    if (request.method !== 'POST' || !request.url.endsWith('/generate')) {
      return json({ error: '请使用 POST /generate' }, 404);
    }

    // 检查来源（可选，防止被其他人盗用）
    const origin = request.headers.get('Origin') || '';
    if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
      // 开发阶段放行，生产环境建议取消注释
      // return json({ error: '不允许的来源' }, 403);
    }

    try {
      const body = await request.json();
      const { model, messages, max_tokens } = body;

      // 验证必要参数
      if (!messages || !Array.isArray(messages)) {
        return json({ error: '缺少 messages 参数' }, 400);
      }

      // 从环境变量读取 API Key
      const apiKey = env.DASHSCOPE_API_KEY;
      if (!apiKey) {
        return json({ error: '服务器未配置 API Key' }, 500);
      }

      // 转发请求到 DashScope
      const response = await fetch(DASHSCOPE_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'qwen-turbo',
          messages: messages,
          max_tokens: max_tokens || 8192,
          temperature: 0.7,
        }),
      });

      // 返回 DashScope 的响应（带 CORS 头）
      const data = await response.text();
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (!response.ok) {
        console.error(`DashScope 返回错误: HTTP ${response.status}`);
        return new Response(data, { status: response.status, headers });
      }

      return new Response(data, { status: 200, headers });

    } catch (e) {
      console.error('Worker 异常:', e);
      return json({ error: `服务器错误: ${e.message}` }, 500);
    }
  },
};

function handleOptions(request) {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
