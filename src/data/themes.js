/**
 * THEME SYSTEM
 * Contains all visual themes and their configurations
 * @module data/themes
 */

export const THEMES = {
    // Theme 1: Rainbow Paradise - Bright, cheerful, innocent
    rainbow_paradise: {
        id: 'rainbow_paradise',
        name: 'Rainbow Paradise',

        // Color scheme - soft pastels
        colors: {
            bg: '#fff5f8',              // Very light pink background
            ui: '#ffe6f0',              // Light pink UI
            uiBorder: '#ffb3d9',        // Pink border
            text: '#5a3a5a',            // Soft purple text
            accent: '#ff69b4',          // Hot pink accent
            accent2: '#87ceeb',         // Sky blue
            accent3: '#98fb98',         // Pale green
            warn: '#ffd700',            // Gold
            err: '#ff69b4',             // Pink (even errors are cute!)
            particle: ['#ff69b4', '#87ceeb', '#98fb98', '#ffd700', '#dda0dd']
        },

        // Fonts - rounded and friendly
        fonts: {
            s: "18px 'Comic Sans MS', 'Chalkboard SE', cursive",
            m: "24px 'Comic Sans MS', 'Chalkboard SE', cursive",
            l: "36px 'Comic Sans MS', 'Chalkboard SE', cursive",
            xl: "52px 'Comic Sans MS', 'Chalkboard SE', cursive"
        },

        // Currency
        currency: {
            name: 'Sparkles',
            symbol: '✨',
            clickName: 'Rainbow'
        },

        // Main button
        button: {
            text: 'CLICK ME!',
            emoji: '🌈',
            gradient: ['#ff69b4', '#87ceeb', '#98fb98']
        },

        // Upgrades for this theme
        upgrades: [
            { id: 'r1', name: '🦄 Unicorn Friend', baseCost: 15, type: 'auto', val: 1, desc: '+1 ✨/sec' },
            { id: 'r2', name: '🌟 Magic Wand', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'r3', name: '🏰 Cloud Castle', baseCost: 250, type: 'auto', val: 10, desc: '+10 ✨/sec' },
            { id: 'r4', name: '🧁 Cupcake Bakery', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'r5', name: '🌈 Rainbow Factory', baseCost: 5000, type: 'auto', val: 80, desc: '+80 ✨/sec' },
            { id: 'r6', name: '🎠 Carousel of Dreams', baseCost: 20000, type: 'auto', val: 300, desc: '+300 ✨/sec' },
            { id: 'r7', name: '⭐ Shooting Star', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K ✨/sec' },
            { id: 'r8', name: '🎪 Circus Maximus', baseCost: 1000000, type: 'auto', val: 10000, desc: 'ULTIMATE FUN!' },
        ],

        // UI Elements (fake background)
        fakeUI: [
            { text: '🎮 Super Fun Games!', color: '#ffe6f0' },
            { text: '🎨 Color Paradise', color: '#ffe6f0' },
            { text: '🎵 Music World', color: '#ffe6f0' },
            { text: '🎪 Carnival Zone', color: '#ffe6f0' },
            { text: '🎭 Theater Magic', color: '#ffe6f0' },
            { text: '🎡 Wonder Wheel', color: '#ffe6f0' },
            { text: '🎢 Joy Ride', color: '#ffe6f0' },
            { text: '🎠 Merry-Go-Round', color: '#ffe6f0' }
        ],

        // Progress bar text
        progressBar: {
            label: 'HAPPINESS LEVEL',
            color: '#ff69b4',
            bgColor: '#ffe6f0'
        },

        // Overlay text
        startText: 'CLICK TO START THE FUN! 🌈',

        // Particle settings
        particles: {
            emoji: ['✨', '⭐', '💫', '🌟', '💖', '🦄', '🌈'],
            useEmoji: true
        }
    },



    // Theme 1.5: Ad Purgatory - Annoying, flashy, spammy
    ad_purgatory: {
        id: 'ad_purgatory',
        name: 'Ad Purgatory',

        colors: {
            bg: '#ffff00',              // Painful yellow
            ui: '#00ff00',              // Acid green
            uiBorder: '#ff0000',        // Red
            text: '#0000ff',            // Blue
            accent: '#ff00ff',          // Magenta
            accent2: '#ffaa00',
            accent3: '#00aaaa',
            warn: '#ff0000',
            err: '#000000',
            particle: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        },

        fonts: {
            s: "14px 'Arial Black', sans-serif",
            m: "20px 'Arial Black', sans-serif",
            l: "30px 'Arial Black', sans-serif",
            xl: "40px 'Arial Black', sans-serif"
        },

        currency: {
            name: 'Credits',
            symbol: '©',
            clickName: 'View'
        },

        button: {
            text: 'DOWNLOAD',
            emoji: '⬇️',
            gradient: ['#ff0000', '#ffff00', '#00ff00']
        },

        upgrades: [
            { id: 'a1', name: 'Pop-up Blocker', baseCost: 15, type: 'auto', val: 1, desc: '+1 ©/sec' },
            { id: 'a2', name: 'Skip Intro', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'a3', name: 'Premium Account', baseCost: 250, type: 'auto', val: 10, desc: '+10 ©/sec' },
            { id: 'a4', name: 'VPN Service', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'a5', name: 'Affiliate Link', baseCost: 5000, type: 'auto', val: 80, desc: '+80 ©/sec' },
            { id: 'a6', name: 'Data Mining', baseCost: 20000, type: 'auto', val: 300, desc: '+300 ©/sec' },
            { id: 'a7', name: 'Influencer Deal', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K ©/sec' },
            { id: 'a8', name: 'Viral Marketing', baseCost: 1000000, type: 'auto', val: 10000, desc: 'SPAM EVERYONE' },
        ],

        fakeUI: [
            { text: 'WIN IPHONE 99!', color: '#ff0000' },
            { text: 'HOT SINGLES NEAR YOU', color: '#ff00ff' },
            { text: 'DOWNLOAD RAM', color: '#00ff00' },
            { text: 'YOU ARE THE 1000th VISITOR', color: '#0000ff' },
            { text: 'DOCTORS HATE HIM', color: '#ffff00' },
            { text: 'MAKE $$$ FAST', color: '#00ffff' },
            { text: 'CLICK TO CLAIM', color: '#ffaa00' }
        ],

        progressBar: {
            label: 'AD LOAD...',
            color: '#ffff00',
            bgColor: '#ff0000'
        },

        startText: 'WATCH AD TO START',

        particles: {
            emoji: ['💲', '💸', '🤑', '💾', '💿'],
            useEmoji: true
        }
    },

    // Theme 2: Digital Decay (Existing - Keeping ID for compatibility but logic changes later)
    digital_decay: {
        id: 'digital_decay',
        name: 'Digital Decay',

        colors: {
            bg: '#0a0a0a',
            ui: '#1a1a1a',
            uiBorder: '#333',
            text: '#eee',
            accent: '#0f0',
            accent2: '#0ff',
            accent3: '#f0f',
            warn: '#ffaa00',
            err: '#ff0033',
            particle: ['#0f0', '#0ff', '#f0f', '#ff0', '#fff']
        },

        fonts: {
            s: "16px 'VT323', monospace",
            m: "22px 'VT323', monospace",
            l: "32px 'VT323', monospace",
            xl: "48px 'VT323', monospace"
        },

        currency: {
            name: 'Bytes',
            symbol: 'B',
            clickName: 'Data'
        },

        button: {
            text: 'HACK',
            emoji: '💀',
            gradient: ['#2f2', '#050']
        },

        upgrades: [
            { id: 'u1', name: 'Script_Kiddie.js', baseCost: 15, type: 'auto', val: 1, desc: '+1 B/sec' },
            { id: 'u2', name: 'Keyboard_Macro', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'u3', name: 'SQL_Injection', baseCost: 250, type: 'auto', val: 10, desc: '+10 B/sec' },
            { id: 'u4', name: 'Trojan_Horse.rar', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'u5', name: 'Botnet_Node', baseCost: 5000, type: 'auto', val: 80, desc: '+80 B/sec' },
            { id: 'u6', name: 'Ransomware.exe', baseCost: 20000, type: 'auto', val: 300, desc: '+300 B/sec' },
            { id: 'u7', name: 'AI_Core_Alpha', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5KB/sec' },
            { id: 'u8', name: 'The_Deep_Web', baseCost: 1000000, type: 'auto', val: 10000, desc: 'UNLOCK DARK DATA' },
        ],

        fakeUI: [
            { text: 'Minecraft 2', color: '#222' },
            { text: 'Hot Dog.io', color: '#222' },
            { text: 'Clicker Pro', color: '#222' },
            { text: 'Zombie Def', color: '#222' },
            { text: 'Car Sim 3D', color: '#222' },
            { text: 'Battle Royale', color: '#222' },
            { text: 'Idle Tycoon', color: '#222' },
            { text: 'Puzzle Quest', color: '#222' }
        ],

        progressBar: {
            label: 'SYSTEM INTEGRITY',
            color: '#f00',
            bgColor: '#333',
            invert: true
        },

        startText: 'CLICK TO INJECT VIRUS',

        particles: {
            emoji: [],
            useEmoji: false
        }
    },

    // Theme 3: Legacy System - Retro, DOS, BIOS
    legacy_system: {
        id: 'legacy_system',
        name: 'Legacy System',

        colors: {
            bg: '#000084',              // BIOS Blue
            ui: '#aaaaaa',              // Win95 Grey
            uiBorder: '#ffffff',        // White
            text: '#ffffff',            // White
            accent: '#00ff00',          // Terminal Green
            accent2: '#ffff00',
            accent3: '#000000',
            warn: '#ff0000',
            err: '#000084',
            particle: ['#ffffff', '#aaaaaa', '#000000', '#00ff00']
        },

        fonts: {
            s: "14px 'Courier New', monospace",
            m: "18px 'Courier New', monospace",
            l: "24px 'Courier New', monospace",
            xl: "32px 'Courier New', monospace"
        },

        currency: {
            name: 'KB',
            symbol: 'KB',
            clickName: 'Data'
        },

        button: {
            text: 'EXECUTE',
            emoji: '💾',
            gradient: ['#aaaaaa', '#555555'] // Grey button
        },

        upgrades: [
            { id: 'l1', name: '5.25" Floppy', baseCost: 15, type: 'auto', val: 1, desc: '+1 KB/sec' },
            { id: 'l2', name: 'Ball Mouse', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'l3', name: '56k Modem', baseCost: 250, type: 'auto', val: 10, desc: '+10 KB/sec' },
            { id: 'l4', name: 'Turbo Button', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'l5', name: 'CRT Monitor', baseCost: 5000, type: 'auto', val: 80, desc: '+80 KB/sec' },
            { id: 'l6', name: 'Sound Blaster', baseCost: 20000, type: 'auto', val: 300, desc: '+300 KB/sec' },
            { id: 'l7', name: 'DOS 6.22', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5MB/sec' },
            { id: 'l8', name: 'Format C:', baseCost: 1000000, type: 'auto', val: 10000, desc: 'DELETE EVERYTHING' },
        ],

        fakeUI: [
            { text: 'A:\\>', color: '#fff' },
            { text: 'C:\\>', color: '#fff' },
            { text: 'AUTOEXEC.BAT', color: '#fff' },
            { text: 'CONFIG.SYS', color: '#fff' },
            { text: 'HIMEM.SYS', color: '#fff' },
            { text: 'QBASIC.EXE', color: '#fff' }
        ],

        progressBar: {
            label: 'MEMORY CHECK',
            color: '#fff',
            bgColor: '#000084'
        },

        startText: 'PRESS ANY KEY',

        particles: {
            emoji: ['█', '▓', '▒', '░'], // ASCII art
            useEmoji: true
        }
    },

    // Theme 4: The Null Void - White, Empty, Wireframe
    null_void: {
        id: 'null_void',
        name: 'The Null Void',

        colors: {
            bg: '#ffffff',
            ui: '#ffffff',
            uiBorder: '#000000',        // Black outlines
            text: '#000000',
            accent: '#000000',
            accent2: '#cccccc',
            accent3: '#eeeeee',
            warn: '#000000',
            err: '#000000',
            particle: ['#000000']
        },

        fonts: {
            s: "14px 'Times New Roman', serif",
            m: "20px 'Times New Roman', serif",
            l: "30px 'Times New Roman', serif",
            xl: "40px 'Times New Roman', serif"
        },

        currency: {
            name: 'Null',
            symbol: '∅',
            clickName: 'Void'
        },

        button: {
            text: 'EXIST',
            emoji: '👁️',
            gradient: ['#ffffff', '#dddddd'] // Subtle off-white
        },

        upgrades: [
            { id: 'n1', name: '[REDACTED]', baseCost: 15, type: 'auto', val: 1, desc: '...' },
            { id: 'n2', name: 'Null Pointer', baseCost: 50, type: 'click', val: 2, desc: 'Dereference' },
            { id: 'n3', name: 'Void Stare', baseCost: 250, type: 'auto', val: 10, desc: 'It stares back' },
            { id: 'n4', name: 'Undefined', baseCost: 1000, type: 'click', val: 15, desc: 'NaN' },
            { id: 'n5', name: 'Entropy', baseCost: 5000, type: 'auto', val: 80, desc: 'Chaos' },
            { id: 'n6', name: 'Event Horizon', baseCost: 20000, type: 'auto', val: 300, desc: 'No Return' },
            { id: 'n7', name: 'Singularity', baseCost: 100000, type: 'auto', val: 1500, desc: 'Infinite' },
            { id: 'n8', name: 'The End', baseCost: 1000000, type: 'auto', val: 10000, desc: 'Goodbye' },
        ],

        fakeUI: [], // No fake UI in the void

        progressBar: {
            label: 'REALITY FAILURE',
            color: '#000000',
            bgColor: '#ffffff',
            invert: true
        },

        startText: '...',

        particles: {
            emoji: [],
            useEmoji: false
        }
    }
};

/**
 * Helper to get current theme
 * @param {string} themeId 
 * @returns {Object}
 */
export function getTheme(themeId) {
    return THEMES[themeId] || THEMES.rainbow_paradise;
}
