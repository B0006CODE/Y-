import React, { useRef, useEffect } from 'react';
import { X, History, User, Bot } from 'lucide-react';
import * as StoryConfig from '../config/storyConfig';
import * as SurvivalConfig from '../config/survivalConfig';

/**
 * 历史记录回看弹窗组件
 */
const HistoryModal = ({ isOpen, onClose, history, gameMode = 'story' }) => {
    // 根据游戏模式选择配置
    const config = gameMode === 'survival' ? SurvivalConfig : StoryConfig;
    const { CHARACTER_NAME_MAP, CHARACTERS } = config;
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen && scrollRef.current) {
            // 滚动到底部
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 解析消息内容获取说话者
    const parseMessage = (content, isUser) => {
        if (isUser) {
            return {
                speaker: '我',
                text: content,
                avatar: CHARACTERS.heroine.avatar
            };
        }

        const match = content.match(/^\[(.*?)\]:\s*(.*)/s);
        if (match) {
            const speaker = match[1];
            const text = match[2];
            const avatar = CHARACTER_NAME_MAP[speaker] || null;
            return { speaker, text, avatar };
        }

        return { speaker: '旁白', text: content, avatar: null };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-sm shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
                {/* 装饰边角 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-stone-800" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-stone-800" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-stone-800" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-stone-800" />

                {/* 头部 */}
                <div className="flex justify-between items-center p-6 border-b border-stone-200 shrink-0">
                    <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-2">
                        <History size={24} className="text-stone-600" />
                        对话回顾
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 历史记录列表 */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="text-center text-stone-400 py-12 font-serif">
                            暂无对话记录
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((msg, idx) => {
                                const parsed = parseMessage(msg.content, msg.role === 'user');
                                const isUser = msg.role === 'user';

                                return (
                                    <div
                                        key={idx}
                                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                                    >
                                        {/* 头像 */}
                                        <div className="shrink-0">
                                            <div className="w-10 h-10 rounded-full border-2 border-stone-300 overflow-hidden bg-stone-200">
                                                {parsed.avatar ? (
                                                    <img
                                                        src={parsed.avatar}
                                                        alt={parsed.speaker}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                                                        {isUser ? <User size={16} /> : <Bot size={16} />}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 消息内容 */}
                                        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                                            <p className="text-xs text-stone-500 mb-1 font-serif">
                                                {parsed.speaker}
                                            </p>
                                            <div
                                                className={`inline-block p-3 rounded-sm text-sm font-serif leading-relaxed ${isUser
                                                    ? 'bg-stone-800 text-stone-50 rounded-tr-none'
                                                    : 'bg-white border border-stone-200 text-stone-700 rounded-tl-none'
                                                    }`}
                                            >
                                                {parsed.text.split('\n').map((line, i) => (
                                                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 底部信息 */}
                <div className="p-4 border-t border-stone-200 text-center shrink-0">
                    <p className="text-xs text-stone-400 font-serif">
                        共 {history.length} 条对话记录
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;
