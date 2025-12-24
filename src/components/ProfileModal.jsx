import React, { useState } from 'react';
import { X, User, Heart, Shield, Star, BookOpen, MapPin } from 'lucide-react';
import { CHARACTERS, CHAPTERS } from '../config/storyConfig';

const ProfileModal = ({ isOpen, onClose, detailedAffinity = {}, currentChapter = 'prologue' }) => {
    const [selectedCharId, setSelectedCharId] = useState('heroine');

    if (!isOpen) return null;

    // Combine all characters into one list for the sidebar
    const allCharacters = [
        ...Object.entries(CHARACTERS.protagonists).map(([id, char]) => ({ id, ...char, type: 'protagonist' })),
        ...Object.entries(CHARACTERS.supporting).map(([id, char]) => ({ id, ...char, type: 'supporting' }))
    ];

    const getCharacterData = () => {
        if (selectedCharId === 'heroine') {
            return {
                ...CHARACTERS.heroine,
                type: 'heroine',
                id: 'heroine'
            };
        }
        return allCharacters.find(c => c.id === selectedCharId);
    };

    const selectedChar = getCharacterData();
    const affinity = detailedAffinity[selectedCharId] || 0;
    const chapterInfo = CHAPTERS[currentChapter];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-stone-50 w-full max-w-5xl rounded-sm shadow-2xl border border-stone-200 flex h-[80vh] overflow-hidden">

                {/* Sidebar - Character List */}
                <div className="w-64 bg-stone-100 border-r border-stone-200 flex flex-col">
                    <div className="p-4 border-b border-stone-200">
                        <h2 className="text-xl font-serif text-stone-800 flex items-center gap-2">
                            <User className="text-stone-600" />
                            人物志
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {/* Heroine / My Status */}
                        <button
                            onClick={() => setSelectedCharId('heroine')}
                            className={`w-full text-left p-3 rounded-sm mb-4 flex items-center gap-3 transition-colors ${selectedCharId === 'heroine' ? 'bg-stone-800 text-stone-50 shadow-md' : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-300 shrink-0">
                                <img src={CHARACTERS.heroine.avatar} alt={CHARACTERS.heroine.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-serif text-sm truncate">{CHARACTERS.heroine.name}</div>
                                <div className="text-xs opacity-70 truncate">我的状态</div>
                            </div>
                        </button>

                        <div className="mb-4">
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">可攻略角色</h3>
                            {allCharacters.filter(c => c.type === 'protagonist').map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedCharId(char.id)}
                                    className={`w-full text-left p-3 rounded-sm mb-1 flex items-center gap-3 transition-colors ${selectedCharId === char.id ? 'bg-stone-800 text-stone-50 shadow-md' : 'hover:bg-stone-200 text-stone-700'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-300 shrink-0">
                                        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-serif text-sm truncate">{char.name}</div>
                                        <div className="text-xs opacity-70 truncate">{char.title}</div>
                                    </div>
                                    {detailedAffinity[char.id] > 0 && (
                                        <div className="text-xs font-serif text-rose-400 flex items-center gap-0.5">
                                            <Heart size={10} fill="currentColor" />
                                            {detailedAffinity[char.id]}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-2">重要人物</h3>
                            {allCharacters.filter(c => c.type === 'supporting').map(char => (
                                <button
                                    key={char.id}
                                    onClick={() => setSelectedCharId(char.id)}
                                    className={`w-full text-left p-3 rounded-sm mb-1 flex items-center gap-3 transition-colors ${selectedCharId === char.id ? 'bg-stone-200 text-stone-800' : 'hover:bg-stone-200 text-stone-600'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-300 shrink-0">
                                        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-serif text-sm truncate">{char.name}</div>
                                        <div className="text-xs opacity-70 truncate">{char.title}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Character Detail */}
                <div className="flex-1 flex flex-col relative bg-[url('/bg_banquet.png')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-stone-200/50 rounded-full transition-colors text-stone-500 z-10"
                    >
                        <X size={24} />
                    </button>

                    {selectedChar && (
                        <div className="relative z-0 flex-1 flex flex-col md:flex-row p-8 gap-8 overflow-y-auto custom-scrollbar">
                            {/* Left: Portrait */}
                            <div className="w-full md:w-1/3 flex flex-col items-center">
                                <div className="w-full aspect-[3/4] rounded-sm overflow-hidden border-4 border-stone-200 shadow-xl bg-stone-100 mb-6 relative group">
                                    <img src={selectedChar.avatar} alt={selectedChar.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 border-inner pointer-events-none" />
                                </div>

                                {selectedChar.type === 'protagonist' && (
                                    <div className="w-full bg-white/80 p-4 rounded-sm border border-stone-200 shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-serif text-stone-600 flex items-center gap-2">
                                                <Heart size={16} className="text-rose-400" />
                                                好感度
                                            </span>
                                            <span className="font-serif text-2xl text-rose-500">{affinity}</span>
                                        </div>
                                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-400 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, affinity)}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 text-xs text-stone-400 text-center font-serif">
                                            {affinity < 20 ? "初识" : affinity < 50 ? "相知" : affinity < 80 ? "倾心" : "生死相许"}
                                        </div>
                                    </div>
                                )}

                                {selectedChar.type === 'heroine' && chapterInfo && (
                                    <div className="w-full bg-stone-800 text-stone-50 p-4 rounded-sm border border-stone-700 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2 text-stone-300 font-serif text-sm">
                                            <MapPin size={14} />
                                            <span>当前进度</span>
                                        </div>
                                        <div className="font-serif text-lg mb-1">{chapterInfo.title}</div>
                                        <div className="text-xs text-stone-400 leading-relaxed">{chapterInfo.description}</div>
                                    </div>
                                )}
                            </div>

                            {/* Right: Info */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <h1 className="text-4xl font-serif text-stone-800">{selectedChar.name}</h1>
                                        <span className="text-lg font-serif text-stone-500">
                                            {selectedChar.type === 'heroine' ? selectedChar.disguiseName : selectedChar.title}
                                        </span>
                                    </div>
                                    <div className="h-0.5 w-20 bg-stone-800 mb-4" />
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {selectedChar.type === 'heroine' ? (
                                        <>
                                            <InfoCard icon={User} title="真实身份" content={selectedChar.background} />
                                            <InfoCard icon={Star} title="性格" content={selectedChar.personality || "未知"} />
                                        </>
                                    ) : (
                                        <>
                                            <InfoCard icon={User} title="性格" content={selectedChar.personality || "未知"} />
                                            <InfoCard icon={BookOpen} title="背景" content={selectedChar.background} />
                                            <InfoCard icon={Star} title="谈吐" content={selectedChar.speakingStyle} />
                                        </>
                                    )}

                                    {selectedChar.difficulty && (
                                        <div className="bg-white/60 p-4 rounded-sm border border-stone-200/50">
                                            <div className="flex items-center gap-2 mb-1 text-stone-500 font-serif text-sm">
                                                <Shield size={14} />
                                                <span>攻略难度</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={16}
                                                        className={i < selectedChar.difficulty ? "text-amber-400 fill-amber-400" : "text-stone-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ icon: Icon, title, content }) => (
    <div className="bg-white/60 p-4 rounded-sm border border-stone-200/50 hover:bg-white/80 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-stone-500 font-serif text-sm">
            <Icon size={14} />
            <span>{title}</span>
        </div>
        <p className="text-stone-800 font-serif leading-relaxed">
            {content}
        </p>
    </div>
);

export default ProfileModal;
