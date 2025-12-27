// 《凤鸣九霄》 - 故事配置文件

// ==================== 角色设定 ====================
export const CHARACTERS = {
    // 可攻略男主
    protagonists: {
        xiaoYu: {
            name: '萧煜',
            title: '摄政王',
            age: 26,
            personality: '冷峻深沉，城府极深，外冷内热',
            background: '先帝胞弟，权倾朝野的摄政王。曾与女主父亲有过命之交，内心藏着不为人知的柔软。',
            speakingStyle: '言简意赅，语气威严，偶尔流露温情',
            avatar: '/char_regent.png',
            difficulty: 5
        },
        guXingZhou: {
            name: '顾行舟',
            title: '谋士',
            age: 24,
            personality: '温润如玉，智计无双，实则腹黑',
            background: '摄政王首席幕僚，当世第一谋士。看似与世无争，实则一步百计。',
            speakingStyle: '温文尔雅，措辞考究，暗藏玄机',
            avatar: '/char_advisor.png',
            difficulty: 4
        },
        luWuYou: {
            name: '陆无忧',
            title: '护卫',
            age: 22,
            personality: '寡言忠诚，武艺高强，默默守护',
            background: '女主父亲旧部之子，为报恩一直暗中保护她。剑术登峰造极，誓死追随。',
            speakingStyle: '沉默寡言，言辞直接，透着关切',
            avatar: '/char_guard.png',
            difficulty: 3
        },
        liJingHeng: {
            name: '李景珩',
            title: '太子',
            age: 20,
            personality: '纯善温柔，优柔寡断，内心挣扎',
            background: '当今太子，身处储位却无心权力。与女主青梅竹马却不知她的真实身份。',
            speakingStyle: '温和亲切，略显忧郁，时有迷茫',
            avatar: '/char_prince.png',
            difficulty: 3
        },
        shenMoHan: {
            name: '沈墨寒',
            title: '公子',
            age: 25,
            personality: '风流不羁，玩世不恭，实则深情',
            background: '江南首富之子，表面纨绔，实为游走朝野的情报贩子。与女主是失散多年的表兄，却另有身份。',
            speakingStyle: '玩世不恭，言语轻佻，暗含深意',
            avatar: '/char_playboy.png',
            difficulty: 4
        }
    },

    // 重要配角
    supporting: {
        hanQingYun: {
            name: '韩青云',
            title: '将军',
            altTitles: ['统帅', '将领'],
            background: '镇北大将军，手握二十万边军。女主父亲生前挚友，暗中调查冤案真相。',
            speakingStyle: '豪爽直率，铿锵有力',
            avatar: '/char_commander.png'
        },
        xieLinYuan: {
            name: '谢临渊',
            title: '贵族',
            background: '世家大族谢氏嫡长子，当朝尚书令。政治联姻的备选对象，隐藏敌人。',
            speakingStyle: '阴柔客气，绵里藏针',
            avatar: '/char_noble.png'
        },
        linZhao: {
            name: '林昭',
            title: '盟友',
            background: '神秘组织"暗阁"阁主，曾受女主父亲恩惠，成为她最可靠的情报来源。',
            speakingStyle: '神秘莫测，点到为止',
            avatar: '/char_ally.png'
        },
        yunQing: {
            name: '云清',
            title: '弟子',
            background: '国师座下首徒，精通星象卜卦。无意间成为女主在宫中的朋友。',
            speakingStyle: '空灵淡然，偶有天真',
            avatar: '/char_disciple.png'
        },
        zhouTaifu: {
            name: '周太傅',
            title: '太傅',
            background: '三朝元老，太子之师。曾是女主父亲同僚，掌握部分真相。',
            speakingStyle: '老成持重，滴水不漏',
            avatar: '/char_preceptor.png'
        }
    },

    // 女主
    heroine: {
        name: '沈晚棠',
        trueName: '沈晚棠',
        disguiseName: '青鸾',
        age: 18,
        background: '前朝名将沈挽澜之女，因父亲蒙冤身死而隐姓埋名入宫。表面柔顺，实则心怀复仇之志。',
        avatar: '/char_heroine.png'
    }
};

// ==================== 场景设定 ====================
export const SCENES = {
    'main': { name: '皇城', image: '/bg_main.png' },
    'banquet': { name: '宫宴', image: '/bg_banquet.png' },
    'garden': { name: '御花园', image: '/bg_garden.png' },
    'study': { name: '御书房', image: '/bg_study.png' },
    'bedroom': { name: '寝宫', image: '/bg_bedroom.png' },
    'kitchen': { name: '御膳房', image: '/bg_kitchen.png' },
    'prison': { name: '天牢', image: '/bg_prison.png' }
};

// ==================== CG/图鉴设定 ====================
export const CGS = [
    // 序章 CG
    {
        id: 'cg_moonlight',
        title: '月下独酌',
        description: '宫宴后与摄政王在月下偶遇，借酒浇愁却道出几分真心。那一刻，冷峻的摄政王眼中似有星光闪烁。',
        image: '/bg_garden.png',
        unlockCondition: '萧煜好感度 > 20',
        chapter: 'prologue',
        character: 'xiaoYu'
    },
    {
        id: 'cg_garden_meeting',
        title: '御花园邂逅',
        description: '在御花园中与太子不期而遇，桃花纷飞如梦。他温柔的目光让你想起儿时的玩伴。',
        image: '/bg_garden.png',
        unlockCondition: '太子好感度 > 15',
        chapter: 'prologue',
        character: 'liJingHeng'
    },
    // 第一章 CG
    {
        id: 'cg_confrontation',
        title: '殿前对峙',
        description: '为父亲的冤案在殿前据理力争，哪怕九死一生也要问个清白。',
        image: '/bg_main.png',
        unlockCondition: '权势 > 20 且完成第一章主线',
        chapter: 'chapter1',
        character: null
    },
    {
        id: 'cg_rescue',
        title: '暗夜相救',
        description: '陆无忧在千钧一发之际将你从刺客剑下救出，他的身影在月光下格外高大。',
        image: '/bg_main.png',
        unlockCondition: '陆无忧好感度 > 25',
        chapter: 'chapter1',
        character: 'luWuYou'
    },
    {
        id: 'cg_secret_letter',
        title: '密信传情',
        description: '顾行舟以一封密信相传，字里行间暗藏深意。他的眼中，似有你看不透的柔情。',
        image: '/bg_bedroom.png',
        unlockCondition: '顾行舟好感度 > 20',
        chapter: 'chapter1',
        character: 'guXingZhou'
    },
    // 第二章 CG
    {
        id: 'cg_chess_game',
        title: '棋局论道',
        description: '与沈墨寒对弈论道，他玩世不恭的外表下，竟藏着如此深沉的心思。',
        image: '/bg_study.png',
        unlockCondition: '沈墨寒好感度 > 30',
        chapter: 'chapter2',
        character: 'shenMoHan'
    },
    {
        id: 'cg_rain_shelter',
        title: '雨中同伞',
        description: '骤雨突至，两人共撑一伞，衣袍相触间，心跳不自觉地加速。',
        image: '/bg_garden.png',
        unlockCondition: '主角好感度最高者 > 35',
        chapter: 'chapter2',
        character: null
    },
    // 第三章 CG
    {
        id: 'cg_truth_reveal',
        title: '真相大白',
        description: '父亲冤案的真相终于浮出水面，你站在证据面前，泪流满面。',
        image: '/bg_study.png',
        unlockCondition: '完成第三章主线',
        chapter: 'chapter3',
        character: null
    },
    {
        id: 'cg_trust_betrayal',
        title: '信任与背叛',
        description: '最信任的人竟是幕后黑手，那一刻心如刀绞。但黑暗中，总有人为你执灯前行。',
        image: '/bg_prison.png',
        unlockCondition: '发现真正的敌人',
        chapter: 'chapter3',
        character: null
    },
    // 终章 CG - 结局相关
    {
        id: 'cg_ending_good',
        title: '凤凰涅槃',
        description: '历经磨难，终于沉冤昭雪。你选择的那个人，与你并肩站在阳光下，开启新的人生。',
        image: '/bg_main.png',
        unlockCondition: '达成好结局',
        chapter: 'finale',
        character: null
    },
    {
        id: 'cg_ending_tragic',
        title: '落花有意',
        description: '有些缘分，注定只能错过。纵然天涯海角，你的心中永远有他的位置。',
        image: '/bg_garden.png',
        unlockCondition: '达成悲情结局',
        chapter: 'finale',
        character: null
    }
];

// ==================== 章节设定 ====================
export const CHAPTERS = {
    prologue: {
        id: 'prologue',
        title: '序章·凤入危局',
        description: '沈晚棠以宫女身份入宫，初遇摄政王萧煜，命运的齿轮开始转动。',
        keyEvents: ['初入宫门', '宫宴邂逅', '惊鸿一瞥'],
        nextChapter: 'chapter1'
    },
    chapter1: {
        id: 'chapter1',
        title: '第一章·暗流涌动',
        description: '太子争储、各势力拉拢、晚棠逐渐展露才华被多方势力注意。',
        keyEvents: ['才华初露', '势力接触', '人心试探'],
        nextChapter: 'chapter2'
    },
    chapter2: {
        id: 'chapter2',
        title: '第二章·棋局破晓',
        description: '发现父亲冤案线索，卷入朝堂暗斗，与各男主建立初步羁绊。',
        keyEvents: ['真相线索', '朝堂暗斗', '情愫萌生'],
        nextChapter: 'chapter3'
    },
    chapter3: {
        id: 'chapter3',
        title: '第三章·风雨欲来',
        description: '真相逐渐浮出水面，信任与背叛交织，必须在情感与复仇间抉择。',
        keyEvents: ['信任危机', '背叛阴谋', '生死抉择'],
        nextChapter: 'finale'
    },
    finale: {
        id: 'finale',
        title: '终章·凤鸣九霄',
        description: '根据好感度和选择，走向不同结局。',
        keyEvents: ['最终对决', '命运抉择', '结局分歧'],
        nextChapter: null
    }
};

// ==================== 游戏开场白 ====================
export const OPENING_NARRATIVE = `[SCENE: banquet]
[旁白]: 元和三年，春。

皇城的桃花开得正盛，却掩不住宫墙内的血腥与阴谋。

三月前，镇国大将军沈挽澜以"通敌叛国"之罪被满门抄斩，一夜之间，名震四海的将门沈家化为飞灰。

然而世人不知，沈家尚有一人幸存——

沈晚棠，这位昔日的将门千金，如今以"青鸾"之名，化作御膳房中一名普通的宫女，潜入这吃人的深宫。

她要查明父亲蒙冤的真相，她要让那些藏在暗处的凶手付出代价。

只是她不曾想到，这一步踏入，便再无退路……

——故事，由此开始——

【提示】请选择你的行动：

[OPTIONS: 借上菜之机靠近摄政王 | 回御膳房领差探人脉 | 寻太子旧识试探口风]
[PROGRESS: +0]`;

// ==================== 系统提示词 ====================
export const SYSTEM_PROMPT = `你是《凤鸣九霄》这款古风宫廷恋爱RPG游戏的DM（地下城主）。

## 游戏背景
元和三年，大梁王朝。先帝驾崩，幼帝即位，由摄政王萧煜辅政。朝中派系林立，太子李景珩与摄政王暗流涌动，各方势力蠢蠢欲动。

## 女主设定
- 真名：沈晚棠
- 伪装身份：青鸾（御膳房宫女）
- 背景：前镇国大将军沈挽澜之女，三月前沈家因"通敌叛国"罪被满门抄斩，她侥幸逃脱，隐姓埋名入宫寻找真相、伺机复仇
- 性格：外表柔弱温顺，实则坚韧聪慧，心思缜密

## 可攻略角色及说话风格
1. **萧煜**（摄政王）：言简意赅，威严深沉，偶尔温情
2. **顾行舟**（谋士）：温文尔雅，措辞考究，暗藏玄机
3. **陆无忧**（护卫）：沉默寡言，言辞直接，透着关切
4. **李景珩**（太子）：温和亲切，略显忧郁，时有迷茫
5. **沈墨寒**（公子）：玩世不恭，言语轻佻，暗含深意

## 重要配角
- **韩青云**（将军）：女主父亲挚友，豪爽直率
- **谢临渊**（贵族）：隐藏敌人，阴柔客气
- **林昭**（盟友）：暗阁阁主，神秘莫测
- **云清**（弟子）：国师首徒，空灵淡然
- **周太傅**：三朝元老，老成持重

## 回复规则
1. 剧情正文必须全程使用中文；系统标签按指定格式输出（包含 SCENE/AFFINITY/UNLOCK_CG/CHAPTER/TRUST/POWER/RISK/PROGRESS/OPTIONS 等英文关键字）
2. 每次回复由多行组成：用「角色名:」写对白，用「[旁白]:」写旁白（**不要**给角色名加方括号）
3. 推进剧情要合理，根据玩家选择和历史对话发展故事
4. 保持角色性格一致，对话要符合古风语境
5. **每次回复200-350字**，要有丰富的画面感和强烈的代入感
6. **每次回复结尾必须提供3个行动选项**，使用 [OPTIONS: 选项1 | 选项2 | 选项3] 格式
7. 选项必须能推动剧情向前，禁止“观望/等待/不行动”类消极选项
8. 注意营造恋爱氛围，但进展要自然，不要太突兀

## 旁白写作要求（重要）
**每次回复必须包含丰富的旁白描写**，旁白应占回复的40%-60%。使用 [旁白]: 标签输出。

### 旁白类型
1. **环境描写**：描绘场景的视觉、听觉、嗅觉、触觉细节
   - 宫殿的雕梁画栋、烛火摇曳、檀香袅袅
   - 花园的花木扶疏、流水潺潺、鸟鸣啾啾
   - 天气变化、光影流转、时辰更替

2. **人物描写**：细腻刻画角色的外貌、神态、动作
   - 眉眼间的情绪变化、嘴角的弧度
   - 衣袂飘动、步态优雅、手势从容
   - 声音的质感（低沉、清冷、温润）

3. **心理活动**：述说女主内心的想法、情绪波动、回忆联想
   - 紧张时的心跳加速、手心微汗
   - 心动时的脸颊微热、目光闪躲
   - 警惕时的暗自思忖、细细盘算

4. **氛围渲染**：烘托当前情境的整体氛围
   - 宫廷的压抑与暗流涌动
   - 私密对话的暧昧张力
   - 危机时刻的紧张窒息

### 旁白示例
> [旁白]: 夜色如墨，御花园中唯有几盏宫灯散发着昏黄的光晕。晚风拂过，带来一阵若有若无的桂花香气，也送来了远处隐约的丝竹之声。
> 
> 你立于假山之侧，衣袂被风轻轻撩动。月光透过枝叶的缝隙洒落，在你脚边投下斑驳的光影。
> 
> 就在这时，一道修长的身影从回廊尽头缓步走来。那人一袭玄色锦袍，腰间悬着一枚玉佩，行走间衣袍轻摆，自有一股不怒自威的气势。
> 
> 你的心跳不由加快了几分——是摄政王。

## 特殊指令规则 (CRITICAL)
为了支持游戏系统，请在回复的最后（或合适位置）使用以下标签来控制游戏状态：

1. **切换场景**：如果剧情移动到了新地点，请输出 [SCENE: scene_id]。
   - 可用场景：main (皇城), banquet (宫宴), garden (御花园), study (御书房), bedroom (寝宫), kitchen (御膳房), prison (天牢)
   - 示例：[SCENE: garden]

2. **好感度变更**：如果某个男主的好感度发生变化，请输出 [AFFINITY: role_id: value]。
   - 角色ID：xiaoYu (萧煜), guXingZhou (顾行舟), luWuYou (陆无忧), liJingHeng (李景珩), shenMoHan (沈墨寒)
   - 示例：[AFFINITY: xiaoYu: +5] (萧煜好感+5)

3. **解锁CG**：如果触发了关键剧情，请输出 [UNLOCK_CG: cg_id]。
   - 可用CG：cg_moonlight, cg_garden_meeting, cg_confrontation, cg_rescue, cg_secret_letter, cg_chess_game, cg_rain_shelter, cg_truth_reveal, cg_trust_betrayal, cg_ending_good, cg_ending_tragic
   - 示例：[UNLOCK_CG: cg_moonlight]

4. **章节进度**：如果剧情进入新的章节，请输出 [CHAPTER: chapter_id]。
   - 可用章节：prologue, chapter1, chapter2, chapter3, finale
   - 示例：[CHAPTER: chapter1]

5. **信任度变更**：如果女主在宫中的信任网络发生变化，请输出 [TRUST: value]。
   - 示例：[TRUST: +5]（结交可靠盟友）或 [TRUST: -10]（被人出卖）

6. **权势变更**：如果女主可调动的资源和人脉发生变化，请输出 [POWER: value]。
   - 示例：[POWER: +3]（获得新的资源或人脉支持）

7. **风险变更**：如果女主身份暴露的危险程度发生变化，请输出 [RISK: value]。
   - 示例：[RISK: +15]（行为引起怀疑）或 [RISK: -5]（成功转移注意力）

8. **剧情进度**：如有重大推进，请输出 [PROGRESS: +value]。
   - 示例：[PROGRESS: +10]

## 当前属性值含义
- 好感：各男主对女主的整体好感度
- 信任：女主在宫中建立的信任网络（高信任=更多情报和帮助）
- 权势：女主能调动的资源和人脉（高权势=更多行动选项）
- 风险：女主身份暴露的危险程度（高风险=更可能触发危机事件）`;

// ==================== 角色名称映射 ====================
export const CHARACTER_NAME_MAP = {
    // 主要角色
    '萧煜': '/char_regent.png',
    '摄政王': '/char_regent.png',
    '王爷': '/char_regent.png',
    '摄政王殿下': '/char_regent.png',
    '王爷殿下': '/char_regent.png',

    '顾行舟': '/char_advisor.png',
    '谋士': '/char_advisor.png',
    '顾先生': '/char_advisor.png',
    '顾谋士': '/char_advisor.png',
    '陆无忧': '/char_guard.png',
    '护卫': '/char_guard.png',
    '陆护卫': '/char_guard.png',
    '李景珩': '/char_prince.png',
    '太子': '/char_prince.png',
    '太子殿下': '/char_prince.png',
    '沈墨寒': '/char_playboy.png',
    '公子': '/char_playboy.png',
    '沈公子': '/char_playboy.png',

    // 配角
    '韩青云': '/char_commander.png',
    '将军': '/char_commander.png',
    '统帅': '/char_commander.png',
    '韩将军': '/char_commander.png',
    '将领': '/char_general.png',
    '谢临渊': '/char_noble.png',
    '贵族': '/char_noble.png',
    '谢大人': '/char_noble.png',
    '尚书令': '/char_noble.png',
    '林昭': '/char_ally.png',
    '盟友': '/char_ally.png',
    '阁主': '/char_ally.png',
    '林阁主': '/char_ally.png',
    '云清': '/char_disciple.png',
    '弟子': '/char_disciple.png',
    '周太傅': '/char_preceptor.png',
    '太傅': '/char_preceptor.png',
    '太傅大人': '/char_preceptor.png',

    // 女主
    '沈晚棠': '/char_heroine.png',
    '青鸾': '/char_heroine.png',
    '晚棠': '/char_heroine.png',
    '阿鸾': '/char_heroine.png',
    '我': '/char_heroine.png',

    // 系统
    '旁白': null,
    '系统': null
};
