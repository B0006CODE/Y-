import { useState } from 'react';
import { User, Lock, LogIn, UserPlus, X, Loader2 } from 'lucide-react';
import { login, register } from '../services/authService';

/**
 * 登录/注册弹窗组件
 */
export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;

            if (mode === 'register') {
                if (password !== confirmPassword) {
                    setError('两次输入的密码不一致');
                    setLoading(false);
                    return;
                }
                result = register(username, password);
            } else {
                result = login(username, password);
            }

            if (result.success) {
                onSuccess(result.user);
                onClose();
                // 重置表单
                setUsername('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* 背景遮罩 */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* 弹窗内容 */}
            <div className="relative bg-stone-50 border-2 border-stone-300 rounded-sm shadow-2xl w-full max-w-md mx-2 sm:mx-4 overflow-hidden">
                {/* 装饰边角 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-stone-800 pointer-events-none" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-stone-800 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-stone-800 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-stone-800 pointer-events-none" />

                {/* 关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors z-20"
                >
                    <X size={20} />
                </button>

                <div className="p-6 sm:p-8">
                    {/* 标题 */}
                    <h2 className="text-xl sm:text-2xl font-serif text-center text-stone-800 mb-4 sm:mb-6">
                        {mode === 'login' ? '登录' : '注册'}
                    </h2>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* 用户名 */}
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="请输入用户名"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-serif"
                            />
                        </div>

                        {/* 密码 */}
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="请输入密码"
                                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-serif"
                            />
                        </div>

                        {/* 确认密码（仅注册） */}
                        {mode === 'register' && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="请确认密码"
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-sm focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 font-serif"
                                />
                            </div>
                        )}

                        {/* 错误提示 */}
                        {error && (
                            <div className="text-rose-600 text-sm text-center font-serif">
                                {error}
                            </div>
                        )}

                        {/* 提交按钮 */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-stone-800 text-stone-50 rounded-sm hover:bg-stone-700 transition-colors font-serif flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : mode === 'login' ? (
                                <>
                                    <LogIn size={18} />
                                    登录
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    注册
                                </>
                            )}
                        </button>
                    </form>

                    {/* 切换登录/注册 */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={switchMode}
                            className="text-stone-500 hover:text-stone-800 font-serif text-sm transition-colors"
                        >
                            {mode === 'login' ? '还没有账号？点击注册' : '已有账号？点击登录'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
