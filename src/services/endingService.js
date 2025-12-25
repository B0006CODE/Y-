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

// ==================== 冰封之心结局 ====================

export const SURVIVAL_ENDINGS = {
    // 恋爱结局
    LOVE_DOCTOR: {
        id: 'love_doctor',
        title: '冰雪消融',
        character: 'shenBeiChen',
        description: '沈北辰终于卸下心防，在漫长的寒冬中，你们成为了彼此唯一的温暖。',
        requirement: '沈北辰好感度最高且 >= 80'
    },
    LOVE_CAPTAIN: {
        id: 'love_captain',
        title: '守护誓言',
        character: 'guShiNian',
        description: '顾时年将你护在身后，许下守护一生的誓言。无论末日如何，有他在便是家。',
        requirement: '顾时年好感度最高且 >= 80'
    },
    LOVE_HACKER: {
        id: 'love_hacker',
        title: '数据永恒',
        character: 'chengYeBai',
        description: '程夜白在代码中为你写下最浪漫的情书。在这个崩坏的世界里，唯有爱是永恒的算法。',
        requirement: '程夜白好感度最高且 >= 80'
    },
    LOVE_TEACHER: {
        id: 'love_teacher',
        title: '春日将至',
        character: 'jiangNanYan',
        description: '江南烟的琴声唤醒了沉睡的希望。你们约定，要一起等到冰雪消融的那一天。',
        requirement: '江南烟好感度最高且 >= 80'
    },
    LOVE_RICH: {
        id: 'love_rich',
        title: '独占欲',
        character: 'luZiJin',
        description: '陆子衿为你打造了专属的地下王国。虽然失去了自由，但你拥有了他全部的爱与疯狂。',
        requirement: '陆子衿好感度最高且 >= 80'
    },

    // 中等好感度结局 (50-79)
    COMPANION_DOCTOR: {
        id: 'companion_doctor',
        title: '并肩前行',
        character: 'shenBeiChen',
        description: '沈北辰虽未表白，但始终守护在你身边。或许在这个世界里，陪伴就是最长情的告白。',
        requirement: '沈北辰好感度最高且 50-79'
    },
    COMPANION_CAPTAIN: {
        id: 'companion_captain',
        title: '战友情深',
        character: 'guShiNian',
        description: '顾时年视你为最信任的战友。虽未越雷池，但那份默契与羁绊，胜过千言万语。',
        requirement: '顾时年好感度最高且 50-79'
    },
    COMPANION_HACKER: {
        id: 'companion_hacker',
        title: '代码兄弟',
        character: 'chengYeBai',
        description: '程夜白称呼你为"最铁的队友"。他教会了你如何在虚拟世界中找到真实。',
        requirement: '程夜白好感度最高且 50-79'
    },
    COMPANION_TEACHER: {
        id: 'companion_teacher',
        title: '知心挚友',
        character: 'jiangNanYan',
        description: '江南烟成为了你最好的朋友。在每一个寒夜里，他的歌声都是最暖的陪伴。',
        requirement: '江南烟好感度最高且 50-79'
    },
    COMPANION_RICH: {
        id: 'companion_rich',
        title: '合作伙伴',
        character: 'luZiJin',
        description: '陆子衿将你视为唯一的合作伙伴。在利益与保护之间，他选择了后者。',
        requirement: '陆子衿好感度最高且 50-79'
    },

    // 团队结局
    HOPE_DAWN: {
        id: 'hope_dawn',
        title: '曙光降临',
        character: null,
        description: '你们找到了逆转寒潮的方法，人类文明得以延续。你的名字将被载入史册。',
        requirement: '物资 >= 20，理智 >= 60'
    },
    SURVIVE_TOGETHER: {
        id: 'survive_together',
        title: '一起活下去',
        character: null,
        description: '虽然没能拯救世界，但你们幸存了下来。在新的秩序中，生活仍在继续。',
        requirement: '物资 >= 10，理智 >= 40'
    },

    // 悲剧结局
    FROZEN: {
        id: 'frozen',
        title: '冰冷长眠',
        character: null,
        description: '体温过低，意识逐渐模糊。在风雪中，你陷入了永恒的沉睡。',
        requirement: '体温 <= 10'
    },
    ETERNAL_WINTER: {
        id: 'eternal_winter',
        title: '永恒寒冬',
        character: null,
        description: '团队分崩离析，最终淹没在无尽的风雪中。',
        requirement: '理智 < 20'
    },
    SACRIFICE: {
        id: 'sacrifice',
        title: '牺牲之路',
        character: null,
        description: '为了让更多人活下去，你选择了牺牲自己。风雪掩埋了你的身躯，却掩盖不了你的光芒。',
        requirement: 'HP <= 0'
    }
};

/**
 * 计算生存游戏结局
 */
export const calculateSurvivalEnding = (stats, detailedAffinity) => {
    const { hp, warmth, sanity, supplies } = stats;
    const highest = getHighestAffinity(detailedAffinity);

    // 1. 死亡结局
    if (hp <= 0) {
        return SURVIVAL_ENDINGS.SACRIFICE;
    }

    // 2. 冻死结局
    if (warmth <= 10) {
        return SURVIVAL_ENDINGS.FROZEN;
    }

    // 3. 崩溃结局
    if (sanity < 20) {
        return SURVIVAL_ENDINGS.ETERNAL_WINTER;
    }

    // 4. 恋爱结局 (好感度 >= 80)
    if (highest && highest.value >= 80) {
        switch (highest.roleId) {
            case 'shenBeiChen': return SURVIVAL_ENDINGS.LOVE_DOCTOR;
            case 'guShiNian': return SURVIVAL_ENDINGS.LOVE_CAPTAIN;
            case 'chengYeBai': return SURVIVAL_ENDINGS.LOVE_HACKER;
            case 'jiangNanYan': return SURVIVAL_ENDINGS.LOVE_TEACHER;
            case 'luZiJin': return SURVIVAL_ENDINGS.LOVE_RICH;
        }
    }

    // 5. 中等好感度结局 (50-79)
    if (highest && highest.value >= 50) {
        switch (highest.roleId) {
            case 'shenBeiChen': return SURVIVAL_ENDINGS.COMPANION_DOCTOR;
            case 'guShiNian': return SURVIVAL_ENDINGS.COMPANION_CAPTAIN;
            case 'chengYeBai': return SURVIVAL_ENDINGS.COMPANION_HACKER;
            case 'jiangNanYan': return SURVIVAL_ENDINGS.COMPANION_TEACHER;
            case 'luZiJin': return SURVIVAL_ENDINGS.COMPANION_RICH;
        }
    }

    // 6. 希望结局
    if (supplies >= 20 && sanity >= 60) {
        return SURVIVAL_ENDINGS.HOPE_DAWN;
    }

    // 7. 生存结局
    if (supplies >= 10 && sanity >= 40) {
        return SURVIVAL_ENDINGS.SURVIVE_TOGETHER;
    }

    // 8. 默认坏结局
    return SURVIVAL_ENDINGS.ETERNAL_WINTER;
};
