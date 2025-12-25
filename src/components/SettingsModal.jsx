import { useState, useEffect } from 'react';
import { Settings, X, Key, Globe, Cpu, Check, AlertCircle, Brain } from 'lucide-react';
import { getApiSettings, saveApiSettings, MODEL_PRESETS, isApiConfigured } from '../services/apiSettings';

/**
 * API 设置弹窗组件
 */
export default function SettingsModal({ isOpen, onClose }) {
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [model, setModel] = useState('');
    const [preset, setPreset] = useState('qwen-plus');
    const [saved, setSaved] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [enableThinking, setEnableThinking] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const settings = getApiSettings();
            setApiKey(settings.apiKey || '');
            setBaseUrl(settings.baseUrl || '');
            setModel(settings.model || '');
            setEnableThinking(settings.enableThinking || false);

            // 检测当前使用的预设
            const matchedPreset = Object.entries(MODEL_PRESETS).find(
                ([key, value]) => value.baseUrl === settings.baseUrl && value.model === settings.model
            );
            setPreset(matchedPreset ? matchedPreset[0] : 'custom');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePresetChange = (presetKey) => {
        setPreset(presetKey);
        const presetConfig = MODEL_PRESETS[presetKey];
        if (presetConfig && presetKey !== 'custom') {
            setBaseUrl(presetConfig.baseUrl);
            setModel(presetConfig.model);
        }
    };

    const handleSave = () => {
        saveApiSettings({ apiKey, baseUrl, model, enableThinking });
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-sm shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* 装饰边角 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-stone-800" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-stone-800" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-stone-800" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-stone-800" />

                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-800 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-6">
                    {/* 标题 */}
                    <h2 className="text-2xl font-serif text-center text-stone-800 mb-2 flex items-center justify-center gap-2">
                        <Settings size={24} />
                        API 设置
                    </h2>
                    <p className="text-center text-stone-500 text-sm mb-6 font-serif">
                        配置您自己的大语言模型 API
                    </p>

                    {/* 未配置提示 */}
                    {!isApiConfigured() && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-2">
                            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                请先配置 API 密钥才能开始游戏
                            </p>
                        </div>
                    )}

                    {/* 预设选择 */}
                    <div className="mb-4">
                        <label className="block text-sm text-stone-600 mb-2 font-serif">模型预设</label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(MODEL_PRESETS).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => handlePresetChange(key)}
                                    className={`p-2 text-sm rounded-sm border transition-all font-serif ${preset === key
                                        ? 'border-stone-800 bg-stone-800 text-stone-50'
                                        : 'border-stone-300 hover:border-stone-400'
                                        }`}
                                >
                                    {value.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* API Key */}
                    <div className="mb-4">
                        <label className="block text-sm text-stone-600 mb-2 font-serif flex items-center gap-1">
                            <Key size={14} />
                            API 密钥
                        </label>
                        <div className="relative">
                            <input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-xxxxxxxxxxxxxxxx"
                                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-800"
                            >
                                {showKey ? '隐藏' : '显示'}
                            </button>
                        </div>
                    </div>

                    {/* Base URL */}
                    <div className="mb-4">
                        <label className="block text-sm text-stone-600 mb-2 font-serif flex items-center gap-1">
                            <Globe size={14} />
                            API 地址
                        </label>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => { setBaseUrl(e.target.value); setPreset('custom'); }}
                            placeholder="https://api.example.com/v1"
                            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-mono text-sm"
                        />
                    </div>

                    {/* Model */}
                    <div className="mb-6">
                        <label className="block text-sm text-stone-600 mb-2 font-serif flex items-center gap-1">
                            <Cpu size={14} />
                            模型名称
                        </label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => { setModel(e.target.value); setPreset('custom'); }}
                            placeholder="qwen-plus"
                            className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-mono text-sm"
                        />
                    </div>

                    {/* 思考模式开关 */}
                    <div className="mb-6 p-4 bg-stone-100 rounded-sm border border-stone-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Brain size={18} className="text-stone-600" />
                                <div>
                                    <span className="text-sm text-stone-700 font-serif">深度思考模式</span>
                                    <p className="text-xs text-stone-500 mt-0.5">开启后模型会先进行思考再回复，适用于 DeepSeek 等支持的模型</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEnableThinking(!enableThinking)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${enableThinking ? 'bg-stone-800' : 'bg-stone-300'}`}
                            >
                                <span
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${enableThinking ? 'left-7' : 'left-1'}`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 保存按钮 */}
                    <button
                        onClick={handleSave}
                        disabled={!apiKey || !baseUrl}
                        className="w-full py-3 bg-stone-800 text-stone-50 rounded-sm hover:bg-stone-700 transition-colors font-serif flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saved ? (
                            <>
                                <Check size={18} />
                                已保存
                            </>
                        ) : (
                            '保存设置'
                        )}
                    </button>

                    {/* 提示 */}
                    <p className="mt-4 text-xs text-stone-400 text-center">
                        您的 API 密钥仅保存在本地浏览器中
                    </p>
                </div>
            </div>
        </div>
    );
}
