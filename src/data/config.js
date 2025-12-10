/**
 * Game Configuration & Constants
 * @module data/config
 */

export const CFG = {
    // Game Loop
    FPS: 60,

    // Grid / Layout
    GRID_SIZE: 32,

    // Progression / Economy
    BASE_CLICK_POWER: 1,
    BASE_AUTO_RATE: 0,

    // Corruption & Glitches
    CORRUPTION_MAX: 100,
    GLITCH_INTENSITY_BASE: 0.1,

    // Physics / Visuals
    PARTICLE_LIFE_DEFAULT: 1.0,
    GRAVITY: 0.5,

    // Timings
    AUTOSAVE_INTERVAL: 30000, // 30s
    OFFLINE_PROGRESS_MIN_TIME: 60, // 60s

    // Colors
    COLORS: {
        WHITE: '#FFFFFF',
        BLACK: '#000000',
        ERROR: '#FF0000',
        SUCCESS: '#00FF00',
        ACCENT_DEFAULT: '#00FFFF'
    }
};

export const UTILS = {
    fmt: (n) => {
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
        return Math.floor(n).toString();
    },
    clamp: (num, min, max) => Math.min(Math.max(num, min), max),
    rand: (min, max) => Math.random() * (max - min) + min,
    randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
};
