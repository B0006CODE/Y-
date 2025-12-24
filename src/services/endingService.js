/**
 * 结局服务 - 多结局系统
 * 根据玩家的属性值和好感度计算最终结局
 */

// 结局类型定义
export const ENDINGS = {
    // 好结局 - 与各男主的 HE
    GOOD_REGENT: {
        id: 'good_regent',
        title: '凤栖梧桐',
        character: 'xiaoYu',
        description: '你与萧煜携手，一同揭露真相，沉冤昭雪。摄政王府的大门为你敞开，从此并肩天下。',
        requirement: '萧煜好感度最高且 >= 50，权势 >= 30'
    },
    GOOD_ADVISOR: {
        id: 'good_advisor',
        title: '棋逢对手',
        character: 'guXingZhou',
        description: '顾行舟说：一步百计，却算不透你何时入了他的心。从此天涯海角，有你便是归处。',
        requirement: '顾行舟好感度最高且 >= 50'
    },
    GOOD_GUARD: {
        id: 'good_guard',
        title: '执剑相随',
        character: 'luWuYou',
        description: '陆无忧半生沉默，却只为你开口：此生愿为你执剑，护你周全。',
        requirement: '陆无忧好感度最高且 >= 50'
    },
    GOOD_PRINCE: {
        id: 'good_prince',
        title: '明月入怀',
        character: 'liJingHeng',
        description: '太子李景珩终于找回勇气，与你一同对抗命运。这一次，他选择为你放下皇位。',
        requirement: '太子好感度最高且 >= 50，风险 < 50'
    },
    GOOD_PLAYBOY: {
        id: 'good_playboy',
        title: '浪子回头',
        character: 'shenMoHan',
        description: '沈墨寒收敛玩世不恭的笑，第一次认真许诺：此生只负天下，不负你。',
        requirement: '沈墨寒好感度最高且 >= 50'
    },

    // 悲情结局
    TRAGIC_REVENGE: {
        id: 'tragic_revenge',
        title: '大仇得报',
        character: null,
        description: '你成功复仇，却发现心中空空如也。所爱之人或已离去，或成陌路。',
        requirement: '权势 >= 60，好感度均 < 40'
    },
    TRAGIC_SACRIFICE: {
        id: 'tragic_sacrifice',
        title: '香消玉殒',
        character: null,
        description: '为保护心爱之人，你选择以命相换。春风十里，不如你笑颜如故。',
        requirement: '风险 >= 80，好感度最高者 >= 60'
    },

    // 普通结局
    NORMAL_FREEDOM: {
        id: 'normal_freedom',
        title: '远走高飞',
        character: null,
        description: '真相虽未大白，但你选择放下仇恨，远离宫廷纷争，开始新的人生。',
        requirement: '信任 >= 40，风险 < 30，好感度均衡'
    },

    // 坏结局
    BAD_EXPOSED: {
        id: 'bad_exposed',
        title: '身败名裂',
        character: null,
        description: '身份暴露，一切成空。宫墙内的暗算，终究没能躲过。',
        requirement: '风险 >= 90'
    }
};

/**
 * 获取好感度最高的角色
 * @param {Object} detailedAffinity - 各角色好感度
 * @returns {{roleId: string, value: number} | null}
 */
const getHighestAffinity = (detailedAffinity) => {
    if (!detailedAffinity || Object.keys(detailedAffinity).length === 0) {
        return null;
    }

    let highest = { roleId: null, value: -Infinity };
    for (const [roleId, value] of Object.entries(detailedAffinity)) {
        if (value > highest.value) {
            highest = { roleId, value };
        }
    }
    return highest.roleId ? highest : null;
};

/**
 * 计算最终结局
 * @param {Object} stats - 玩家属性 {affinity, trust, power, risk}
 * @param {Object} detailedAffinity - 各角色详细好感度
 * @returns {Object} 结局对象
 */
export const calculateEnding = (stats, detailedAffinity) => {
    const { trust, power, risk } = stats;
    const highest = getHighestAffinity(detailedAffinity);

    // 1. 检查坏结局 - 风险过高
    if (risk >= 90) {
        return ENDINGS.BAD_EXPOSED;
    }

    // 2. 检查悲情结局 - 牺牲
    if (risk >= 80 && highest && highest.value >= 60) {
        return ENDINGS.TRAGIC_SACRIFICE;
    }

    // 3. 检查好结局 - 各角色 HE
    if (highest && highest.value >= 50) {
        switch (highest.roleId) {
            case 'xiaoYu':
                if (power >= 30) return ENDINGS.GOOD_REGENT;
                break;
            case 'guXingZhou':
                return ENDINGS.GOOD_ADVISOR;
            case 'luWuYou':
                return ENDINGS.GOOD_GUARD;
            case 'liJingHeng':
                if (risk < 50) return ENDINGS.GOOD_PRINCE;
                break;
            case 'shenMoHan':
                return ENDINGS.GOOD_PLAYBOY;
        }
    }

    // 4. 检查悲情结局 - 复仇
    if (power >= 60 && (!highest || highest.value < 40)) {
        return ENDINGS.TRAGIC_REVENGE;
    }

    // 5. 检查普通结局 - 远走高飞
    if (trust >= 40 && risk < 30) {
        return ENDINGS.NORMAL_FREEDOM;
    }

    // 6. 默认结局（如果没有满足任何条件）
    return ENDINGS.NORMAL_FREEDOM;
};

/**
 * 检查是否可以触发终章
 * @param {Object} stats - 玩家属性
 * @param {string} currentChapter - 当前章节
 * @returns {boolean}
 */
export const canTriggerFinale = (stats, currentChapter) => {
    // 只有在第三章完成后才能进入终章
    return currentChapter === 'chapter3' && stats.power >= 20;
};

/**
 * 获取所有可能结局（用于图鉴展示）
 * @returns {Array}
 */
export const getAllEndings = () => {
    return Object.values(ENDINGS);
};
