import React from 'react';
import { X, Lock, Image as ImageIcon } from 'lucide-react';
import { CGS } from '../config/storyConfig';

const GalleryModal = ({ isOpen, onClose, unlockedCGs = [] }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-stone-50 w-full max-w-4xl rounded-sm shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-stone-200">
                    <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-2">
                        <ImageIcon className="text-stone-600" />
                        珍藏画卷
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {CGS.map((cg) => {
                            const isUnlocked = unlockedCGs.includes(cg.id);

                            return (
                                <div
                                    key={cg.id}
                                    className={`
                                        relative group rounded-sm overflow-hidden border-2 transition-all duration-300
                                        ${isUnlocked ? 'border-stone-300 shadow-md hover:shadow-xl' : 'border-stone-200 bg-stone-100'}
                                    `}
                                >
                                    {/* Image Container */}
                                    <div className="aspect-video w-full relative overflow-hidden bg-stone-200">
                                        {isUnlocked ? (
                                            <img
                                                src={cg.image}
                                                alt={cg.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
                                                <Lock size={32} className="mb-2 opacity-50" />
                                                <span className="font-serif text-sm">未解锁</span>
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        {isUnlocked && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className={`font-serif text-lg ${isUnlocked ? 'text-stone-800' : 'text-stone-400'}`}>
                                                {cg.title}
                                            </h3>
                                            {isUnlocked && (
                                                <span className="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded-full font-serif">
                                                    已收藏
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-serif leading-relaxed ${isUnlocked ? 'text-stone-600' : 'text-stone-300'}`}>
                                            {isUnlocked ? cg.description : '????????????'}
                                        </p>
                                        {!isUnlocked && (
                                            <p className="mt-2 text-xs text-stone-400 font-serif italic">
                                                解锁条件: {cg.unlockCondition}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryModal;
