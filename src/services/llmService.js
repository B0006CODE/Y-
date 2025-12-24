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

请根据以上属性值调整剧情走向和角色态度。`;

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

        const response = await fetch(`${apiSettings.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiSettings.apiKey}`
            },
            body: JSON.stringify({
                model: apiSettings.model || "qwen-plus",
                messages: messages,
                stream: true,
                temperature: 0.8,
                top_p: 0.9
            })
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
