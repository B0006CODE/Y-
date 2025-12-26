import * as StoryConfig from '../config/storyConfig.js';
import * as SurvivalConfig from '../config/survivalConfig.js';
import { getApiSettings, isApiConfigured } from './apiSettings.js';

export const generateGameResponse = async (history, userCommand, stats, onChunk, mode = 'story', options = {}) => {
    const { recentChoices = [], currentStage = 0, currentChapter = 'prologue' } = options;
    const config = mode === 'survival' ? SurvivalConfig : StoryConfig;
    const { SYSTEM_PROMPT, OPENING_NARRATIVE } = config;

    // 构建动态系统提示词，包含当前属性
    let dynamicSystemPrompt = SYSTEM_PROMPT;

    if (mode === 'survival') {
        dynamicSystemPrompt += `

## 当前属性值
- 生命: ${stats.hp}
- 体温: ${stats.warmth}
- 饱腹: ${100 - stats.hunger}
- 理智: ${stats.sanity}
- 物资: ${stats.supplies}

请根据以上属性值调整剧情走向和角色态度。如果体温或饱腹过低，请在剧情中体现虚弱感。
`;
    } else {
        dynamicSystemPrompt += `

## 当前属性值
- 好感: ${stats.affinity}%
- 信任: ${stats.trust}%
- 权势: ${stats.power}%
- 风险: ${stats.risk}%

请根据以上属性值调整剧情走向和角色态度。
`;
    }

    // 添加禁止重复选项的约束
    if (recentChoices.length > 0) {
        dynamicSystemPrompt += `

## ⚠️ 禁止重复的选项（极其重要！）
玩家最近选择的行动如下，你在生成新选项时 **绝对不能** 包含这些内容或类似的表述：
${recentChoices.map((c, i) => `${i + 1}. "${c}"`).join('\n')}

这些行动已经完成，不应该再次出现。你必须提供全新的、能推动剧情发展的选项。
`;
    }

    // 添加剧情进度信息
    dynamicSystemPrompt += `

## 剧情进度追踪
当前章节：${currentChapter}
剧情推进度：${currentStage}/100

### 进度推进规则
1. 每次回复都应该让剧情有实质性进展，不能原地踏步
2. 选项必须导向新的剧情内容，而不是重复当前场景
3. 如果玩家选择了某个行动，下一回合应该展示该行动的**结果**和**后续发展**
4. 三个选项中必须至少有一个是"推动主线剧情"类型的选项

### 章节推进条件
- 序章→第一章：与3位以上重要人物有过实质交谈，或触发重要事件
- 第一章→第二章：发现父亲冤案的第一条线索
- 第二章→第三章：确认真正的敌人身份
- 第三章→终章：做出最终抉择

如果满足章节推进条件，请在回复末尾添加 [CHAPTER: 新章节id]
同时添加 [PROGRESS: +数值] 来表示剧情推进（5-15点）
`;

    dynamicSystemPrompt += `
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
[OPTIONS: 向萧煜坦白身份 | 暗中调查谢临渊 | 请求韩青云协助]`;

    // 构建消息列表
    const messages = [
        { role: "system", content: dynamicSystemPrompt }
    ];

    // 如果是开始游戏，使用预设开场白
    if (userCommand === "开始游戏" && history.length === 0) {
        return { content: OPENING_NARRATIVE, reasoning: "" };
    }

    // 添加历史对话
    history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
    });

    // 添加当前用户输入
    messages.push({ role: "user", content: userCommand });

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
            const errorData = await response.json();
            throw new Error(errorData.message || "API request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullContent = "";
        let fullReasoning = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");

            for (const line of lines) {
                if (line === "data: [DONE]") {
                    return { content: fullContent, reasoning: fullReasoning };
                }
                if (line.startsWith("data: ")) {
                    try {
                        const json = JSON.parse(line.substring(6));
                        const delta = json.choices[0]?.delta;

                        if (delta?.reasoning_content) {
                            fullReasoning += delta.reasoning_content;
                        }

                        if (delta?.content) {
                            fullContent += delta.content;
                            if (onChunk) onChunk(delta.content);
                        }
                    } catch (e) {
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
