import { SYSTEM_PROMPT, OPENING_NARRATIVE } from '../config/storyConfig.js';
import { getApiSettings, isApiConfigured } from './apiSettings.js';

export const generateGameResponse = async (history, userCommand, stats, onChunk) => {
    // 构建动态系统提示词，包含当前属性
    const dynamicSystemPrompt = `${SYSTEM_PROMPT}

## 当前属性值
- 好感: ${stats.affinity}%
- 信任: ${stats.trust}%
- 权势: ${stats.power}%
- 风险: ${stats.risk}%

请根据以上属性值调整剧情走向和角色态度。

## 交互选项生成规则
在每段剧情回复的最后，你必须生成三个推荐选项供玩家选择，格式如下：
[OPTIONS: 选项1文字 | 选项2文字 | 选项3文字]

选项要求：
1. 每个选项应该是简短的行动描述（8-20字）
2. 三个选项应该代表不同的策略方向（如：温和/激进/观望，或配合/拒绝/试探等）
3. 选项内容要符合当前剧情情境和角色身份
4. 选项不要太相似，要有明显的区分度
5. 选项应该能够推动剧情发展

⚠️ 重要约束（必须严格遵守）：
- 不要重复玩家刚才选择的行动！如果玩家说"去探查"，下一轮选项中不能再有"去探查"
- 每个选项必须是基于当前剧情进度的新行动
- 玩家的每次选择都应该推进剧情到下一阶段，选项要反映新的剧情状态
- 如果某个行动已经完成（如探查完毕），则提供探查之后可以采取的行动

示例格式：
[OPTIONS: 微微一笑，欣然应允 | 略显犹豫，委婉推辞 | 反问他有何用意]`;

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
