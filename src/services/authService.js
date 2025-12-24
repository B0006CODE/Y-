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
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
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
    if (!username || username.length < 2) {
        return { success: false, message: '用户名至少需要2个字符' };
    }
    if (!password || password.length < 4) {
        return { success: false, message: '密码至少需要4个字符' };
    }

    const users = getUsers();

    if (users[username]) {
        return { success: false, message: '该用户名已被注册' };
    }

    const user = {
        username,
        passwordHash: simpleHash(password),
        createdAt: new Date().toISOString()
    };

    users[username] = user;
    saveUsers(users);

    // 自动登录
    const safeUser = { username, createdAt: user.createdAt };
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
    if (!username || !password) {
        return { success: false, message: '请输入用户名和密码' };
    }

    const users = getUsers();
    const user = users[username];

    if (!user) {
        return { success: false, message: '用户不存在' };
    }

    if (user.passwordHash !== simpleHash(password)) {
        return { success: false, message: '密码错误' };
    }

    const safeUser = { username, createdAt: user.createdAt };
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
