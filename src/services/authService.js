/**
 * 用户认证服务
 * 使用 LocalStorage 存储用户信息
 */

const USERS_KEY = 'ancient_love_users';
const CURRENT_USER_KEY = 'ancient_love_current_user';

/**
 * 简单哈希函数（非加密安全，仅用于本地演示）
 */
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
};

/**
 * 获取所有用户
 */
const getUsers = () => {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        if (!usersJson) return {};
        const parsed = JSON.parse(usersJson);
        // 确保返回的是对象
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
        console.error('读取用户数据失败:', e);
        return {};
    }
};

/**
 * 保存用户列表
 */
const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {{ success: boolean, message: string, user?: object }}
 */
export const register = (username, password) => {
    // 去除用户名前后空格
    const trimmedUsername = username ? username.trim() : '';

    if (!trimmedUsername || trimmedUsername.length < 2) {
        return { success: false, message: '用户名至少需要2个字符' };
    }
    if (!password || password.length < 4) {
        return { success: false, message: '密码至少需要4个字符' };
    }

    const users = getUsers();

    if (users[trimmedUsername]) {
        return { success: false, message: '该用户名已被注册' };
    }

    const user = {
        username: trimmedUsername,
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString()
    };

    users[trimmedUsername] = user;
    saveUsers(users);

    // 自动登录
    const safeUser = { username: trimmedUsername, createdAt: user.createdAt };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { success: true, message: '注册成功', user: safeUser };
};

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {{ success: boolean, message: string, user?: object }}
 */
export const login = (username, password) => {
    // 去除用户名前后空格
    const trimmedUsername = username ? username.trim() : '';

    if (!trimmedUsername || !password) {
        return { success: false, message: '请输入用户名和密码' };
    }

    const users = getUsers();
    const user = users[trimmedUsername];

    if (!user) {
        console.log('登录失败: 用户不存在', { 输入的用户名: trimmedUsername, 已注册用户: Object.keys(users) });
        return { success: false, message: '用户不存在' };
    }

    if (user.passwordHash !== simpleHash(password)) {
        return { success: false, message: '密码错误' };
    }

    const safeUser = { username: trimmedUsername, createdAt: user.createdAt };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { success: true, message: '登录成功', user: safeUser };
};

/**
 * 退出登录
 */
export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * 获取当前登录用户
 * @returns {object|null}
 */
export const getCurrentUser = () => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
};

/**
 * 检查是否已登录
 * @returns {boolean}
 */
export const isLoggedIn = () => {
    return getCurrentUser() !== null;
};
