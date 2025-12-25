import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Thermometer, Brain, Package, Save, RotateCcw, Send, Loader2, User, LogOut, Settings, Image as ImageIcon, BookOpen, History, Gamepad2, Zap, Utensils, Sliders } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateGameResponse } from './services/llmService';
import { CHARACTER_NAME_MAP, SCENES, CHARACTERS, CHAPTERS } from './config/survivalConfig';
import { getCurrentUser, logout } from './services/authService';
import { calculateSurvivalEnding } from './services/endingService';
import AuthModal from './components/AuthModal';
import SaveModal from './components/SaveModal';
import SettingsModal from './components/SettingsModal';
import GalleryModal from './components/GalleryModal';
import ProfileModal from './components/ProfileModal';
import EndingModal from './components/EndingModal';
import HistoryModal from './components/HistoryModal';
import GameSettingsModal, { getGameSettings, getFontSizeClass } from './components/GameSettingsModal';

// --- Background Components ---

const SnowPattern = () => (
    <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <pattern id="snow-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" className="text-white" />
                <circle cx="50" cy="80" r="1.5" fill="currentColor" className="text-white" />
                <circle cx="120" cy="40" r="2.5" fill="currentColor" className="text-white" />
                <circle cx="160" cy="140" r="1" fill="currentColor" className="text-white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#snow-pattern)" />
        </svg>
    </div>
);

const ParticleBackground = ({ type = 'snow' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: -20,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * 2 + 1,
            speedX: Math.random() * 1 - 0.5,
            opacity: Math.random() * 0.5 + 0.3,
            color: '#ffffff'
        });

        for (let i = 0; i < 100; i++) {
            particles.push({ ...createParticle(), y: Math.random() * canvas.height });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > canvas.height) {
                    particles[index] = createParticle();
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [type]);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
};

const IceBorder = ({ children, className = "" }) => (
    <div className={`relative p-4 md:p-8 ${className}`}>
        {/* 冰霜边框效果 */}
        <div className="absolute inset-0 border-4 border-cyan-100/30 rounded-lg pointer-events-none shadow-[0_0_20px_rgba(165,243,252,0.2)]" />

        <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-2xl rounded-sm p-3 md:p-6 min-h-[400px] md:min-h-[600px] h-full flex flex-col transition-all duration-500 safe-area-bottom text-slate-100">
            {children}
        </div>
    </div>
);

const StatBar = ({ icon: Icon, label, value, color = "bg-cyan-500", max = 100, hideOnMobile = false }) => (
    <div className={`flex items-center gap-1 md:gap-3 ${hideOnMobile ? 'hidden md:flex' : ''}`}>
        <div className="p-1 md:p-2 rounded-full bg-slate-800 border border-slate-700">
            <Icon size={14} className="md:w-4 md:h-4 text-slate-400" />
        </div>
        <div className="hidden md:flex flex-1 flex-col max-w-[100px]">
            <div className="flex justify-between text-xs text-slate-400 mb-1 font-sans">
                <span>{label}</span>
                <span>{value}/{max}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
                />
            </div>
        </div>
        <span className="md:hidden text-xs text-slate-400 font-sans min-w-[28px]">{value}</span>
    </div>
);

// --- Components ---

const CHARACTER_IMAGES = CHARACTER_NAME_MAP;

const ChatMessage = ({ role, content }) => {
    const isUser = role === 'user';
    let speaker = null;
    let displayContent = content;

    if (!isUser) {
        const match = content.match(/^\[(.*?)\]:\s*(.*)/s);
        if (match) {
            speaker = match[1];
            displayContent = match[2];
        }
    } else {
        speaker = CHARACTERS.heroine.name;
    }

    const avatarUrl = speaker ? (CHARACTER_IMAGES[speaker] || (speaker === CHARACTERS.heroine.name ? CHARACTERS.heroine.avatar : null)) : null;

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start items-start'}`}>
            {!isUser && (
                <div className="mr-2 md:mr-4 shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-800 shadow-md">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={speaker} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-sans text-xs">
                                {speaker || "旁白"}
                            </div>
                        )}
                    </div>
                    {speaker && <span className="mt-1 text-xs text-slate-400 font-sans hidden sm:inline">{speaker}</span>}
                </div>
            )}

            <div className={`
                max-w-[75%] p-5 rounded-sm font-sans leading-loose text-lg relative
                ${isUser
                    ? 'bg-cyan-900/80 text-cyan-50 rounded-tr-none shadow-lg border border-cyan-800'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none shadow-sm'}
            `}>
                <div className="prose prose-invert prose-sm max-w-none">
                    <Markdown
                        components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-cyan-400">{children}</strong>,
                            em: ({ children }) => <em className="italic text-slate-400">{children}</em>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-cyan-500 pl-4 my-2 italic text-slate-400 bg-slate-900/50 py-1">{children}</blockquote>,
                        }}
                    >
                        {displayContent}
                    </Markdown>
                </div>
            </div>

            {isUser && (
                <div className="ml-2 md:ml-4 shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-slate-600 overflow-hidden bg-slate-800 shadow-md">
                        <img src={CHARACTERS.heroine.avatar} alt="我" className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-1 text-xs text-slate-400 font-sans hidden sm:inline">我</span>
                </div>
            )}
        </div>
    );
};

export default function SurvivalGame() {
    // 生存属性: HP, 温暖度, 饥饿, 理智, 物资
    const [stats, setStats] = useState({
        hp: 100,
        warmth: 80,
        hunger: 20,
        sanity: 90,
        supplies: 5
    });
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef(null);

    const [currentScene, setCurrentScene] = useState('snowfield');
    const [currentChapter, setCurrentChapter] = useState('prologue');
    const [detailedAffinity, setDetailedAffinity] = useState({});
    const [unlockedCGs, setUnlockedCGs] = useState([]);

    // Modals
    const [showGallery, setShowGallery] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveModalMode, setSaveModalMode] = useState('save');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showEndingModal, setShowEndingModal] = useState(false);
    const [currentEnding, setCurrentEnding] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState(getGameSettings());

    const [suggestedOptions, setSuggestedOptions] = useState(['呼救', '坚持向前走', '观察那个人影']);

    // 使用 ref 存储最新 stats 以避免闭包问题
    const statsRef = useRef(stats);
    const affinityRef = useRef(detailedAffinity);
    const gameInitialized = useRef(false);

    useEffect(() => {
        statsRef.current = stats;
    }, [stats]);

    useEffect(() => {
        affinityRef.current = detailedAffinity;
    }, [detailedAffinity]);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    useEffect(() => {
        if (!gameInitialized.current && history.length === 0) {
            gameInitialized.current = true;
            handleCommand("开始游戏");
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, streamingContent]);

    const parseResponse = (content) => {
        let cleanContent = content;

        // SCENE
        const sceneMatch = content.match(/\[SCENE:\s*(\w+)\]/);
        if (sceneMatch) {
            if (SCENES[sceneMatch[1]]) setCurrentScene(sceneMatch[1]);
            cleanContent = cleanContent.replace(sceneMatch[0], '');
        }

        // AFFINITY - 支持两种格式: [AFFINITY: roleId: +5] 或 [AFFINITY: roleId +5]
        const affinityRegex = /\[AFFINITY:\s*(\w+):?\s*([+-]?\d+)\]/g;
        let match;
        const affinityMatches = [];
        while ((match = affinityRegex.exec(content)) !== null) {
            affinityMatches.push(match);
            const [fullTag, roleId, valueStr] = match;
            const value = parseInt(valueStr, 10);
            setDetailedAffinity(prev => ({ ...prev, [roleId]: (prev[roleId] || 0) + value }));
        }
        // 移除所有匹配到的 AFFINITY 标签
        affinityMatches.forEach(m => {
            cleanContent = cleanContent.replace(m[0], '');
        });

        // STATS
        const statPatterns = [
            { key: 'hp', regex: /\[HP:\s*([+-]?\d+)\]/ },
            { key: 'warmth', regex: /\[WARMTH:\s*([+-]?\d+)\]/ },
            { key: 'hunger', regex: /\[HUNGER:\s*([+-]?\d+)\]/ },
            { key: 'sanity', regex: /\[SANITY:\s*([+-]?\d+)\]/ },
            { key: 'supplies', regex: /\[SUPPLIES:\s*([+-]?\d+)\]/ }
        ];

        statPatterns.forEach(({ key, regex }) => {
            const statMatch = content.match(regex);
            if (statMatch) {
                const value = parseInt(statMatch[1], 10);
                setStats(prev => ({
                    ...prev,
                    [key]: Math.max(0, key === 'supplies' ? prev[key] + value : Math.min(100, prev[key] + value))
                }));
                cleanContent = cleanContent.replace(statMatch[0], '');
            }
        });

        // CG
        const cgMatch = content.match(/\[UNLOCK_CG:\s*(\w+)\]/);
        if (cgMatch) {
            setUnlockedCGs(prev => prev.includes(cgMatch[1]) ? prev : [...prev, cgMatch[1]]);
            cleanContent = cleanContent.replace(cgMatch[0], '');
        }

        // CHAPTER
        const chapterMatch = content.match(/\[CHAPTER:\s*(\w+)\]/);
        if (chapterMatch) {
            setCurrentChapter(chapterMatch[1]);
            if (chapterMatch[1] === 'finale') {
                // 使用 ref 获取最新值避免闭包问题
                setTimeout(() => {
                    const ending = calculateSurvivalEnding(statsRef.current, affinityRef.current);
                    setCurrentEnding(ending);
                    setShowEndingModal(true);
                }, 2000);
            }
            cleanContent = cleanContent.replace(chapterMatch[0], '');
        }

        // OPTIONS
        const optionsMatch = content.match(/\[OPTIONS:\s*(.+?)\]/s);
        if (optionsMatch) {
            const options = optionsMatch[1].split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);
            if (options.length > 0) setSuggestedOptions(options.slice(0, 3));
            cleanContent = cleanContent.replace(optionsMatch[0], '');
        }

        return cleanContent.trim();
    };

    const handleCommand = async (cmd) => {
        if (loading) return;
        const userCmd = cmd || input;
        if (!userCmd.trim()) return;

        setLoading(true);
        setInput('');

        if (history.length > 0 || userCmd !== "开始游戏") {
            setHistory(prev => [...prev, { role: 'user', content: userCmd }]);
        }

        try {
            let currentResponse = "";
            setStreamingContent("");


            const result = await generateGameResponse(
                history,
                userCmd,
                stats,
                (chunk) => {
                    currentResponse += chunk;
                    setStreamingContent(currentResponse);
                },
                'survival' // Mode flag
            );

            const finalContent = parseResponse(result.content);
            setHistory(prev => [...prev, { role: 'assistant', content: finalContent }]);
            setStreamingContent("");
        } catch (error) {
            console.error("Game Error:", error);
            setHistory(prev => [...prev, { role: 'assistant', content: "（系统错误：通讯中断...）" }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommand();
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative selection:bg-cyan-900 selection:text-cyan-50">
            {/* Background */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                <img
                    src={SCENES[currentScene]?.image || SCENES['snowfield'].image}
                    alt="Background"
                    className="w-full h-full object-cover opacity-60 grayscale-[30%]"
                />
                <div className="absolute inset-0 bg-slate-950/50" />
            </div>

            <SnowPattern />
            <ParticleBackground type="snow" />

            <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 h-screen flex items-center justify-center relative z-20">
                <IceBorder className="w-full max-w-4xl h-[95vh] md:h-[90vh]">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 md:mb-6 border-b border-slate-700 pb-3 md:pb-4 shrink-0">
                        <div className="flex gap-1 md:gap-4 items-center">
                            <StatBar icon={Heart} label="生命" value={stats.hp} color="bg-rose-500" />
                            <StatBar icon={Thermometer} label="体温" value={stats.warmth} color="bg-orange-400" />
                            <StatBar icon={Utensils} label="饱腹" value={100 - stats.hunger} color="bg-emerald-400" hideOnMobile />
                            <StatBar icon={Brain} label="理智" value={stats.sanity} color="bg-purple-400" hideOnMobile />
                            <div className="flex items-center gap-1 text-amber-400 ml-2">
                                <Package size={16} />
                                <span className="text-sm font-bold">{stats.supplies}</span>
                            </div>
                        </div>

                        <div className="flex gap-1 md:gap-2 ml-0 md:ml-4 items-center flex-wrap justify-end w-full md:w-auto">
                            {currentUser ? (
                                <>
                                    <span className="text-xs text-slate-500 hidden md:inline">{currentUser.username}</span>
                                    <button onClick={() => { setSaveModalMode('save'); setShowSaveModal(true); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><Save size={18} /></button>
                                    <button onClick={() => { setSaveModalMode('load'); setShowSaveModal(true); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><RotateCcw size={18} /></button>
                                    <button onClick={() => { logout(); setCurrentUser(null); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><LogOut size={18} /></button>
                                </>
                            ) : (
                                <button onClick={() => setShowAuthModal(true)} className="px-3 py-1.5 bg-cyan-900 text-cyan-100 rounded-sm text-xs hover:bg-cyan-800 flex items-center gap-1"><User size={14} /> 登录</button>
                            )}
                            <button onClick={() => setShowProfile(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="人物档案"><BookOpen size={18} /></button>
                            <button onClick={() => setShowGallery(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="CG画廊"><ImageIcon size={18} /></button>
                            <button onClick={() => setShowHistoryModal(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="对话历史"><History size={18} /></button>
                            <button onClick={() => setShowGameSettingsModal(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="游戏设置"><Sliders size={18} /></button>
                            <button onClick={() => setShowSettingsModal(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="API设置"><Settings size={18} /></button>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 overflow-y-auto pr-4 custom-scrollbar mb-4 ${getFontSizeClass(gameSettings.fontSize)}`} ref={scrollRef}>
                        {history.map((msg, idx) => (
                            <ChatMessage key={idx} role={msg.role} content={msg.content} />
                        ))}
                        {loading && streamingContent && (
                            <ChatMessage role="assistant" content={streamingContent} />
                        )}
                        {loading && !streamingContent && (
                            <div className="flex justify-center items-center p-4 text-slate-500">
                                <Loader2 className="animate-spin mr-2" /> 信号接收中...
                            </div>
                        )}

                        {!loading && suggestedOptions.length > 0 && (
                            <div className="mt-4 mb-2">
                                <div className="flex items-center gap-2 mb-3 text-slate-500">
                                    <Zap size={16} className="text-cyan-500" />
                                    <span className="text-sm">行动选择：</span>
                                </div>
                                <div className="grid gap-2">
                                    {suggestedOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCommand(option)}
                                            className="w-full text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg py-3 px-4 text-slate-300 transition-all shadow-sm hover:shadow-md group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </span>
                                                <span className="flex-1">{option}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="输入你的行动..."
                                disabled={loading}
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-sm py-3 px-4 pr-12 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 text-slate-200"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <button
                                    onClick={() => handleCommand()}
                                    disabled={loading || !input.trim()}
                                    className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                </IceBorder>
            </div>

            {/* Modals */}
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={(user) => setCurrentUser(user)} />
            <SaveModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} mode={saveModalMode} userId={currentUser?.username} currentGameState={{ stats, history, currentScene, currentChapter, detailedAffinity, unlockedCGs }} onLoad={(gameState) => { gameInitialized.current = true; setStats(gameState.stats); setHistory(gameState.history); if (gameState.currentScene) setCurrentScene(gameState.currentScene); if (gameState.currentChapter) setCurrentChapter(gameState.currentChapter); if (gameState.detailedAffinity) setDetailedAffinity(gameState.detailedAffinity); if (gameState.unlockedCGs) setUnlockedCGs(gameState.unlockedCGs); }} gameMode="survival" />
            <GalleryModal isOpen={showGallery} onClose={() => setShowGallery(false)} unlockedCGs={unlockedCGs} gameMode="survival" />
            <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} detailedAffinity={detailedAffinity} currentChapter={currentChapter} gameMode="survival" />
            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
            <GameSettingsModal isOpen={showGameSettingsModal} onClose={() => setShowGameSettingsModal(false)} onSettingsChange={setGameSettings} />
            <HistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} history={history} gameMode="survival" />
            <EndingModal isOpen={showEndingModal} onClose={() => setShowEndingModal(false)} ending={currentEnding} detailedAffinity={detailedAffinity} gameMode="survival" />
        </div>
    );
}
