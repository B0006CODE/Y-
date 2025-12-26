const SETTINGS_KEY = 'ancient_love_game_settings';

export const DEFAULT_GAME_SETTINGS = {
    fontSize: 'medium',
    textSpeed: 'normal',
    autoPlay: false,
    autoPlayDelay: 3,
    soundEnabled: true,
    musicEnabled: true,
    musicVolume: 70,
    sfxVolume: 80
};

const safeParse = (value, fallback) => {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

export const getGameSettings = () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
        return { ...DEFAULT_GAME_SETTINGS, ...safeParse(saved, {}) };
    }
    return DEFAULT_GAME_SETTINGS;
};

export const saveGameSettings = (settings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getFontSizeClass = (size) => {
    switch (size) {
        case 'small':
            return 'text-base';
        case 'large':
            return 'text-xl';
        default:
            return 'text-lg';
    }
};
