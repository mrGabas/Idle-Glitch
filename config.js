/**
 * CONFIGURATION AND UTILITIES
 */

// --- CONFIGURATION ---
const CFG = {
    cols: {
        bg: '#0a0a0a',
        ui: '#1a1a1a',
        uiBorder: '#333',
        text: '#eee',
        accent: '#0f0',
        warn: '#ffaa00',
        err: '#ff0033',
        glitch: ['#f0f', '#0ff', '#ff0', '#fff']
    },
    fonts: {
        s: "16px 'VT323', monospace",
        m: "22px 'VT323', monospace",
        l: "32px 'VT323', monospace",
        xl: "48px 'VT323', monospace"
    }
};

const UTILS = {
    rand: (min, max) => Math.random() * (max - min) + min,
    randInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    randArr: (arr) => arr[Math.floor(Math.random() * arr.length)],
    fmt: (num) => {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'GB';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'MB';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'KB';
        return Math.floor(num) + ' B';
    },
    // Zalgo text generator
    corrupt: (text, level) => {
        if (level <= 0) return text;
        const chars = "$%#@&!*^~?[]{}><";
        return text.split('').map(c => Math.random() < level ? chars[Math.floor(Math.random() * chars.length)] : c).join('');
    }
};

// --- GAME DATA ---
const UPGRADES_DB = [
    { id: 'u1', name: 'Script_Kiddie.js', baseCost: 15, type: 'auto', val: 1, desc: '+1 B/sec' },
    { id: 'u2', name: 'Keyboard_Macro', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
    { id: 'u3', name: 'SQL_Injection', baseCost: 250, type: 'auto', val: 10, desc: '+10 B/sec' },
    { id: 'u4', name: 'Trojan_Horse.rar', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
    { id: 'u5', name: 'Botnet_Node', baseCost: 5000, type: 'auto', val: 80, desc: '+80 B/sec' },
    { id: 'u6', name: 'Ransomware.exe', baseCost: 20000, type: 'auto', val: 300, desc: '+300 B/sec' },
    { id: 'u7', name: 'AI_Core_Alpha', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5KB/sec' },
    { id: 'u8', name: 'The_Deep_Web', baseCost: 1000000, type: 'auto', val: 10000, desc: 'UNLOCK DARK DATA' },
];
