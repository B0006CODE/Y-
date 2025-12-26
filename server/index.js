import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Readable } from 'node:stream';

dotenv.config();

const PORT = Number.parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_REQUIRE_AUTH = process.env.LLM_REQUIRE_AUTH === 'true';
const MAX_SLOTS = 5;

const app = express();
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : true;

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));

const MYSQL_HOST = process.env.MYSQL_HOST || '127.0.0.1';
const MYSQL_PORT = Number.parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'ancient_love_game';
const MYSQL_CONNECTION_LIMIT = Number.parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10', 10);

const pool = mysql.createPool({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: MYSQL_CONNECTION_LIMIT,
    queueLimit: 0,
    charset: 'utf8mb4'
});

const initDb = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            username VARCHAR(64) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_users_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS saves (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            game_mode VARCHAR(16) NOT NULL,
            slot TINYINT UNSIGNED NOT NULL,
            game_state JSON NOT NULL,
            saved_at DATETIME NOT NULL,
            preview VARCHAR(255) NULL,
            stats JSON NULL,
            current_scene VARCHAR(64) NULL,
            current_chapter VARCHAR(64) NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uk_saves_user_mode_slot (user_id, game_mode, slot),
            KEY idx_saves_user_mode (user_id, game_mode),
            CONSTRAINT fk_saves_user_id
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
};

const safeParse = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const normalizeMode = (value) => (value === 'survival' ? 'survival' : 'story');

const createToken = (user) => {
    return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
};

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ success: false, message: '请先登录' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = { id: payload.sub, username: payload.username };
        return next();
    } catch {
        return res.status(401).json({ success: false, message: '登录已过期' });
    }
};

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

app.post('/api/auth/register', async (req, res) => {
    const rawUsername = req.body?.username;
    const trimmedUsername = typeof rawUsername === 'string' ? rawUsername.trim() : '';
    const rawPassword = req.body?.password;
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    if (trimmedUsername.length < 2) {
        return res.status(400).json({ success: false, message: '用户名至少 2 个字符' });
    }
    if (password.length < 4) {
        return res.status(400).json({ success: false, message: '密码至少 4 个字符' });
    }

    try {
        const [existingRows] = await pool.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [trimmedUsername]);
        if (existingRows.length > 0) {
            return res.status(409).json({ success: false, message: '该用户名已被注册' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const createdAt = new Date();
        const [result] = await pool.execute(
            'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)',
            [trimmedUsername, passwordHash, createdAt]
        );

        const user = { id: result.insertId, username: trimmedUsername, createdAt: createdAt.toISOString() };
        const token = createToken(user);
        return res.json({ success: true, message: '注册成功', user, token });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ success: false, message: '注册失败' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const rawUsername = req.body?.username;
    const trimmedUsername = typeof rawUsername === 'string' ? rawUsername.trim() : '';
    const rawPassword = req.body?.password;
    const password = typeof rawPassword === 'string' ? rawPassword : '';

    if (!trimmedUsername || !password) {
        return res.status(400).json({ success: false, message: '请输入用户名和密码' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT id, username, password_hash, created_at FROM users WHERE username = ? LIMIT 1',
            [trimmedUsername]
        );

        const userRow = rows[0];
        if (!userRow) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        const ok = await bcrypt.compare(password, userRow.password_hash);
        if (!ok) {
            return res.status(401).json({ success: false, message: '密码错误' });
        }

        const createdAtIso = userRow.created_at instanceof Date ? userRow.created_at.toISOString() : String(userRow.created_at);
        const user = { id: userRow.id, username: userRow.username, createdAt: createdAtIso };
        const token = createToken(user);
        return res.json({ success: true, message: '登录成功', user, token });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: '登录失败' });
    }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get('/api/saves', requireAuth, (req, res) => {
    (async () => {
        const gameMode = normalizeMode(req.query.gameMode);
        const [rows] = await pool.execute(
            'SELECT slot, saved_at, preview, stats, current_scene, current_chapter FROM saves WHERE user_id = ? AND game_mode = ?',
            [req.user.id, gameMode]
        );

        const slotMap = new Map(rows.map(row => [row.slot, row]));
        const slots = Array.from({ length: MAX_SLOTS }, (_, index) => {
            const slot = index + 1;
            const data = slotMap.get(slot);
            if (!data) {
                return { slot, isEmpty: true, savedAt: null, preview: null, stats: null, currentScene: null, currentChapter: null };
            }
            const savedAtIso = data.saved_at instanceof Date ? data.saved_at.toISOString() : String(data.saved_at);
            return {
                slot,
                isEmpty: false,
                savedAt: savedAtIso,
                preview: data.preview,
                stats: safeParse(data.stats, null),
                currentScene: data.current_scene || null,
                currentChapter: data.current_chapter || null
            };
        });

        res.json({ success: true, slots });
    })().catch(err => {
        console.error('List saves error:', err);
        res.status(500).json({ success: false, message: '读取存档失败' });
    });
});

app.post('/api/saves/:slot', requireAuth, (req, res) => {
    (async () => {
        const slot = Number.parseInt(req.params.slot, 10);
        if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOTS) {
            return res.status(400).json({ success: false, message: '无效的存档槽位' });
        }

        const gameMode = normalizeMode(req.query.gameMode);
        const gameState = req.body?.gameState;
        if (!gameState) {
            return res.status(400).json({ success: false, message: '缺少游戏数据' });
        }

        const lastMessage = gameState.history?.length
            ? `${gameState.history[gameState.history.length - 1]?.content?.substring(0, 50) || ''}...`
            : '新游戏';
        const savedAt = new Date();
        const statsJson = gameState.stats ? JSON.stringify(gameState.stats) : null;
        const defaultScene = gameMode === 'survival' ? 'snowfield' : 'banquet';
        const currentScene = gameState.currentScene || defaultScene;
        const currentChapter = gameState.currentChapter || 'prologue';

        await pool.execute(
            `
            INSERT INTO saves (user_id, game_mode, slot, game_state, saved_at, preview, stats, current_scene, current_chapter)
            VALUES (?, ?, ?, CAST(? AS JSON), ?, ?, CAST(? AS JSON), ?, ?)
            ON DUPLICATE KEY UPDATE
                game_state = VALUES(game_state),
                saved_at = VALUES(saved_at),
                preview = VALUES(preview),
                stats = VALUES(stats),
                current_scene = VALUES(current_scene),
                current_chapter = VALUES(current_chapter)
        `,
            [
                req.user.id,
                gameMode,
                slot,
                JSON.stringify(gameState),
                savedAt,
                lastMessage,
                statsJson,
                currentScene,
                currentChapter
            ]
        );

        return res.json({ success: true, message: `已保存到槽位 ${slot}` });
    })().catch(err => {
        console.error('Save error:', err);
        res.status(500).json({ success: false, message: '保存失败' });
    });
});

app.get('/api/saves/:slot', requireAuth, (req, res) => {
    (async () => {
        const slot = Number.parseInt(req.params.slot, 10);
        if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOTS) {
            return res.status(400).json({ success: false, message: '无效的存档槽位' });
        }

        const gameMode = normalizeMode(req.query.gameMode);
        const [rows] = await pool.execute(
            'SELECT game_state FROM saves WHERE user_id = ? AND game_mode = ? AND slot = ? LIMIT 1',
            [req.user.id, gameMode, slot]
        );

        const row = rows[0];
        if (!row) {
            return res.status(404).json({ success: false, message: '存档为空' });
        }

        const gameState = safeParse(row.game_state, null);
        if (!gameState) {
            return res.status(500).json({ success: false, message: '存档数据损坏' });
        }

        return res.json({ success: true, message: '读取成功', gameState });
    })().catch(err => {
        console.error('Load error:', err);
        res.status(500).json({ success: false, message: '读取失败' });
    });
});

app.delete('/api/saves/:slot', requireAuth, (req, res) => {
    (async () => {
        const slot = Number.parseInt(req.params.slot, 10);
        if (!Number.isInteger(slot) || slot < 1 || slot > MAX_SLOTS) {
            return res.status(400).json({ success: false, message: '无效的存档槽位' });
        }

        const gameMode = normalizeMode(req.query.gameMode);
        const [result] = await pool.execute('DELETE FROM saves WHERE user_id = ? AND game_mode = ? AND slot = ?', [
            req.user.id,
            gameMode,
            slot
        ]);

        if (!result.affectedRows) {
            return res.status(404).json({ success: false, message: '存档不存在' });
        }

        return res.json({ success: true, message: '存档已删除' });
    })().catch(err => {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, message: '删除失败' });
    });
});

app.post('/api/v1/chat/completions', async (req, res) => {
    try {
        if (LLM_REQUIRE_AUTH) {
            requireAuth(req, res, () => {});
            if (res.headersSent) return;
        }

        const incomingAuth = req.headers.authorization || '';
        const upstreamAuth = LLM_API_KEY ? `Bearer ${LLM_API_KEY}` : incomingAuth;

        if (!upstreamAuth) {
            return res.status(401).json({ success: false, message: '缺少 Authorization（请在前端设置中填写 API Key）' });
        }

        const controller = new AbortController();
        req.on('close', () => controller.abort());

        const upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': upstreamAuth
            },
            body: JSON.stringify(req.body || {}),
            signal: controller.signal
        });

        if (!upstream.ok) {
            const errorText = await upstream.text();
            return res.status(upstream.status).send(errorText);
        }

        if (!req.body?.stream) {
            const data = await upstream.json();
            return res.status(200).json(data);
        }

        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (!upstream.body) {
            return res.end();
        }

        const upstreamStream = Readable.fromWeb(upstream.body);
        upstreamStream.on('error', (err) => {
            console.error('Upstream stream error:', err);
            if (!res.headersSent) {
                res.status(502).json({ success: false, message: 'LLM 上游连接异常' });
            } else {
                res.end();
            }
        });

        return upstreamStream.pipe(res);
    } catch (err) {
        // Express 4 does not reliably capture async errors; ensure we respond.
        console.error('LLM proxy error:', err);
        if (!res.headersSent) {
            return res.status(502).json({ success: false, message: 'LLM 请求失败' });
        }
        res.end();
    }
});

(async () => {
    try {
        await initDb();
        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
})();
