import { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, X, Clock, Heart, Shield, Crown, AlertTriangle, Thermometer, Brain, Package } from 'lucide-react';
import { getSaveSlots, saveGame, loadGame, deleteSave } from '../services/saveService';
import { CHAPTERS as StoryChapters } from '../config/storyConfig';
import { CHAPTERS as SurvivalChapters } from '../config/survivalConfig';

/**
 * 存档管理弹窗组件
 */
export default function SaveModal({ isOpen, onClose, mode, userId, currentGameState, onLoad, gameMode = 'story' }) {
    // 根据游戏模式选择章节配置
    const CHAPTERS = gameMode === 'survival' ? SurvivalChapters : StoryChapters;
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen && userId) {
            refreshSlots();
        }
    }, [isOpen, userId]);

    const refreshSlots = () => {
        const userSlots = getSaveSlots(userId);
        setSlots(userSlots);
    };

    if (!isOpen) return null;

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSave = (slot) => {
        if (!currentGameState) {
            setMessage({ type: 'error', text: '没有可保存的游戏数据' });
            return;
        }

        // 如果槽位已有存档，确认覆盖
        const existingSlot = slots.find(s => s.slot === slot);
        if (!existingSlot.isEmpty) {
            if (!confirm('该槽位已有存档，确定要覆盖吗？')) {
                return;
            }
        }

        const result = saveGame(userId, slot, currentGameState);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            refreshSlots();
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                onClose();
            }, 1000);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleLoad = (slot) => {
        const result = loadGame(userId, slot);
        if (result.success) {
            onLoad(result.gameState);
            setMessage({ type: 'success', text: result.message });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                onClose();
            }, 500);
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleDelete = (slot, e) => {
        e.stopPropagation();
        if (!confirm('确定要删除这个存档吗？')) {
            return;
        }
        const result = deleteSave(userId, slot);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            refreshSlots();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    const handleSlotClick = (slot) => {
        if (mode === 'save') {
            handleSave(slot.slot);
        } else if (!slot.isEmpty) {
            handleLoad(slot.slot);
        }
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
                        {mode === 'save' ? (
                            <>
                                <Save size={24} />
                                保存游戏
                            </>
                        ) : (
                            <>
                                <FolderOpen size={24} />
                                读取存档
                            </>
                        )}
                    </h2>
                    <p className="text-center text-stone-500 text-sm mb-4 font-serif">
                        {mode === 'save' ? '选择一个槽位保存当前进度' : '选择一个存档继续游戏'}
                    </p>

                    {/* 消息提示 */}
                    {message.text && (
                        <div className={`text-center text-sm mb-4 p-2 rounded ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* 存档槽位列表 */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {slots.map((slot) => (
                            <div
                                key={slot.slot}
                                onClick={() => handleSlotClick(slot)}
                                className={`
                                    relative p-4 border rounded-sm transition-all cursor-pointer
                                    ${slot.isEmpty
                                        ? 'border-dashed border-stone-300 bg-stone-100/50 hover:border-stone-400'
                                        : 'border-stone-300 bg-white hover:border-stone-800 hover:shadow-md'
                                    }
                                    ${mode === 'load' && slot.isEmpty ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-serif text-stone-800 font-medium">
                                                存档 {slot.slot}
                                            </span>
                                            {!slot.isEmpty && (
                                                <span className="text-xs text-stone-500 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatDate(slot.savedAt)}
                                                </span>
                                            )}
                                        </div>

                                        {slot.isEmpty ? (
                                            <p className="text-stone-400 text-sm font-serif">空槽位</p>
                                        ) : (
                                            <>
                                                <p className="text-stone-600 text-sm font-serif line-clamp-1 mb-1">
                                                    {slot.preview}
                                                </p>
                                                {/* 章节信息 */}
                                                {slot.currentChapter && CHAPTERS[slot.currentChapter] && (
                                                    <p className="text-xs text-stone-400 mb-2 font-serif">
                                                        📖 {CHAPTERS[slot.currentChapter].title}
                                                    </p>
                                                )}
                                                {/* 属性预览 */}
                                                {slot.stats && (
                                                    <div className="flex gap-3 text-xs text-stone-500">
                                                        {gameMode === 'survival' ? (
                                                            <>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart size={12} className="text-rose-400" />
                                                                    {slot.stats.hp}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Thermometer size={12} className="text-orange-400" />
                                                                    {slot.stats.warmth}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Brain size={12} className="text-purple-400" />
                                                                    {slot.stats.sanity}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Package size={12} className="text-amber-400" />
                                                                    {slot.stats.supplies}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart size={12} className="text-rose-400" />
                                                                    {slot.stats.affinity}%
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Shield size={12} className="text-emerald-400" />
                                                                    {slot.stats.trust}%
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Crown size={12} className="text-amber-400" />
                                                                    {slot.stats.power}%
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <AlertTriangle size={12} className="text-stone-600" />
                                                                    {slot.stats.risk}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* 删除按钮 */}
                                    {!slot.isEmpty && (
                                        <button
                                            onClick={(e) => handleDelete(slot.slot, e)}
                                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                            title="删除存档"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
