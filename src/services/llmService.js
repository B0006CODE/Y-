import * as StoryConfig from '../config/storyConfig.js';
import * as SurvivalConfig from '../config/survivalConfig.js';
import { getApiSettings, isApiConfigured } from './apiSettings.js';

// ==================== Token 优化配置 ====================
const TOKEN_OPTIMIZATION = {
    MAX_HISTORY_TURNS: 15,           // 保留最近 15 轮完整对话
    SUMMARY_THRESHOLD: 20,           // 超过 20 轮时触发摘要压缩
    SUMMARY_MAX_LENGTH: 300,         // 摘要最大长度（字符）
    ENABLE_SUMMARY: true,            // 是否启用历史摘要
};

// ==================== 历史摘要缓存 ====================
let historySummaryCache = {
    story: { lastHistoryLength: 0, summary: '' },
    survival: { lastHistoryLength: 0, summary: '' }
};

/**
 * 生成历史对话摘要（本地压缩，不调用 API）
 * @param {Array} oldHistory - 需要压缩的旧历史消息
 * @param {string} mode - 游戏模式
 * @returns {string} 压缩后的摘要
 */
const generateLocalSummary = (oldHistory) => {
    if (!oldHistory || oldHistory.length === 0) return '';

    // 提取关键信息：玩家的重要选择和关键剧情点
    const keyEvents = [];

    oldHistory.forEach((msg, index) => {
        if (msg.role === 'user') {
            // 记录玩家的选择（去重）
            const choice = msg.content.substring(0, 30);
            if (!keyEvents.includes(choice)) {
                keyEvents.push(`玩家选择: ${choice}`);
            }
        } else if (msg.role === 'assistant') {
            // 提取关键剧情标记
            const content = msg.content;

            // 提取章节变化
            const chapterMatch = content.match(/\[CHAPTER:\s*([^\]]+)\]/);
            if (chapterMatch) {
                keyEvents.push(`进入章节: ${chapterMatch[1]}`);
            }

            // 提取NPC名字和关键情节（简单提取前50字作为场景描述）
            if (index % 4 === 0 && content.length > 50) {
                const scene = content.substring(0, 50).replace(/\[.*?\]/g, '').trim();
                if (scene) keyEvents.push(`场景: ${scene}...`);
            }
        }
    });

    // 限制摘要长度
    let summary = keyEvents.slice(-10).join('；');
    if (summary.length > TOKEN_OPTIMIZATION.SUMMARY_MAX_LENGTH) {
        summary = summary.substring(0, TOKEN_OPTIMIZATION.SUMMARY_MAX_LENGTH) + '...';
    }

    return summary;
};

/**
 * 智能处理历史消息，实现 token 优化
 * @param {Array} fullHistory - 完整历史消息
 * @param {string} mode - 游戏模式
 * @returns {Object} { processedHistory, summary }
 */
const processHistoryForAPI = (fullHistory, mode) => {
    const maxMessages = TOKEN_OPTIMIZATION.MAX_HISTORY_TURNS * 2; // 每轮2条消息

    // 如果历史不长，直接返回全部
    if (fullHistory.length <= maxMessages) {
        return { processedHistory: fullHistory, summary: '' };
    }

    // 分割历史：旧历史 + 最近历史
    const recentHistory = fullHistory.slice(-maxMessages);
    const oldHistory = fullHistory.slice(0, -maxMessages);

    let summary = '';

    // 检查是否需要更新摘要缓存
    if (TOKEN_OPTIMIZATION.ENABLE_SUMMARY && oldHistory.length > 0) {
        const cache = historySummaryCache[mode];

        // 只有当旧历史变化时才重新生成摘要
        if (oldHistory.length !== cache.lastHistoryLength) {
            summary = generateLocalSummary(oldHistory);
            historySummaryCache[mode] = {
                lastHistoryLength: oldHistory.length,
                summary: summary
            };
        } else {
            summary = cache.summary;
        }
    }

    return { processedHistory: recentHistory, summary };
};

// ==================== 静态系统提示词（可缓存部分） ====================
const STATIC_RULES = {
    story: `
## 交互选项生成规则
在每段剧情回复的最后，你必须生成三个推荐选项供玩家选择，格式如下：
[OPTIONS: 选项1文字 | 选项2文字 | 选项3文字]

选项要求：
1. 每个选项应该是简短的行动描述（8-20字）
2. 三个选项应该代表不同的策略方向（如：主动出击/谨慎应对/寻求帮助）
3. 选项内容要符合当前剧情情境和角色身份
4. 选项不要太相似，要有明显的区分度
5. **每个选项都必须能推动剧情向前发展**
6. **禁止提供"观望"、"等待"、"什么都不做"类的消极选项**

⚠️ 最重要约束：
- **绝对禁止**重复玩家之前选择过的行动！
- 如果玩家刚做了"探查"，新选项应该是探查之后的发展，而不是"继续探查"
- 每一轮选项都应该反映剧情已经向前推进了一步

示例格式：
[OPTIONS: 向萧煜坦白身份 | 暗中调查谢临渊 | 请求韩青云协助]`,
    survival: `
## 交互选项生成规则
在每段剧情回复的最后，你必须生成三个推荐选项供玩家选择，格式如下：
[OPTIONS: 选项1文字 | 选项2文字 | 选项3文字]

选项要求：
1. 每个选项应该是简短的行动描述（8-20字）
2. 三个选项应该代表不同的生存策略（如：寻找资源/建造庇护/探索新区域）
3. 选项内容要符合当前末日情境
4. 选项不要太相似，要有明显的区分度
5. **每个选项都必须有实际的生存意义**
6. **禁止提供"等待"、"原地不动"类的消极选项**

⚠️ 最重要约束：
- **绝对禁止**重复玩家之前选择过的行动！
- 每一轮选项都应该反映剧情已经向前推进了一步`
};

/**
 * 构建优化后的系统提示词
 * 结构：[静态基础提示] + [静态规则] + [动态状态]
 * 这样静态部分可以被 API 缓存
 */
const buildOptimizedSystemPrompt = (config, mode, stats, recentChoices, currentStage, currentChapter, historySummary) => {
    const { SYSTEM_PROMPT } = config;

    // 第一部分：静态基础提示（来自配置文件，可缓存）
    let prompt = SYSTEM_PROMPT;

    // 第二部分：静态规则（固定不变，可缓存）
    prompt += STATIC_RULES[mode] || STATIC_RULES.story;

    // === 以下是动态部分，每次请求可能不同 ===

    // 第三部分：历史摘要（如果有）
    if (historySummary) {
        prompt += `

## 📜 之前剧情回顾
${historySummary}
`;
    }

    // 第四部分：当前属性值
    if (mode === 'survival') {
        prompt += `

## 当前属性值
- 生命: ${stats.hp}
- 体温: ${stats.warmth}
- 饱腹: ${100 - stats.hunger}
- 理智: ${stats.sanity}
- 物资: ${stats.supplies}

请根据以上属性值调整剧情走向。如果体温或饱腹过低，请在剧情中体现虚弱感。`;
    } else {
        prompt += `

## 当前属性值
- 好感: ${stats.affinity}%
- 信任: ${stats.trust}%
- 权势: ${stats.power}%
- 风险: ${stats.risk}%

请根据以上属性值调整剧情走向和角色态度。`;
    }

    // 第五部分：禁止重复的选项
    if (recentChoices.length > 0) {
        prompt += `

## ⚠️ 禁止重复的选项
以下选项已使用过，新选项中**禁止出现**类似内容：
${recentChoices.slice(-5).map(c => `❌ ${c}`).join('\n')}`;
    }

    // 第六部分：剧情进度
    prompt += `

## 剧情进度
章节：${currentChapter} | 进度：${currentStage}/100
如有重大进展，添加 [PROGRESS: +数值] 和 [CHAPTER: 章节id]`;

    return prompt;
};

export const generateGameResponse = async (history, userCommand, stats, onChunk, mode = 'story', options = {}) => {
    const { recentChoices = [], currentStage = 0, currentChapter = 'prologue' } = options;
    const config = mode === 'survival' ? SurvivalConfig : StoryConfig;
    const { OPENING_NARRATIVE } = config;

    // 如果是开始游戏，使用预设开场白
    if (userCommand === "开始游戏" && history.length === 0) {
        return { content: OPENING_NARRATIVE, reasoning: "" };
    }

    // ==================== Token 优化：处理历史消息 ====================
    const { processedHistory, summary } = processHistoryForAPI(history, mode);

    // 构建优化后的系统提示词
    const optimizedSystemPrompt = buildOptimizedSystemPrompt(
        config, mode, stats, recentChoices, currentStage, currentChapter, summary
    );

    // 构建消息列表
    const messages = [
        { role: "system", content: optimizedSystemPrompt }
    ];

    // 添加处理后的历史对话（已限制数量）
    processedHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
    });

    // 添加当前用户输入
    messages.push({ role: "user", content: userCommand });

    // 调试日志：显示优化效果
    console.log(`[Token优化] 原始历史: ${history.length}条 → 发送: ${processedHistory.length}条, 摘要: ${summary ? '有' : '无'}`);

    try {
        // 获取用户配置的 API 设置
        const apiSettings = getApiSettings();

        if (!isApiConfigured()) {
            throw new Error('请先在设置中配置 API 密钥');
        }

        // 构建请求体
        const requestBody = {
            model: apiSettings.model || "qwen-plus",
            messages: messages,
            stream: true,
            temperature: 0.8,
            top_p: 0.9
        };

        // 如果开启了思考模式，添加 enable_thinking 参数
        if (apiSettings.enableThinking) {
            requestBody.enable_thinking = true;
        }

        const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiSettings.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let message = "API request failed";
            try {
                const errorData = await response.json();
                message = errorData?.message || message;
            } catch {
                try {
                    const text = await response.text();
                    if (text) message = text;
                } catch {
                    // ignore
                }
            }
            throw new Error(message);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let fullContent = "";
        let fullReasoning = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                if (trimmedLine === "data: [DONE]") {
                    return { content: fullContent, reasoning: fullReasoning };
                }
                if (trimmedLine.startsWith("data:")) {
                    try {
                        const json = JSON.parse(trimmedLine.substring(5).trim());
                        const delta = json.choices[0]?.delta;

                        if (delta?.reasoning_content) {
                            fullReasoning += delta.reasoning_content;
                        }

                        if (delta?.content) {
                            fullContent += delta.content;
                            if (onChunk) onChunk(delta.content);
                        }
                    } catch {
                        // 忽略解析错误，继续处理下一个块
                    }
                }
            }
        }

        return { content: fullContent, reasoning: fullReasoning };

    } catch (error) {
        console.error("LLM Service Error:", error);
        throw error;
    }
};

/**
 * 重置历史摘要缓存（在新游戏开始时调用）
 */
export const resetHistorySummaryCache = (mode = 'all') => {
    if (mode === 'all') {
        historySummaryCache = {
            story: { lastHistoryLength: 0, summary: '' },
            survival: { lastHistoryLength: 0, summary: '' }
        };
    } else {
        historySummaryCache[mode] = { lastHistoryLength: 0, summary: '' };
    }
};

/**
 * 获取当前优化配置（供调试使用）
 */
export const getTokenOptimizationConfig = () => TOKEN_OPTIMIZATION;
