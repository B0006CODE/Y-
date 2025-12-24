import React from 'react';
import { X, Heart, Star, Sparkles } from 'lucide-react';
import { ENDINGS } from '../services/endingService';
import { CHARACTERS } from '../config/storyConfig';

/**
 * 结局展示弹窗组件
 */
const EndingModal = ({ isOpen, onClose, ending, detailedAffinity }) => {
    if (!isOpen || !ending) return null;

    // 获取关联角色信息
    const getCharacterInfo = (characterKey) => {
        if (!characterKey) return null;
        const protagonists = CHARACTERS.protagonists;
        for (const [key, char] of Object.entries(protagonists)) {
            if (key === characterKey) {
                return char;
            }
        }
        return null;
    };

    const character = getCharacterInfo(ending.character);

    // 根据结局类型确定背景色
    const getBgGradient = () => {
        if (ending.id.includes('good')) {
            return 'from-rose-900/90 via-stone-900/95 to-stone-900';
        } else if (ending.id.includes('tragic') || ending.id.includes('bad')) {
            return 'from-slate-900/95 via-stone-900/95 to-stone-900';
        }
        return 'from-amber-900/90 via-stone-900/95 to-stone-900';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div className={`absolute inset-0 bg-gradient-to-b ${getBgGradient()}`} />

            {/* 装饰粒子效果 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-200/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* 内容 */}
            <div className="relative z-10 max-w-2xl mx-4 text-center">
                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-stone-400 hover:text-stone-200 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* 结局类型标识 */}
                <div className="mb-6">
                    {ending.id.includes('good') ? (
                        <div className="flex items-center justify-center gap-2 text-rose-300">
                            <Heart size={20} fill="currentColor" />
                            <span className="text-sm font-serif tracking-widest">HAPPY ENDING</span>
                            <Heart size={20} fill="currentColor" />
                        </div>
                    ) : ending.id.includes('tragic') ? (
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <Star size={20} />
                            <span className="text-sm font-serif tracking-widest">TRAGIC ENDING</span>
                            <Star size={20} />
                        </div>
                    ) : ending.id.includes('bad') ? (
                        <div className="flex items-center justify-center gap-2 text-red-400">
                            <span className="text-sm font-serif tracking-widest">BAD ENDING</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2 text-amber-300">
                            <Sparkles size={20} />
                            <span className="text-sm font-serif tracking-widest">NORMAL ENDING</span>
                            <Sparkles size={20} />
                        </div>
                    )}
                </div>

                {/* 结局标题 */}
                <h1 className="text-5xl font-serif text-stone-100 mb-4 tracking-wider">
                    {ending.title}
                </h1>

                {/* 角色头像 */}
                {character && (
                    <div className="mb-6">
                        <div className="w-24 h-24 mx-auto rounded-full border-4 border-stone-600 overflow-hidden shadow-2xl">
                            <img
                                src={character.avatar}
                                alt={character.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="mt-2 text-stone-400 font-serif">
                            与 <span className="text-stone-200">{character.name}</span> 的故事
                        </p>
                    </div>
                )}

                {/* 结局描述 */}
                <div className="bg-black/30 backdrop-blur-sm rounded-sm p-6 mb-8 border border-stone-700">
                    <p className="text-lg text-stone-200 font-serif leading-relaxed">
                        {ending.description}
                    </p>
                </div>

                {/* 属性总结 */}
                {detailedAffinity && Object.keys(detailedAffinity).length > 0 && (
                    <div className="mb-8">
                        <p className="text-stone-500 text-sm mb-3 font-serif">最终好感度</p>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {Object.entries(detailedAffinity).map(([roleId, value]) => {
                                const charInfo = getCharacterInfo(roleId);
                                if (!charInfo) return null;
                                return (
                                    <div key={roleId} className="text-center">
                                        <div className="w-12 h-12 mx-auto rounded-full border-2 border-stone-600 overflow-hidden mb-1">
                                            <img
                                                src={charInfo.avatar}
                                                alt={charInfo.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <p className="text-xs text-stone-400">{charInfo.name}</p>
                                        <p className="text-sm text-rose-300">{value > 0 ? '+' : ''}{value}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 按钮 */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-stone-800 text-stone-200 rounded-sm hover:bg-stone-700 transition-colors font-serif border border-stone-600"
                    >
                        继续游戏
                    </button>
                </div>

                {/* 底部装饰 */}
                <p className="mt-8 text-stone-600 text-sm font-serif">
                    — 凤鸣九霄 —
                </p>
            </div>
        </div>
    );
};

export default EndingModal;
