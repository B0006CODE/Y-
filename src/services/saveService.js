/**
 * 游戏存档服务
 * 使用 LocalStorage 存储游戏进度
 * 支持不同游戏模式的独立存档
 */

const SAVES_KEYS = {
    story: 'ancient_love_saves',      // 《凤鸣九霄》
    survival: 'frozen_heart_saves'    // 《冰封之心》
};
const MAX_SLOTS = 5;

const safeParse = (value, fallback) => {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const stripTagsForPreview = (content) => {
    return String(content || '')
        .replace(/\[SCENE:\s*\w+\]/g, '')
        .replace(/\[AFFINITY:\s*\w+:?\s*[+-]?\d+\]/g, '')
        .replace(/\[UNLOCK_CG:\s*\w+\]/g, '')
        .replace(/\[CHAPTER:\s*\w+\]/g, '')
        .replace(/\[TRUST:\s*[+-]?\d+\]/g, '')
        .replace(/\[POWER:\s*[+-]?\d+\]/g, '')
        .replace(/\[RISK:\s*[+-]?\d+\]/g, '')
        .replace(/\[PROGRESS:\s*[+-]?\d+\]/g, '')
        .replace(/\[OPTIONS:\s*.+?\]/gs, '')
        .replace(/\[HP:\s*[+-]?\d+\]/g, '')
        .replace(/\[WARMTH:\s*[+-]?\d+\]/g, '')
        .replace(/\[HUNGER:\s*[+-]?\d+\]/g, '')
        .replace(/\[SANITY:\s*[+-]?\d+\]/g, '')
        .replace(/\[SUPPLIES:\s*[+-]?\d+\]/g, '')
        .trim();
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchJson = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...(options.headers || {})
        },
        ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        return { success: false, message: data.message || '请求失败' };
    }
    return data;
};

/**
 * 获取存档 Key
 * @param {string} gameMode - 游戏模式 ('story' | 'survival')
 */
const getSavesKey = (gameMode = 'story') => {
    return SAVES_KEYS[gameMode] || SAVES_KEYS.story;
};

/**
 * 获取所有存档数据
 * @param {string} gameMode - 游戏模式
 */
const getAllSaves = (gameMode = 'story') => {
    const savesJson = localStorage.getItem(getSavesKey(gameMode));
    const parsed = safeParse(savesJson, {});
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
};

/**
 * 保存存档数据
 * @param {object} saves - 存档数据
 * @param {string} gameMode - 游戏模式
 */
const setAllSaves = (saves, gameMode = 'story') => {
    localStorage.setItem(getSavesKey(gameMode), JSON.stringify(saves));
};

/**
 * 保存游戏
 * @param {string} userId - 用户名
 * @param {number} slot - 存档槽位 (1-5)
 * @param {object} gameState - 游戏状态 { stats, history }
 * @param {string} gameMode - 游戏模式 ('story' | 'survival')
 * @returns {{ success: boolean, message: string }}
 */
export const saveGame = async (userId, slot, gameState, gameMode = 'story') => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }
    if (slot < 1 || slot > MAX_SLOTS) {
        return { success: false, message: '无效的存档槽位' };
    }

    if (IS_SERVER_MODE) {
        return fetchJson(`${API_BASE_URL}/saves/${slot}?gameMode=${gameMode}`, {
            method: 'POST',
            body: JSON.stringify({ gameState })
        });
    }

    const saves = getAllSaves(gameMode);

    if (!saves[userId]) {
        saves[userId] = {};
    }

    // 生成存档预览信息
    const lastMessage = gameState.history?.length > 0
        ? `${stripTagsForPreview(gameState.history[gameState.history.length - 1]?.content).substring(0, 50)}...`
        : '新游戏';

    // 根据游戏模式设置默认场景
    const defaultScene = gameMode === 'survival' ? 'snowfield' : 'banquet';

    saves[userId][slot] = {
        gameState,
        savedAt: new Date().toISOString(),
        preview: lastMessage,
        stats: gameState.stats,
        // Enhanced preview data
        currentScene: gameState.currentScene || defaultScene,
        currentChapter: gameState.currentChapter || 'prologue',
        gameMode: gameMode  // 记录游戏模式
    };

    setAllSaves(saves, gameMode);
    return { success: true, message: `已保存到槽位 ${slot}` };
};

/**
 * 加载游戏存档
 * @param {string} userId - 用户名
 * @param {number} slot - 存档槽位
 * @param {string} gameMode - 游戏模式
 * @returns {{ success: boolean, message: string, gameState?: object }}
 */
export const loadGame = async (userId, slot, gameMode = 'story') => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }

    if (IS_SERVER_MODE) {
        return fetchJson(`${API_BASE_URL}/saves/${slot}?gameMode=${gameMode}`, {
            method: 'GET'
        });
    }

    const saves = getAllSaves(gameMode);
    const userSaves = saves[userId];

    if (!userSaves || !userSaves[slot]) {
        return { success: false, message: '该存档槽位为空' };
    }

    return {
        success: true,
        message: '读档成功',
        gameState: userSaves[slot].gameState
    };
};

/**
 * 获取用户所有存档信息
 * @param {string} userId - 用户名
 * @param {string} gameMode - 游戏模式
 * @returns {Array} 存档列表
 */
export const getSaveSlots = async (userId, gameMode = 'story') => {
    if (!userId) return [];

    if (IS_SERVER_MODE) {
        const result = await fetchJson(`${API_BASE_URL}/saves?gameMode=${gameMode}`, {
            method: 'GET'
        });
        return result.slots || [];
    }

    const saves = getAllSaves(gameMode);
    const userSaves = saves[userId] || {};

    const slots = [];
    for (let i = 1; i <= MAX_SLOTS; i++) {
        const save = userSaves[i];
        slots.push({
            slot: i,
            isEmpty: !save,
            savedAt: save?.savedAt || null,
            preview: save?.preview || null,
            stats: save?.stats || null,
            currentScene: save?.currentScene || null,
            currentChapter: save?.currentChapter || null
        });
    }
    return slots;
};

/**
 * 删除存档
 * @param {string} userId - 用户名
 * @param {number} slot - 存档槽位
 * @param {string} gameMode - 游戏模式
 * @returns {{ success: boolean, message: string }}
 */
export const deleteSave = async (userId, slot, gameMode = 'story') => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }

    if (IS_SERVER_MODE) {
        return fetchJson(`${API_BASE_URL}/saves/${slot}?gameMode=${gameMode}`, {
            method: 'DELETE'
        });
    }

    const saves = getAllSaves(gameMode);

    if (saves[userId] && saves[userId][slot]) {
        delete saves[userId][slot];
        setAllSaves(saves, gameMode);
        return { success: true, message: '存档已删除' };
    }

    return { success: false, message: '存档不存在' };
};

/**
 * 获取最大存档槽位数
 */
export const getMaxSlots = () => MAX_SLOTS;

/**
 * 获取用户最新的存档
 * @param {string} userId - 用户名
 * @param {string} gameMode - 游戏模式
 * @returns {{ success: boolean, exists: boolean, gameState?: object }}
 */
export const getLatestSave = async (userId, gameMode = 'story') => {
    if (!userId) return { success: false, exists: false, gameState: null };

    if (IS_SERVER_MODE) {
        return fetchJson(`${API_BASE_URL}/saves/latest?gameMode=${gameMode}`, { method: 'GET' });
    }

    // 本地模式：找最近的存档
    const saves = getAllSaves(gameMode);
    const userSaves = saves[userId];
    if (!userSaves) return { success: true, exists: false, gameState: null };

    let latestSave = null;
    let latestTime = 0;

    for (const slot in userSaves) {
        const save = userSaves[slot];
        if (save?.savedAt) {
            const time = new Date(save.savedAt).getTime();
            if (time > latestTime) {
                latestTime = time;
                latestSave = save.gameState;
            }
        }
    }

    if (!latestSave) return { success: true, exists: false, gameState: null };
    return { success: true, exists: true, gameState: latestSave };
};
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const IS_SERVER_MODE = !!API_BASE_URL;
