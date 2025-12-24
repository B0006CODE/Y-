/**
 * API 设置服务
 * 允许用户配置自己的 LLM API
 */

const API_SETTINGS_KEY = 'ancient_love_api_settings';

// 默认设置
const DEFAULT_SETTINGS = {
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus'
};

// 支持的模型预设
export const MODEL_PRESETS = {
    'qwen-plus': {
        name: '通义千问 Plus',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-plus'
    },
    'qwen-turbo': {
        name: '通义千问 Turbo',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-turbo'
    },
    'qwen-max': {
        name: '通义千问 Max',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-max'
    },
    'openai': {
        name: 'OpenAI GPT',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo'
    },
    'custom': {
        name: '自定义',
        baseUrl: '',
        model: ''
    }
};

/**
 * 获取 API 设置
 * @returns {object}
 */
export const getApiSettings = () => {
    const settingsJson = localStorage.getItem(API_SETTINGS_KEY);
    if (settingsJson) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
    }
    return DEFAULT_SETTINGS;
};

/**
 * 保存 API 设置
 * @param {object} settings
 */
export const saveApiSettings = (settings) => {
    localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * 检查 API 是否已配置
 * @returns {boolean}
 */
export const isApiConfigured = () => {
    const settings = getApiSettings();
    return !!(settings.apiKey && settings.baseUrl);
};

/**
 * 清除 API 设置
 */
export const clearApiSettings = () => {
    localStorage.removeItem(API_SETTINGS_KEY);
};
