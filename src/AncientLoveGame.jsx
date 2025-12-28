import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Shield, Crown, Sparkles, Scroll, AlertTriangle, Save, RotateCcw, Send, Loader2, User, LogOut, Settings, Image as ImageIcon, BookOpen, History, Gamepad2, MessageSquare, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateGameResponse, resetHistorySummaryCache } from './services/llmService';
import { getSaveSlots, getLatestSave } from './services/saveService';
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
import GameSettingsModal from './components/GameSettingsModal';
import { getGameSettings, getFontSizeClass } from './services/gameSettings';


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
    <div className={`relative p-4 md:p-8 ${className}`}>
        {/* 装饰边角 - 移动端缩小 */}
        <div className="absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 border-t-2 border-l-2 border-stone-800 rounded-tl-lg opacity-80">
            <div className="absolute top-1 left-1 md:top-2 md:left-2 w-6 h-6 md:w-12 md:h-12 border-t border-l border-stone-600" />
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 border-t-2 border-r-2 border-stone-800 rounded-tr-lg opacity-80">
            <div className="absolute top-1 right-1 md:top-2 md:right-2 w-6 h-6 md:w-12 md:h-12 border-t border-r border-stone-600" />
        </div>
        <div className="absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 border-b-2 border-l-2 border-stone-800 rounded-bl-lg opacity-80">
            <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 w-6 h-6 md:w-12 md:h-12 border-b border-l border-stone-600" />
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 md:w-16 md:h-16 border-b-2 border-r-2 border-stone-800 rounded-br-lg opacity-80">
            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 w-6 h-6 md:w-12 md:h-12 border-b border-r border-stone-600" />
        </div>

        <div className="relative z-10 bg-stone-50/90 backdrop-blur-sm border border-stone-200 shadow-xl rounded-sm p-3 md:p-6 min-h-[400px] md:min-h-[600px] h-full flex flex-col transition-all duration-500 safe-area-bottom">
            {children}
        </div>
    </div>
);

const StatBar = ({ icon: Icon, label, value, color = "bg-stone-800" }) => (
    <div className="flex items-center gap-1 md:gap-3 shrink-0">
        {/* 移动端紧凑布局: 图标 + 标签 + 数值 */}
        <div className="p-1 md:p-2 rounded-full bg-stone-100 border border-stone-200">
            {React.createElement(Icon, { size: 14, className: "md:w-4 md:h-4 text-stone-600" })}
        </div>
        {/* 移动端: 显示标签和数值 */}
        <div className="md:hidden flex items-center gap-0.5">
            <span className="text-xs text-stone-500 font-serif">{label}</span>
            <span className="text-xs text-stone-700 font-serif font-medium">{value}%</span>
        </div>
        {/* 桌面端: 显示完整标签和进度条 */}
        <div className="hidden md:flex flex-1 flex-col max-w-[100px]">
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
        const match = content.match(/^\s*(?:\[(.*?)\]|([^[\]:]+)):\s*(.*)/s);
        if (match) {
            speaker = (match[1] || match[2]).trim();
            displayContent = match[3];
        }
    } else {
        // Check if user is speaking (usually "我" or "青鸾" or "沈晚棠")
        // For now, we assume user input is always the heroine speaking
        speaker = CHARACTERS.heroine.name;
    }

    const avatarUrl = speaker ? (CHARACTER_IMAGES[speaker] || (speaker === CHARACTERS.heroine.name ? CHARACTERS.heroine.avatar : null)) : null;

    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start items-start'}`}>

            {/* Avatar for Assistant - 移动端缩小 */}
            {!isUser && (
                <div className="mr-2 md:mr-4 shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-stone-300 overflow-hidden bg-stone-200 shadow-md">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={speaker} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-serif text-xs">
                                {speaker || "旁白"}
                            </div>
                        )}
                    </div>
                    {speaker && <span className="mt-1 text-xs text-stone-500 font-serif hidden sm:inline">{speaker}</span>}
                </div>
            )}

            <div className={`
                max-w-[75%] p-5 rounded-sm font-serif leading-loose text-lg relative
                ${isUser
                    ? 'bg-stone-800 text-stone-50 rounded-tr-none shadow-lg'
                    : 'bg-white/80 border border-stone-200 text-stone-900 rounded-tl-none shadow-sm'}
            `}>
                <div className="prose prose-stone prose-sm max-w-none">
                    <Markdown
                        components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-inherit">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-amber-700">{children}</strong>,
                            em: ({ children }) => <em className="italic text-stone-600">{children}</em>,
                            h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-stone-800">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-stone-800">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-bold mb-1 text-stone-700">{children}</h3>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-amber-400 pl-4 my-2 italic text-stone-600 bg-amber-50/50 py-1">{children}</blockquote>,
                            hr: () => <hr className="my-3 border-stone-300" />,
                        }}
                    >
                        {displayContent}
                    </Markdown>
                </div>
            </div>

            {/* Avatar for User (Heroine) - 移动端缩小 */}
            {isUser && (
                <div className="ml-2 md:ml-4 shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-2 border-stone-300 overflow-hidden bg-stone-200 shadow-md">
                        <img src={CHARACTERS.heroine.avatar} alt="我" className="w-full h-full object-cover" />
                    </div>
                    <span className="mt-1 text-xs text-stone-500 font-serif hidden sm:inline">我</span>
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
    const [saveSlots, setSaveSlots] = useState([]);

    // 新功能状态
    const [showEndingModal, setShowEndingModal] = useState(false);
    const [currentEnding, setCurrentEnding] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
    const [gameSettings, setGameSettings] = useState(getGameSettings());

    // 选项卡状态
    const [suggestedOptions, setSuggestedOptions] = useState(['开始探索', '四处观望', '询问周围的人']);

    // 新增：选择历史追踪（防止选项重复）
    const [recentChoices, setRecentChoices] = useState([]);
    // 新增：剧情进度追踪
    const [plotProgress, setPlotProgress] = useState(0);

    // 流式输出节流相关的 refs
    const lastUpdateTime = useRef(0);
    const pendingContent = useRef('');
    const rafId = useRef(null);
    const gameInitialized = useRef(false);
    const statsRef = useRef(stats);
    const affinityRef = useRef(detailedAffinity);

    // 检查登录状态
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        statsRef.current = stats;
    }, [stats]);

    useEffect(() => {
        affinityRef.current = detailedAffinity;
    }, [detailedAffinity]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, streamingContent]);

    const refreshSaveSlots = useCallback(async () => {
        if (!currentUser) {
            setSaveSlots([]);
            return;
        }
        const slots = await getSaveSlots(currentUser.username, 'story');
        setSaveSlots(slots);
    }, [currentUser]);

    // Parse LLM Response for Tags
    const parseResponse = useCallback((content) => {
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

        // 2. Parse Affinity: [AFFINITY: role_id: value] 或 [AFFINITY: role_id value]
        // Note: This might happen multiple times or in stream, so we need to be careful.
        // For simplicity in this version, we'll parse it from the final content string.
        const affinityRegex = /\[AFFINITY:\s*(\w+):?\s*([+-]?\d+)\]/g;
        let match;
        const affinityMatches = [];
        while ((match = affinityRegex.exec(content)) !== null) {
            affinityMatches.push(match);
            const roleId = match[1];
            const value = parseInt(match[2], 10);

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
        }
        // 移除所有匹配到的 AFFINITY 标签
        affinityMatches.forEach(m => {
            cleanContent = cleanContent.replace(m[0], '');
        });

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
                        const ending = calculateEnding(statsRef.current, affinityRef.current);
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

        // 8. Parse Options: [OPTIONS: 选项1 | 选项2 | 选项3]
        const optionsMatch = content.match(/\[OPTIONS:\s*(.+?)\]/s);
        if (optionsMatch) {
            const optionsStr = optionsMatch[1];
            const options = optionsStr.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);
            if (options.length > 0) {
                setSuggestedOptions(options.slice(0, 3)); // 最多取三个选项
            }
            cleanContent = cleanContent.replace(optionsMatch[0], '');
        }

        // 9. Parse Progress: [PROGRESS: +value]
        const progressMatch = content.match(/\[PROGRESS:\s*([+-]?\d+)\]/);
        if (progressMatch) {
            const value = parseInt(progressMatch[1], 10);
            setPlotProgress(prev => Math.min(100, Math.max(0, prev + value)));
            cleanContent = cleanContent.replace(progressMatch[0], '');
        }

        return cleanContent.trim();
    }, []);

    // 简化的标签清理函数（用于流式输出时实时隐藏标签）
    const cleanTagsForDisplay = useCallback((content) => {
        return content
            .replace(/\[SCENE:\s*\w+\]/g, '')
            .replace(/\[AFFINITY:\s*\w+:?\s*[+-]?\d+\]/g, '')
            .replace(/\[UNLOCK_CG:\s*\w+\]/g, '')
            .replace(/\[CHAPTER:\s*\w+\]/g, '')
            .replace(/\[TRUST:\s*[+-]?\d+\]/g, '')
            .replace(/\[POWER:\s*[+-]?\d+\]/g, '')
            .replace(/\[RISK:\s*[+-]?\d+\]/g, '')
            .replace(/\[PROGRESS:\s*[+-]?\d+\]/g, '')
            .replace(/\[OPTIONS:\s*.+?\]/gs, '')
            .trim();
    }, []);

    const handleCommand = useCallback(async (cmd) => {
        if (loading) return;
        const userCmd = cmd || input;
        if (!userCmd.trim()) return;

        setLoading(true);
        setInput('');

        // 记录用户选择历史（用于防止选项重复）
        if (userCmd && userCmd !== "开始游戏") {
            setRecentChoices(prev => {
                const newChoices = [userCmd, ...prev].slice(0, 5); // 保留最近 5 个选择
                return newChoices;
            });
        }

        // Add user message to history (except for initial auto-start)
        if (history.length > 0 || userCmd !== "开始游戏") {
            setHistory(prev => [...prev, { role: 'user', content: userCmd }]);
        }

        try {
            let currentResponse = "";
            setStreamingContent("");
            pendingContent.current = '';

            // 节流更新函数 - 每 50ms 最多更新一次 UI，同时清理标签
            const throttledUpdate = (content) => {
                pendingContent.current = content;
                const cleanContent = cleanTagsForDisplay(content);
                const now = Date.now();
                if (now - lastUpdateTime.current >= 50) {
                    setStreamingContent(cleanContent);
                    lastUpdateTime.current = now;
                } else if (!rafId.current) {
                    rafId.current = requestAnimationFrame(() => {
                        setStreamingContent(cleanTagsForDisplay(pendingContent.current));
                        lastUpdateTime.current = Date.now();
                        rafId.current = null;
                    });
                }
            };

            const result = await generateGameResponse(
                history,
                userCmd,
                stats,
                (chunk) => {
                    currentResponse += chunk;
                    throttledUpdate(currentResponse);
                },
                'story', // mode
                {
                    recentChoices: recentChoices,
                    currentStage: plotProgress,
                    currentChapter: currentChapter
                }
            );

            // 确保最后一次更新显示完整内容
            if (rafId.current) {
                cancelAnimationFrame(rafId.current);
                rafId.current = null;
            }

            // Parse tags from the final complete response
            parseResponse(result.content);
            setHistory(prev => [...prev, { role: 'assistant', content: result.content }]);
            setStreamingContent(""); // Clear streaming buffer after done
        } catch (error) {
            console.error("Game Error:", error);
            setHistory(prev => [...prev, { role: 'assistant', content: "（系统错误：无法连接到命运之轮，请稍后再试。）" }]);
        } finally {
            setLoading(false);
        }
    }, [
        loading,
        input,
        history,
        stats,
        recentChoices,
        plotProgress,
        currentChapter,
        cleanTagsForDisplay,
        parseResponse
    ]);

    // Initial game start - 使用 ref 防止 React StrictMode 重复调用
    useEffect(() => {
        if (!gameInitialized.current && history.length === 0) {
            gameInitialized.current = true;
            resetHistorySummaryCache('story');
            handleCommand("开始游戏");
        }
    }, [handleCommand, history.length]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommand();
        }
    };

    const openSaveModal = useCallback((mode) => {
        setSaveModalMode(mode);
        void refreshSaveSlots()
            .catch(() => { })
            .finally(() => setShowSaveModal(true));
    }, [refreshSaveSlots]);

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

            <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 h-screen flex items-center justify-center relative z-20">
                <LatticeBorder className="w-full max-w-4xl h-[95vh] md:h-[90vh]">

                    {/* Header / Stats - 移动端简化显示 */}
                    <div className="flex flex-col gap-2 mb-3 md:mb-6 border-b border-stone-200 pb-3 md:pb-4 shrink-0">
                        {/* 第一行：状态栏 + 进度 */}
                        <div className="flex items-center justify-between gap-2">
                            {/* 状态栏 - 移动端可水平滚动 */}
                            <div className="flex gap-2 md:gap-4 items-center flex-1 min-w-0 overflow-x-auto custom-scrollbar pb-1">
                                <StatBar icon={Heart} label="好感" value={stats.affinity} color="bg-rose-400" />
                                <StatBar icon={Shield} label="信任" value={stats.trust} color="bg-emerald-400" />
                                <StatBar icon={Crown} label="权势" value={stats.power} color="bg-amber-400" />
                                <StatBar icon={AlertTriangle} label="风险" value={stats.risk} color="bg-stone-800" />
                            </div>
                            {/* 章节和进度显示 - 移动端简化 */}
                            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-stone-100 rounded-full border border-stone-200 shrink-0 ml-2">
                                <Scroll size={12} className="text-amber-600" />
                                <span className="hidden md:inline text-xs text-stone-600 font-serif">
                                    {CHAPTERS[currentChapter]?.title || '序章'}
                                </span>
                                <div className="w-8 md:w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 transition-all duration-500"
                                        style={{ width: `${plotProgress}%` }}
                                    />
                                </div>
                                <span className="text-xs text-stone-500">{plotProgress}%</span>
                            </div>
                        </div>
                        {/* 第二行：工具栏 - 可滚动 */}
                        <div className="overflow-x-auto custom-scrollbar toolbar-scrollable pb-1 -mx-1">
                            <div className="flex gap-1 md:gap-2 items-center px-1 min-w-max">
                                {/* 用户状态 */}
                                {currentUser ? (
                                    <>
                                        <span className="text-xs text-stone-500 font-serif hidden md:inline shrink-0">
                                            {currentUser.username}
                                        </span>
                                        <button
                                            onClick={() => { logout(); setCurrentUser(null); }}
                                            className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                            title="退出登录"
                                        >
                                            <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="px-2 py-1 md:px-3 md:py-1.5 bg-stone-800 text-stone-50 rounded-sm text-xs font-serif hover:bg-stone-700 transition-colors flex items-center gap-1 shrink-0"
                                    >
                                        <User size={14} />
                                        <span className="hidden sm:inline">登录</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowProfile(true)}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                    title="人物志"
                                >
                                    <BookOpen size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                <button
                                    onClick={() => setShowGallery(true)}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                    title="珍藏画卷"
                                >
                                    <ImageIcon size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                <button
                                    onClick={() => setShowSettingsModal(true)}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                    title="API 设置"
                                >
                                    <Settings size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                {/* 游戏设置按钮 */}
                                <button
                                    onClick={() => setShowGameSettingsModal(true)}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                    title="游戏设置"
                                >
                                    <Gamepad2 size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                {/* 历史记录按钮 */}
                                <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600 touch-target shrink-0"
                                    title="对话回顾"
                                >
                                    <History size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                {/* 存档/读档按钮 */}
                                <button
                                    onClick={() => {
                                        if (!currentUser) {
                                            setShowAuthModal(true);
                                            return;
                                        }
                                        openSaveModal('save');
                                    }}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors touch-target shrink-0"
                                    title="存档"
                                >
                                    <Save size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!currentUser) {
                                            setShowAuthModal(true);
                                            return;
                                        }
                                        openSaveModal('load');
                                    }}
                                    className="p-1.5 md:p-2 hover:bg-stone-100 rounded-full transition-colors touch-target shrink-0"
                                    title="读档"
                                >
                                    <RotateCcw size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                            </div>
                        </div>
                        {/* 移动端滑动指示条 */}
                        <div className="md:hidden flex justify-center mt-1">
                            <div className="w-12 h-1 bg-stone-300 rounded-full opacity-60"></div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 overflow-y-auto pr-4 custom-scrollbar mb-4 ${getFontSizeClass(gameSettings.fontSize)}`} ref={scrollRef}>
                        {history.map((msg, idx) => {
                            const displayContent = msg.role === 'assistant'
                                ? cleanTagsForDisplay(msg.content)
                                : msg.content;
                            return <ChatMessage key={idx} role={msg.role} content={displayContent} />;
                        })}
                        {loading && streamingContent && (
                            <ChatMessage role="assistant" content={streamingContent} />
                        )}
                        {loading && !streamingContent && (
                            <div className="flex justify-center items-center p-4 text-stone-400">
                                <Loader2 className="animate-spin mr-2" /> 命运推演中...
                            </div>
                        )}

                        {/* 选项区域 - 在对话流中显示，仅在不loading时显示 */}
                        {!loading && suggestedOptions.length > 0 && (
                            <div className="mt-4 mb-2">
                                <div className="flex items-center gap-2 mb-3 text-stone-500">
                                    <Zap size={16} className="text-amber-500" />
                                    <span className="text-sm font-serif">你可以选择：</span>
                                </div>
                                <div className="grid gap-2">
                                    {suggestedOptions.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleCommand(option)}
                                            className="w-full text-left bg-gradient-to-r from-stone-50 to-stone-100 hover:from-stone-100 hover:to-stone-200 border border-stone-200 hover:border-stone-300 rounded-lg py-3 px-4 font-serif text-stone-700 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-800 text-stone-50 flex items-center justify-center text-xs font-bold group-hover:bg-amber-600 transition-colors">
                                                    {idx + 1}
                                                </span>
                                                <span className="flex-1">{option}</span>
                                                <Zap size={14} className="text-stone-400 group-hover:text-amber-500 transition-colors" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area - 简洁的自由输入框 */}
                    <div className="shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="或者输入你自己的行动..."
                                disabled={loading}
                                className="w-full bg-white/80 border border-stone-300 rounded-sm py-3 px-4 pr-12 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-all font-serif placeholder:text-stone-400"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {/* 发送按钮 */}
                                <button
                                    onClick={() => handleCommand()}
                                    disabled={loading || !input.trim()}
                                    className="p-2 text-stone-500 hover:text-stone-800 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                </LatticeBorder >
            </div >

            {/* 登录/注册弹窗 */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onSuccess={async (user) => {
                    setCurrentUser(user);
                    // 自动加载最新存档
                    try {
                        const result = await getLatestSave(user.username, 'story');
                        if (result.success && result.exists && result.gameState) {
                            const gs = result.gameState;
                            if (gs.stats) setStats(gs.stats);
                            if (gs.history) setHistory(gs.history);
                            if (gs.currentScene) setCurrentScene(gs.currentScene);
                            if (gs.currentChapter) setCurrentChapter(gs.currentChapter);
                            if (gs.detailedAffinity) setDetailedAffinity(gs.detailedAffinity);
                            if (gs.unlockedCGs) setUnlockedCGs(gs.unlockedCGs);
                            gameInitialized.current = true;
                        }
                    } catch (error) {
                        console.error('自动加载存档失败:', error);
                    }
                }}
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
                    if (gameState.currentScene) setCurrentScene(gameState.currentScene);
                    if (gameState.currentChapter) setCurrentChapter(gameState.currentChapter);
                    if (gameState.detailedAffinity) setDetailedAffinity(gameState.detailedAffinity);
                    if (gameState.unlockedCGs) setUnlockedCGs(gameState.unlockedCGs);
                }}
                gameMode="story"
                slots={saveSlots}
                onRefresh={refreshSaveSlots}
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
            {showSettingsModal && (
                <SettingsModal
                    isOpen={showSettingsModal}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}

            {/* 游戏设置弹窗 */}
            {showGameSettingsModal && (
                <GameSettingsModal
                    isOpen={showGameSettingsModal}
                    onClose={() => setShowGameSettingsModal(false)}
                    onSettingsChange={(newSettings) => setGameSettings(newSettings)}
                />
            )}

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
        </div >
    );
}

