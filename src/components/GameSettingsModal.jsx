import { useState, useEffect } from 'react';
import { X, Type, Clock, Volume2, VolumeX, Check, RotateCcw } from 'lucide-react';

const SETTINGS_KEY = 'ancient_love_game_settings';

// 默认设置
const DEFAULT_SETTINGS = {
    fontSize: 'medium',      // small, medium, large
    textSpeed: 'normal',     // slow, normal, fast, instant
    autoPlay: false,
    autoPlayDelay: 3,        // 自动播放延迟（秒）
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 70,
    sfxVolume: 80
};

/**
 * 获取游戏设置
 */
export const getGameSettings = () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_SETTINGS;
};

/**
 * 保存游戏设置
 */
export const saveGameSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

/**
 * 获取字体大小 CSS 类名
 */
export const getFontSizeClass = (size) => {
    switch (size) {
        case 'small': return 'text-base';
        case 'large': return 'text-xl';
        default: return 'text-lg';
    }
};

/**
 * 游戏设置弹窗组件
 */
export default function GameSettingsModal({ isOpen, onClose, onSettingsChange }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSettings(getGameSettings());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        saveGameSettings(settings);
        if (onSettingsChange) {
            onSettingsChange(settings);
        }
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 800);
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-sm shadow-2xl w-full max-w-md mx-4 overflow-hidden">
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
                    <h2 className="text-2xl font-serif text-center text-stone-800 mb-6">
                        游戏设置
                    </h2>

                    {/* 字体大小 */}
                    <div className="mb-5">
                        <label className="flex items-center gap-2 text-sm text-stone-600 mb-2 font-serif">
                            <Type size={16} />
                            字体大小
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'small', label: '小' },
                                { value: 'medium', label: '中' },
                                { value: 'large', label: '大' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleChange('fontSize', opt.value)}
                                    className={`py-2 rounded-sm border transition-all font-serif ${settings.fontSize === opt.value
                                            ? 'border-stone-800 bg-stone-800 text-stone-50'
                                            : 'border-stone-300 hover:border-stone-400'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 文字速度 */}
                    <div className="mb-5">
                        <label className="flex items-center gap-2 text-sm text-stone-600 mb-2 font-serif">
                            <Clock size={16} />
                            文字速度
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { value: 'slow', label: '慢' },
                                { value: 'normal', label: '正常' },
                                { value: 'fast', label: '快' },
                                { value: 'instant', label: '立即' }
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleChange('textSpeed', opt.value)}
                                    className={`py-2 text-sm rounded-sm border transition-all font-serif ${settings.textSpeed === opt.value
                                            ? 'border-stone-800 bg-stone-800 text-stone-50'
                                            : 'border-stone-300 hover:border-stone-400'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 自动播放 */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-stone-600 font-serif">
                                自动播放
                            </label>
                            <button
                                onClick={() => handleChange('autoPlay', !settings.autoPlay)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoPlay ? 'bg-stone-800' : 'bg-stone-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoPlay ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        {settings.autoPlay && (
                            <div className="mt-2">
                                <label className="text-xs text-stone-500 mb-1 block">
                                    自动播放延迟: {settings.autoPlayDelay} 秒
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={settings.autoPlayDelay}
                                    onChange={(e) => handleChange('autoPlayDelay', parseInt(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    {/* 音效开关（预留） */}
                    <div className="mb-5 opacity-50">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-stone-600 font-serif flex items-center gap-2">
                                {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                音效（开发中）
                            </label>
                            <button
                                disabled
                                className={`relative w-12 h-6 rounded-full transition-colors bg-stone-300 cursor-not-allowed`}
                            >
                                <div className="absolute top-1 w-4 h-4 bg-white rounded-full translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* 按钮组 */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleReset}
                            className="flex-1 py-2.5 border border-stone-300 text-stone-600 rounded-sm hover:bg-stone-100 transition-colors font-serif flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={16} />
                            重置
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 bg-stone-800 text-stone-50 rounded-sm hover:bg-stone-700 transition-colors font-serif flex items-center justify-center gap-2"
                        >
                            {saved ? (
                                <>
                                    <Check size={16} />
                                    已保存
                                </>
                            ) : (
                                '保存设置'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
