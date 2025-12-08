/**
 * THEME SYSTEM
 * Contains all visual themes and their configurations
 */

const THEMES = {
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

    // Theme 2: Digital Decay - Dark, glitchy, hacker
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
            invert: true  // Show as decreasing
        },

        startText: 'CLICK TO INJECT VIRUS',

        particles: {
            emoji: [],
            useEmoji: false
        }
    }
};

// Helper to get current theme
function getTheme(themeId) {
    return THEMES[themeId] || THEMES.rainbow_paradise;
}
