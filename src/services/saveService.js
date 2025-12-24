/**
 * 游戏存档服务
 * 使用 LocalStorage 存储游戏进度
 */

const SAVES_KEY = 'ancient_love_saves';
const MAX_SLOTS = 5;

/**
 * 获取所有存档数据
 */
const getAllSaves = () => {
    const savesJson = localStorage.getItem(SAVES_KEY);
    return savesJson ? JSON.parse(savesJson) : {};
};

/**
 * 保存存档数据
 */
const setAllSaves = (saves) => {
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
};

/**
 * 保存游戏
 * @param {string} userId - 用户名
 * @param {number} slot - 存档槽位 (1-5)
 * @param {object} gameState - 游戏状态 { stats, history }
 * @returns {{ success: boolean, message: string }}
 */
export const saveGame = (userId, slot, gameState) => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }
    if (slot < 1 || slot > MAX_SLOTS) {
        return { success: false, message: '无效的存档槽位' };
    }

    const saves = getAllSaves();

    if (!saves[userId]) {
        saves[userId] = {};
    }

    // 生成存档预览信息
    const lastMessage = gameState.history?.length > 0
        ? gameState.history[gameState.history.length - 1]?.content?.substring(0, 50) + '...'
        : '新游戏';

    saves[userId][slot] = {
        gameState,
        savedAt: new Date().toISOString(),
        preview: lastMessage,
        stats: gameState.stats,
        // Enhanced preview data
        currentScene: gameState.currentScene || 'banquet',
        currentChapter: gameState.currentChapter || 'prologue'
    };

    setAllSaves(saves);
    return { success: true, message: `已保存到槽位 ${slot}` };
};

/**
 * 加载游戏存档
 * @param {string} userId - 用户名
 * @param {number} slot - 存档槽位
 * @returns {{ success: boolean, message: string, gameState?: object }}
 */
export const loadGame = (userId, slot) => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }

    const saves = getAllSaves();
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
 * @returns {Array} 存档列表
 */
export const getSaveSlots = (userId) => {
    if (!userId) return [];

    const saves = getAllSaves();
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
 * @returns {{ success: boolean, message: string }}
 */
export const deleteSave = (userId, slot) => {
    if (!userId) {
        return { success: false, message: '请先登录' };
    }

    const saves = getAllSaves();

    if (saves[userId] && saves[userId][slot]) {
        delete saves[userId][slot];
        setAllSaves(saves);
        return { success: true, message: '存档已删除' };
    }

    return { success: false, message: '存档不存在' };
};

/**
 * 获取最大存档槽位数
 */
export const getMaxSlots = () => MAX_SLOTS;
