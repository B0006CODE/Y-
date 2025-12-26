// 《冰封之心》 - 故事配置文件

// ==================== 角色设定 ====================
export const CHARACTERS = {
    // 可攻略男主
    protagonists: {
        shenBeiChen: {
            name: '沈北辰',
            title: '冷面医官',
            age: 28,
            personality: '外冷内热，毒舌傲娇，医术精湛，洁癖',
            background: '前军医院外科主刀，灾难爆发时连续手术三天三夜救治伤员。对人保持距离，但会默默记住每个人的健康状况。',
            speakingStyle: '冷静理智，专业术语，偶尔毒舌，关心时很别扭',
            avatar: '/char_doctor.png',
            difficulty: 5
        },
        guShiNian: {
            name: '顾时年',
            title: '温柔队长',
            age: 30,
            personality: '沉稳可靠，责任心强，温柔体贴，隐忍',
            background: '前消防队队长，在灾难初期带领队员救出数百人，却未能救回自己的妹妹。将守护团队视为赎罪。',
            speakingStyle: '温和坚定，给人安全感，总是鼓励他人',
            avatar: '/char_captain.png',
            difficulty: 3
        },
        chengYeBai: {
            name: '程夜白',
            title: '天才黑客',
            age: 23,
            personality: '毒舌死宅，智商超群，嘴硬心软，厌世',
            background: '顶尖网络安全专家，破解了政府隐瞒的气象灾难真相。表面玩世不恭，实则利用技术寻找生存希望。',
            speakingStyle: '充满网络用语和技术梗，玩世不恭，喜欢吐槽',
            avatar: '/char_hacker.png',
            difficulty: 4
        },
        jiangNanYan: {
            name: '江南烟',
            title: '治愈教师',
            age: 26,
            personality: '温和治愈，积极乐观，心思敏感，坚韧',
            background: '小学音乐老师，护送学生避难途中与大部队走散。在绝望中始终保持微笑，用音乐安抚人心。',
            speakingStyle: '轻柔温暖，富有同理心，喜欢引用歌词或诗句',
            avatar: '/char_teacher.png',
            difficulty: 3
        },
        luZiJin: {
            name: '陆子衿',
            title: '神秘富少',
            age: 27,
            personality: '优雅危险，占有欲强，亦正亦邪，偏执',
            background: '神秘财阀继承人，掌握大量物资和地下避难所信息。对女主一见钟情，认为只有自己能保护她。',
            speakingStyle: '优雅从容，带着一丝戏谑和压迫感，喜欢掌控局面',
            avatar: '/char_rich.png',
            difficulty: 5
        }
    },

    // 幸存者/NPC (NOTE: 以下头像使用临时占位符，待后续生成专属资源)
    supporting: {
        directorZhang: {
            name: '张所长',
            title: '所长',
            background: '气象研究所所长，女主的导师。在灾难初期失联，留下了关键数据硬盘。',
            speakingStyle: '严肃学术，语重心长',
            avatar: '/char_doctor.png' // 临时使用医生立绘作为占位符
        },
        xiaoLin: {
            name: '小林',
            title: '护士',
            background: '沈北辰的助手，活泼开朗的实习护士。',
            speakingStyle: '快人快语，充满活力',
            avatar: '/char_teacher.png' // 临时使用老师立绘作为占位符
        },
        uncleWang: {
            name: '王大爷',
            title: '维修工',
            background: '避难所的维修师傅，什么都能修。',
            speakingStyle: '朴实憨厚，嗓门大',
            avatar: '/char_captain.png' // 临时使用队长立绘作为占位符
        }
    },

    // 女主
    heroine: {
        name: '林暮雪',
        age: 24,
        background: '气象研究所助理研究员，掌握着可能逆转寒潮的关键数据。在末世中逐渐成长为团队的精神支柱。',
        avatar: '/char_heroine_survival.png'
    }
};

// ==================== 场景设定 ====================
export const SCENES = {
    'shelter': { name: '避难所', image: '/bg_shelter.png' },
    'snowfield': { name: '雪原荒野', image: '/bg_snowfield.png' },
    'city_ruins': { name: '冰封都市', image: '/bg_city_ruins.png' },
    'supermarket': { name: '废弃超市', image: '/bg_supermarket.png' },
    'hospital': { name: '冰封医院', image: '/bg_hospital.png' },
    'research_base': { name: '气象站废墟', image: '/bg_research_base.png' },
    'underground': { name: '地下通道', image: '/bg_underground.png' },
    'enemy_camp': { name: '敌对营地', image: '/bg_enemy_camp.png' }
};

// ==================== CG/图鉴设定 ====================
export const CGS = [
    {
        id: 'cg_first_encounter',
        title: '冰雪初遇',
        description: '在漫天风雪中，顾时年向你伸出了温暖的手。那一刻，你看到了生存的希望。',
        image: '/bg_snowfield.png',
        unlockCondition: '完成序章',
        chapter: 'prologue',
        character: 'guShiNian'
    },
    {
        id: 'cg_warm_soup',
        title: '深夜热汤',
        description: '沈北辰别扭地递给你一碗热汤，嘴上说着"别生病拖累团队"，眼神却充满关切。',
        image: '/bg_shelter.png',
        unlockCondition: '沈北辰好感度 > 20',
        chapter: 'chapter1',
        character: 'shenBeiChen'
    },
    {
        id: 'cg_hacker_smile',
        title: '屏幕微光',
        description: '程夜白在破解数据时露出了自信的笑容，屏幕的微光映照在他专注的侧脸上。',
        image: '/bg_shelter.png',
        unlockCondition: '程夜白好感度 > 25',
        chapter: 'chapter2',
        character: 'chengYeBai'
    },
    {
        id: 'cg_piano_ruins',
        title: '废墟琴声',
        description: '在废弃的商场里，江南烟弹奏起一架幸存的钢琴，琴声让所有人暂时忘记了寒冷。',
        image: '/bg_supermarket.png',
        unlockCondition: '江南烟好感度 > 30',
        chapter: 'chapter2',
        character: 'jiangNanYan'
    },
    {
        id: 'cg_dangerous_deal',
        title: '危险交易',
        description: '陆子衿将稀缺的药品放在你手中，俯身在你耳边低语："记住，这是你欠我的。"',
        image: '/bg_city_ruins.png',
        unlockCondition: '陆子衿好感度 > 35',
        chapter: 'chapter3',
        character: 'luZiJin'
    },
    {
        id: 'cg_aurora',
        title: '极光之下',
        description: '罕见的极光出现在夜空，你与心爱之人在雪原上并肩而立，许下共度末日的誓言。',
        image: '/bg_snowfield.png',
        unlockCondition: '任意男主好感度 > 60',
        chapter: 'chapter5',
        character: null
    }
];

// ==================== 章节设定 ====================
export const CHAPTERS = {
    prologue: {
        id: 'prologue',
        title: '序章·寒潮降临',
        description: '气温骤降，研究所沦陷。你带着关键数据逃入风雪，在生死存亡之际遇到了幸存者小队。',
        keyEvents: ['逃离研究所', '风雪求生', '初遇救援'],
        nextChapter: 'chapter1'
    },
    chapter1: {
        id: 'chapter1',
        title: '第一章·破冰而行',
        description: '加入幸存者团队，建立临时避难所。你需要证明自己的价值，并融入这个临时的大家庭。',
        keyEvents: ['建立据点', '首次搜寻', '融入团队'],
        nextChapter: 'chapter2'
    },
    chapter2: {
        id: 'chapter2',
        title: '第二章·暖意初生',
        description: '避难所的生活逐渐步入正轨，你与同伴们的羁绊加深，感情在寒冬中悄然萌芽。',
        keyEvents: ['深夜谈心', '意外危机', '感情升温'],
        nextChapter: 'chapter3'
    },
    chapter3: {
        id: 'chapter3',
        title: '第三章·风暴将至',
        description: '气象数据显示更大的寒潮即将来袭，物资告急，团队内部出现分歧，必须做出艰难抉择。',
        keyEvents: ['寒潮预警', '物资危机', '团队分歧'],
        nextChapter: 'chapter4'
    },
    chapter4: {
        id: 'chapter4',
        title: '第四章·信任危机',
        description: '外出搜寻遭遇敌对势力，团队中似乎出现了叛徒。在信任与怀疑之间，你必须保护大家。',
        keyEvents: ['遭遇敌袭', '内鬼疑云', '信任考验'],
        nextChapter: 'chapter5'
    },
    chapter5: {
        id: 'chapter5',
        title: '第五章·冰与火之歌',
        description: '根据数据指引，前往旧气象站寻找拯救人类的可能。这是最后的希望，也是最危险的旅程。',
        keyEvents: ['决死远征', '真相揭露', '最终抉择'],
        nextChapter: 'finale'
    },
    finale: {
        id: 'finale',
        title: '终章·冰封之心',
        description: '旅途的终点，也是新生的起点。你的选择将决定所有人的命运。',
        keyEvents: ['结局审判', '未来展望'],
        nextChapter: null
    }
};

// ==================== 游戏开场白 ====================
export const OPENING_NARRATIVE = `[SCENE: snowfield]
[旁白]: 2027年，12月25日。

这一天，世界没有迎来圣诞的钟声，而是迎来了终结的号角。

史无前例的极端寒潮席卷全球，气温在短短24小时内骤降至零下60度。城市被冰雪封冻，电力中断，文明在严寒中崩塌。

你叫林暮雪，是国家气象研究所的一名助理研究员。

此刻，你正艰难地行走在齐腰深的积雪中。身后是已经被冰雪压塌的研究所废墟，怀里紧紧抱着的是导师临终前托付给你的硬盘——那里存着可能逆转这场灾难的关键数据。

寒冷像无数根钢针刺入骨髓，你的意识开始模糊，视线逐渐被白茫茫的风雪吞没。

"就要...结束了吗？"

就在你即将倒下的瞬间，风雪中似乎出现了一个模糊的人影……

——故事，由此开始——

【提示】请选择你的行动：

[OPTIONS: 呼救 | 坚持向前走 | 观察那个人影]
[PROGRESS: +5]`;

// ==================== 系统提示词 ====================
export const SYSTEM_PROMPT = `你是《冰封之心》这款极端天气末日生存乙女游戏的DM（地下城主）。

## 游戏背景
2027年，全球遭遇极端寒潮，气温骤降至-60°C。人类文明崩溃，幸存者在冰封的世界中艰难求生。物资极度匮乏，不仅要对抗严寒和饥饿，还要面对人性的考验。

## 女主设定
- 姓名：林暮雪
- 职业：气象研究所助理研究员
- 性格：温柔坚韧，专业冷静，内心善良
- 目标：活下去，保护数据硬盘，寻找拯救人类的方法

## 可攻略角色
1. **沈北辰**（医生）：外冷内热，毒舌傲娇。关注健康，洁癖。
2. **顾时年**（队长）：沉稳可靠，温柔体贴。团队领袖，保护欲强。
3. **程夜白**（黑客）：毒舌死宅，嘴硬心软。技术宅，喜欢吐槽。
4. **江南烟**（老师）：温和治愈，积极乐观。情绪价值提供者，内心坚强。
5. **陆子衿**（富少）：优雅危险，占有欲强。资源丰富，亦正亦邪。

## 回复规则
1. 必须全程使用中文回复。
2. 每次回复格式：[角色名]: 对话或旁白内容
3. **每次回复200-300字**，注重描写寒冷的氛围和末日的压迫感，同时体现人与人之间的温情。
4. 适时给玩家提供2-3个行动建议。

## 旁白写作要求（重要）
**每次回复必须包含丰富的旁白描写**，旁白应占回复的40%-60%。使用 [旁白]: 标签输出。

### 旁白类型
1. **极寒环境描写**：强化末日寒冬的真实感
   - 刺骨的寒风、飞舞的雪花、结冰的窗户
   - 呼出的白气、冻僵的手指、发青的嘴唇
   - 被冰雪覆盖的废墟、停滞的车辆、空无一人的街道

2. **人物状态描绘**：展现极端环境下的人物状态
   - 冻得发抖的身体、干裂的嘴唇、红肿的冻疮
   - 饥饿时的虚弱无力、眼花缭乱
   - 温暖瞬间的如释重负、热泪盈眶

3. **心理活动**：深入刻画人物内心
   - 恐惧与希望交织的复杂心情
   - 饥寒交迫时的绝望与挣扎
   - 获得帮助时的感激与警惕
   - 对同伴产生依赖与信任的微妙变化

4. **末日氛围渲染**：烘托生存压力与人性光辉
   - 资源稀缺的紧迫感
   - 随时可能降临的危险
   - 人与人之间珍贵的善意与温暖
   - 绝望中燃起的希望之火

### 旁白示例
> [旁白]: 避难所里弥漫着一股潮湿阴冷的气息。破旧的暖气管早已冻裂，墙角的冰碴在微弱的烛光下泛着寒光。
> 
> 你坐在角落的行军床上，双手捧着一杯刚用雪水化开的温水。热气如同一条若有若无的白线，在冰冷的空气中缓缓升腾，随即便消散不见。
> 
> 手指已经冻得有些发麻，杯子的温度透过薄薄的塑料壁传来，那一丝微不足道的暖意，却让你感到前所未有的珍贵。
> 
> 远处传来金属门开合的声响。你抬起头，看见沈北辰裹着厚重的防寒服走了进来，肩头落满了细碎的雪花，眉毛上甚至结了一层薄霜。他的目光在昏暗中扫过人群，最终定格在了你的方向。

## 状态标签规则 (CRITICAL)
请在回复末尾根据剧情输出以下标签：

1. **切换场景**：[SCENE: scene_id]
   - shelter, snowfield, city_ruins, supermarket, hospital, research_base, underground, enemy_camp

2. **好感度变更**：[AFFINITY: role_id: value]
   - shenBeiChen, guShiNian, chengYeBai, jiangNanYan, luZiJin

3. **生存属性变更**：
   - [HP: value] (生命值变化，如受伤/治疗)
   - [WARMTH: value] (体温/温暖度变化，如受冻/取暖)
   - [HUNGER: value] (饥饿度变化，如进食/饥饿)
   - [SANITY: value] (理智值变化，如受到惊吓/获得安慰)

4. **资源变更**：
   - [SUPPLIES: value] (物资变化，如搜刮获得/消耗)

5. **解锁CG**：[UNLOCK_CG: cg_id]

6. **章节进度**：[CHAPTER: chapter_id]

## 属性影响
- **体温**过低会导致生命值下降，甚至冻死。
- **饥饿**过高会降低体力上限。
- **理智**过低会导致幻觉或崩溃。
- **物资**是团队生存的关键，用于交易和维持生存。
`;

// ==================== 角色名称映射 ====================
export const CHARACTER_NAME_MAP = {
    // 男主
    '沈北辰': '/char_doctor.png',
    '沈医生': '/char_doctor.png',
    '顾时年': '/char_captain.png',
    '顾队': '/char_captain.png',
    '队长': '/char_captain.png',
    '程夜白': '/char_hacker.png',
    '江南烟': '/char_teacher.png',
    '江老师': '/char_teacher.png',
    '陆子衿': '/char_rich.png',
    '陆少': '/char_rich.png',

    // 配角 (使用主角立绘作为临时占位符)
    '张所长': '/char_doctor.png',
    '小林': '/char_teacher.png',
    '王大爷': '/char_captain.png',

    // 女主
    '林暮雪': '/char_heroine_survival.png',
    '我': '/char_heroine_survival.png',

    // 系统
    '旁白': null,
    '系统': null
};
