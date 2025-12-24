import { useState, useEffect, useRef } from 'react';
import { Heart, Shield, Crown, Sparkles, Scroll, AlertTriangle, Save, RotateCcw, Send, Loader2, User, LogOut, Settings, Image as ImageIcon, BookOpen, History, Gamepad2 } from 'lucide-react';
import { generateGameResponse } from './services/llmService';
import { CHARACTER_NAME_MAP, SCENES, CHARACTERS, CHAPTERS } from './config/storyConfig';
import { getCurrentUser, logout } from './services/authService';
import { calculateEnding } from './services/endingService';
import AuthModal from './components/AuthModal';
import SaveModal from './components/SaveModal';
import SettingsModal from './components/SettingsModal';
import GalleryModal from './components/GalleryModal';
import ProfileModal from './components/ProfileModal';
import EndingModal from './components/EndingModal';
import HistoryModal from './components/HistoryModal';
import GameSettingsModal, { getGameSettings, getFontSizeClass } from './components/GameSettingsModal';


// --- Background Components (Unchanged) ---

const CloudPattern = () => (
    <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <pattern id="cloud-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M 100 100 Q 120 80, 150 100 T 200 100 Q 180 120, 150 120 T 100 100" fill="currentColor" className="text-stone-800" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cloud-pattern)" />
        </svg>
    </div>
);

const ParticleBackground = ({ type = 'flower' }) => {
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
            size: Math.random() * (type === 'snow' ? 3 : 8) + 2,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 2 - 1,
            opacity: Math.random() * 0.5 + 0.3,
            color: type === 'snow' ? '#ffffff' : '#ffb7c5'
        });

        for (let i = 0; i < 50; i++) {
            particles.push({ ...createParticle(), y: Math.random() * canvas.height });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, index) => {
                p.y += p.speedY;
                p.x += p.speedX + Math.sin(p.y * 0.01) * 0.5;
                p.rotation += p.rotationSpeed;

                if (p.y > canvas.height) {
                    particles[index] = createParticle();
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;

                if (type === 'snow') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
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

const LatticeBorder = ({ children, className = "" }) => (
    <div className={`relative p-8 ${className}`}>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-stone-800 rounded-tl-lg opacity-80">
            <div className="absolute top-2 left-2 w-12 h-12 border-t border-l border-stone-600" />
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-stone-800 rounded-tr-lg opacity-80">
            <div className="absolute top-2 right-2 w-12 h-12 border-t border-r border-stone-600" />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-stone-800 rounded-bl-lg opacity-80">
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b border-l border-stone-600" />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-stone-800 rounded-br-lg opacity-80">
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b border-r border-stone-600" />
        </div>

        <div className="relative z-10 bg-stone-50/90 backdrop-blur-sm border border-stone-200 shadow-xl rounded-sm p-6 min-h-[600px] h-full flex flex-col transition-all duration-500">
            {children}
        </div>
    </div>
);

const StatBar = ({ icon: Icon, label, value, color = "bg-stone-800" }) => (
    <div className="flex items-center gap-3 w-full max-w-xs group">
        <div className="p-2 rounded-full bg-stone-100 border border-stone-200 group-hover:border-stone-400 transition-colors">
            <Icon size={16} className="text-stone-600" />
        </div>
        <div className="flex-1">
            <div className="flex justify-between text-xs text-stone-500 mb-1 font-serif">
                <span>{label}</span>
                <span>{value}%</span>
            </div>
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        </div>
    </div>
);

// --- New Components ---

// 使用从配置文件导入的角色名称映射
const CHARACTER_IMAGES = CHARACTER_NAME_MAP;

const ChatMessage = ({ role, content }) => {
    const isUser = role === 'user';

    // Parse content for speaker tag: [Name]: Content
    let speaker = null;
    let displayContent = content;

    if (!isUser) {
        const match = content.match(/^\[(.*?)\]:\s*(.*)/s);
        if (match) {
            speaker = match[1];
            displayContent = match[2];
        }
    } else {
        // Check if user is speaking (usually "我" or "青鸾" or "沈晚棠")
        // For now, we assume user input is always the heroine speaking
        speaker = CHARACTERS.heroine.name;
    }

    const avatarUrl = speaker ? (CHARACTER_IMAGES[speaker] || (speaker === CHARACTERS.heroine.name ? CHARACTERS.heroine.avatar : null)) : null;

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start items-start'}`}>

            {/* Avatar for Assistant */}
            {!isUser && (
                <div className="mr-4 shrink-0 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-stone-300 overflow-hidden bg-stone-200 shadow-md">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={speaker} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif text-xs">
                                {speaker || "旁白"}
                            </div>
                        )}
                    </div>
                    {speaker && <span className="mt-1 text-xs text-stone-500 font-serif">{speaker}</span>}
                </div>
            )}

            <div className={`
                max-w-[75%] p-5 rounded-sm font-serif leading-loose text-lg relative
                ${isUser
                    ? 'bg-stone-800 text-stone-50 rounded-tr-none shadow-lg'
                    : 'bg-white/80 border border-stone-200 text-stone-900 rounded-tl-none shadow-sm'}
            `}>
                {displayContent.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
            </div>

            {/* Avatar for User (Heroine) */}
            {isUser && (
                <div className="ml-4 shrink-0 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-stone-300 overflow-hidden bg-stone-200 shadow-md">
                        <img src={CHARACTERS.heroine.avatar} alt="我" className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-1 text-xs text-stone-500 font-serif">我</span>
                </div>
            )}
        </div>
    );
};

export default function AncientLoveGame() {
    const [stats, setStats] = useState({ affinity: 0, trust: 0, power: 0, risk: 0, swe: 75, intr: 65 });
    const [history, setHistory] = useState([]); // { role: 'user' | 'assistant', content: string }
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef(null);

    // New State for Enhanced Features
    const [currentScene, setCurrentScene] = useState('banquet');
    const [currentChapter, setCurrentChapter] = useState('prologue');
    const [detailedAffinity, setDetailedAffinity] = useState({});
    const [unlockedCGs, setUnlockedCGs] = useState([]);
    const [showGallery, setShowGallery] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    // 账号系统状态
    const [currentUser, setCurrentUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveModalMode, setSaveModalMode] = useState('save'); // 'save' | 'load'
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // 新功能状态
    const [showEndingModal, setShowEndingModal] = useState(false);
    const [currentEnding, setCurrentEnding] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState(getGameSettings());

    // 检查登录状态
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    // Initial game start
    useEffect(() => {
        if (history.length === 0) {
            handleCommand("开始游戏");
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, streamingContent]);

    // Parse LLM Response for Tags
    const parseResponse = (content) => {
        let cleanContent = content;

        // 1. Parse Scene: [SCENE: scene_id]
        const sceneMatch = content.match(/\[SCENE:\s*(\w+)\]/);
        if (sceneMatch) {
            const sceneId = sceneMatch[1];
            if (SCENES[sceneId]) {
                setCurrentScene(sceneId);
            }
            cleanContent = cleanContent.replace(sceneMatch[0], '');
        }

        // 2. Parse Affinity: [AFFINITY: role_id: value]
        // Note: This might happen multiple times or in stream, so we need to be careful.
        // For simplicity in this version, we'll parse it from the final content string.
        const affinityRegex = /\[AFFINITY:\s*(\w+):\s*([+-]?\d+)\]/g;
        let match;
        while ((match = affinityRegex.exec(content)) !== null) {
            const [fullTag, roleId, valueStr] = match;
            const value = parseInt(valueStr, 10);

            setDetailedAffinity(prev => ({
                ...prev,
                [roleId]: (prev[roleId] || 0) + value
            }));

            // Also update global affinity stat (average or max?)
            // Let's just add to the global 'affinity' for now as a general "romantic progress" indicator
            setStats(prev => ({
                ...prev,
                affinity: Math.min(100, Math.max(0, prev.affinity + (value > 0 ? 1 : -1)))
            }));

            cleanContent = cleanContent.replace(fullTag, '');
        }

        // 3. Parse CG: [UNLOCK_CG: cg_id]
        const cgMatch = content.match(/\[UNLOCK_CG:\s*(\w+)\]/);
        if (cgMatch) {
            const cgId = cgMatch[1];
            setUnlockedCGs(prev => {
                if (!prev.includes(cgId)) return [...prev, cgId];
                return prev;
            });
            cleanContent = cleanContent.replace(cgMatch[0], '');
        }

        // 4. Parse Chapter: [CHAPTER: chapter_id]
        const chapterMatch = content.match(/\[CHAPTER:\s*(\w+)\]/);
        if (chapterMatch) {
            const chapterId = chapterMatch[1];
            if (CHAPTERS[chapterId]) {
                setCurrentChapter(chapterId);

                // 当进入终章时，触发结局计算
                if (chapterId === 'finale') {
                    setTimeout(() => {
                        const ending = calculateEnding(stats, detailedAffinity);
                        setCurrentEnding(ending);
                        setShowEndingModal(true);
                    }, 2000); // 延迟2秒显示结局，让玩家看完终章开场
                }
            }
            cleanContent = cleanContent.replace(chapterMatch[0], '');
        }

        // 5. Parse Trust: [TRUST: value]
        const trustMatch = content.match(/\[TRUST:\s*([+-]?\d+)\]/);
        if (trustMatch) {
            const value = parseInt(trustMatch[1], 10);
            setStats(prev => ({
                ...prev,
                trust: Math.min(100, Math.max(0, prev.trust + value))
            }));
            cleanContent = cleanContent.replace(trustMatch[0], '');
        }

        // 6. Parse Power: [POWER: value]
        const powerMatch = content.match(/\[POWER:\s*([+-]?\d+)\]/);
        if (powerMatch) {
            const value = parseInt(powerMatch[1], 10);
            setStats(prev => ({
                ...prev,
                power: Math.min(100, Math.max(0, prev.power + value))
            }));
            cleanContent = cleanContent.replace(powerMatch[0], '');
        }

        // 7. Parse Risk: [RISK: value]
        const riskMatch = content.match(/\[RISK:\s*([+-]?\d+)\]/);
        if (riskMatch) {
            const value = parseInt(riskMatch[1], 10);
            setStats(prev => ({
                ...prev,
                risk: Math.min(100, Math.max(0, prev.risk + value))
            }));
            cleanContent = cleanContent.replace(riskMatch[0], '');
        }

        return cleanContent;
    };

    const handleCommand = async (cmd) => {
        if (loading) return;
        const userCmd = cmd || input;
        if (!userCmd.trim()) return;

        setLoading(true);
        setInput('');

        // Add user message to history (except for initial auto-start)
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
                }
            );

            // Parse tags from the final complete response
            const finalContent = parseResponse(result.content);

            setHistory(prev => [...prev, { role: 'assistant', content: finalContent }]);
            setStreamingContent(""); // Clear streaming buffer after done
        } catch (error) {
            console.error("Game Error:", error);
            setHistory(prev => [...prev, { role: 'assistant', content: "（系统错误：无法连接到命运之轮，请稍后再试。）" }]);
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
        <div
            className="min-h-screen text-stone-800 font-serif overflow-hidden relative selection:bg-stone-800 selection:text-stone-50"
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                <img
                    src={SCENES[currentScene]?.image || SCENES['banquet'].image}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" /> {/* Dark overlay for better contrast */}
            </div>

            <CloudPattern />
            <ParticleBackground type="flower" />

            <div className="container mx-auto px-4 py-8 h-screen flex items-center justify-center relative z-20">
                <LatticeBorder className="w-full max-w-4xl h-[90vh]">

                    {/* Header / Stats */}
                    <div className="flex justify-between items-start mb-6 border-b border-stone-200 pb-4 shrink-0">
                        <div className="flex gap-4 md:gap-8 w-full overflow-x-auto">
                            <StatBar icon={Heart} label="好感" value={stats.affinity} color="bg-rose-400" />
                            <StatBar icon={Shield} label="信任" value={stats.trust} color="bg-emerald-400" />
                            <StatBar icon={Crown} label="权势" value={stats.power} color="bg-amber-400" />
                            <StatBar icon={AlertTriangle} label="风险" value={stats.risk} color="bg-stone-800" />
                        </div>
                        <div className="flex gap-2 ml-4 items-center">
                            {/* 用户状态 */}
                            {currentUser ? (
                                <>
                                    <span className="text-xs text-stone-500 font-serif hidden sm:inline">
                                        {currentUser.username}
                                    </span>
                                    <button
                                        onClick={() => { setSaveModalMode('save'); setShowSaveModal(true); }}
                                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                                        title="存档"
                                    >
                                        <Save size={18} />
                                    </button>
                                    <button
                                        onClick={() => { setSaveModalMode('load'); setShowSaveModal(true); }}
                                        className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                                        title="读档"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                    <button
                                        onClick={() => { logout(); setCurrentUser(null); }}
                                        className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                        title="退出登录"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="px-3 py-1.5 bg-stone-800 text-stone-50 rounded-sm text-xs font-serif hover:bg-stone-700 transition-colors flex items-center gap-1"
                                >
                                    <User size={14} />
                                    登录
                                </button>
                            )}
                            <button
                                onClick={() => setShowProfile(true)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                title="人物志"
                            >
                                <BookOpen size={18} />
                            </button>
                            <button
                                onClick={() => setShowGallery(true)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                title="珍藏画卷"
                            >
                                <ImageIcon size={18} />
                            </button>
                            {/* API设置按钮 */}
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                title="API 设置"
                            >
                                <Settings size={18} />
                            </button>
                            {/* 游戏设置按钮 */}
                            <button
                                onClick={() => setShowGameSettingsModal(true)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                title="游戏设置"
                            >
                                <Gamepad2 size={18} />
                            </button>
                            {/* 历史记录按钮 */}
                            <button
                                onClick={() => setShowHistoryModal(true)}
                                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
                                title="对话回顾"
                            >
                                <History size={18} />
                            </button>
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
                            <div className="flex justify-center items-center p-4 text-stone-400">
                                <Loader2 className="animate-spin mr-2" /> 命运推演中...
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="relative shrink-0">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入你的行动..."
                            disabled={loading}
                            className="w-full bg-white/80 border border-stone-300 rounded-sm py-3 px-4 pr-12 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all font-serif placeholder:text-stone-400"
                        />
                        <button
                            onClick={() => handleCommand()}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-500 hover:text-stone-800 disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>

                </LatticeBorder>
            </div>

            {/* 登录/注册弹窗 */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={(user) => setCurrentUser(user)}
            />

            {/* 存档弹窗 */}
            <SaveModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                mode={saveModalMode}
                userId={currentUser?.username}
                currentGameState={{
                    stats,
                    history,
                    currentScene,
                    currentChapter,
                    detailedAffinity,
                    unlockedCGs
                }}
                onLoad={(gameState) => {
                    setStats(gameState.stats);
                    setHistory(gameState.history);
                    // Load new state if available, otherwise defaults
                    if (gameState.currentScene) setCurrentScene(gameState.currentScene);
                    if (gameState.currentChapter) setCurrentChapter(gameState.currentChapter);
                    if (gameState.detailedAffinity) setDetailedAffinity(gameState.detailedAffinity);
                    if (gameState.unlockedCGs) setUnlockedCGs(gameState.unlockedCGs);
                }}
            />

            {/* 图鉴弹窗 */}
            <GalleryModal
                isOpen={showGallery}
                onClose={() => setShowGallery(false)}
                unlockedCGs={unlockedCGs}
            />

            {/* 人物志弹窗 */}
            <ProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                detailedAffinity={detailedAffinity}
                currentChapter={currentChapter}
            />

            {/* API设置弹窗 */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />

            {/* 游戏设置弹窗 */}
            <GameSettingsModal
                isOpen={showGameSettingsModal}
                onClose={() => setShowGameSettingsModal(false)}
                onSettingsChange={(newSettings) => setGameSettings(newSettings)}
            />

            {/* 历史记录弹窗 */}
            <HistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                history={history}
            />

            {/* 结局弹窗 */}
            <EndingModal
                isOpen={showEndingModal}
                onClose={() => setShowEndingModal(false)}
                ending={currentEnding}
                detailedAffinity={detailedAffinity}
            />
        </div>
    );
}
