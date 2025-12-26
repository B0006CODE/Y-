import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const serverRoot = path.join(projectRoot, 'server');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDotEnv = (content) => {
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
};

const loadServerEnv = async () => {
  try {
    const envPath = path.join(serverRoot, '.env');
    const content = await fs.readFile(envPath, 'utf8');
    return parseDotEnv(content);
  } catch {
    return {};
  }
};

const getFreePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => resolve(port));
    });
  });

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
};

const waitForHealth = async (baseUrl, timeoutMs = 15000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const result = await fetchJson(`${baseUrl}/api/health`);
      if (result.ok && result.data?.ok) return;
    } catch {
      // ignore
    }
    await sleep(250);
  }
  throw new Error('server health check timed out');
};

const randomId = () => Math.random().toString(16).slice(2);

const main = async () => {
  try {
    await fs.access(path.join(serverRoot, 'node_modules'));
  } catch {
    throw new Error(
      'server dependencies are not installed; run: `cd server && npm install` (or `npm install --omit=dev` for production)'
    );
  }

  const serverEnv = await loadServerEnv();
  const requiredMysqlKeys = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
  const missingMysqlKeys = requiredMysqlKeys.filter((k) => !(process.env[k] || serverEnv[k]));
  if (missingMysqlKeys.length) {
    throw new Error(
      `missing MySQL config (${missingMysqlKeys.join(', ')}); set env vars or create \`server/.env\` based on \`server/.env.example\``
    );
  }

  const port = await getFreePort();
  if (!port) throw new Error('failed to allocate a free port');

  const jwtSecret = `smoke-${randomId()}-${randomId()}`;
  const serverEntry = path.join(serverRoot, 'index.js');
  const baseUrl = `http://127.0.0.1:${port}`;

  const child = spawn(process.execPath, [serverEntry], {
    cwd: projectRoot,
    env: {
      ...process.env,
      ...serverEnv,
      PORT: String(port),
      JWT_SECRET: jwtSecret,
      CORS_ORIGIN: '*',
      LLM_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    },
    stdio: 'inherit'
  });

  let earlyExit = null;
  child.on('exit', (code, signal) => {
    earlyExit = { code, signal };
  });

  const cleanup = async () => {
    if (!child.killed) {
      try {
        child.kill('SIGTERM');
      } catch {
        // ignore
      }
    }
  };

  try {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      if (earlyExit) {
        throw new Error(`server exited early (code=${earlyExit.code}, signal=${earlyExit.signal ?? 'none'})`);
      }
      try {
        const result = await fetchJson(`${baseUrl}/api/health`);
        if (result.ok && result.data?.ok) break;
      } catch {
        // ignore
      }
      await sleep(250);
    }
    if (earlyExit) {
      throw new Error(`server exited early (code=${earlyExit.code}, signal=${earlyExit.signal ?? 'none'})`);
    }

    const username = `u_${randomId()}`;
    const password = `p_${randomId()}_${randomId()}`;

    const register = await fetchJson(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (!register.ok || !register.data?.token) {
      throw new Error(`register failed: ${register.status} ${JSON.stringify(register.data)}`);
    }

    const token = register.data.token;
    const me = await fetchJson(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!me.ok || me.data?.user?.username !== username) {
      throw new Error(`me failed: ${me.status} ${JSON.stringify(me.data)}`);
    }

    const gameState = {
      history: [{ role: 'user', content: 'hello' }, { role: 'assistant', content: 'world' }],
      stats: { affinity: 10, trust: 20, power: 30, risk: 40 },
      currentScene: 'banquet',
      currentChapter: 'prologue'
    };

    const save = await fetchJson(`${baseUrl}/api/saves/1?gameMode=story`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ gameState })
    });
    if (!save.ok || !save.data?.success) {
      throw new Error(`save failed: ${save.status} ${JSON.stringify(save.data)}`);
    }

    const list = await fetchJson(`${baseUrl}/api/saves?gameMode=story`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const slot1 = list.data?.slots?.find?.((s) => s.slot === 1);
    if (!list.ok || !slot1 || slot1.isEmpty !== false) {
      throw new Error(`list failed: ${list.status} ${JSON.stringify(list.data)}`);
    }

    const load = await fetchJson(`${baseUrl}/api/saves/1?gameMode=story`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!load.ok || load.data?.gameState?.currentScene !== 'banquet') {
      throw new Error(`load failed: ${load.status} ${JSON.stringify(load.data)}`);
    }

    const del = await fetchJson(`${baseUrl}/api/saves/1?gameMode=story`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!del.ok || !del.data?.success) {
      throw new Error(`delete failed: ${del.status} ${JSON.stringify(del.data)}`);
    }

    const llmMissingAuth = await fetchJson(`${baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      body: JSON.stringify({ stream: false, model: 'x', messages: [] })
    });
    if (llmMissingAuth.status !== 401) {
      throw new Error(`llm auth check failed: expected 401, got ${llmMissingAuth.status}`);
    }

    console.log('OK: smoke test passed');
  } finally {
    await cleanup();
  }
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
