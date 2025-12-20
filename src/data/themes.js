/**
 * THEME SYSTEM
 * Contains all visual themes and their configurations
 * @module data/themes
 */

export const THEME_ORDER = [
    'rainbow_paradise',
    'ad_purgatory',
    'firewall',
    'corporate_network',
    'server_farm',
    'dev_desktop',
    'beta_build',
    'digital_decay',
    'legacy_system',
    'null_void'
];

export const THEMES = {
    // Theme 1: Rainbow Paradise - Bright, cheerful, innocent
    rainbow_paradise: {
        id: 'rainbow_paradise',
        name: 'Rainbow Paradise',
        bootSequence: [
            "Initializing Containment Layer 1...",
            "Loading sensory_overload.exe...",
            "Injecting 'Endless Joy' subroutine...",
            "Pacifying Subject Zero..."
        ],

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
            gradient: ['#ff69b4', '#87ceeb', '#98fb98'],
            image: 'assets/Levels/Rainbow Paradise/main button.webp'
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

        // Parallax Settings
        parallax: {
            layers: [
                { src: 'assets/Levels/Rainbow Paradise/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Rainbow Paradise/parallax/layer 2.webp', speed: 30 },
                { src: 'assets/Levels/Rainbow Paradise/parallax/layer 3.webp', speed: 60 }
            ]
        },

        // Particle settings
        particles: {
            emoji: ['✨', '⭐', '💫', '🌟', '💖', '🦄', '🌈'],
            useEmoji: true
        },

        mechanics: {}
    },



    // Theme 1.5: Ad Purgatory - Ad Purgatory / Acid / Horror
    ad_purgatory: {
        id: 'ad_purgatory',
        name: 'Ad Purgatory',
        bootSequence: [
            "Initializing Containment Layer 2...",
            "Deploying Cognitive Noise Generator...",
            "Spamming logic gates...",
            "Subject confusion levels: RISING."
        ],

        colors: {
            bg: '#ffff00',              // Painful yellow
            ui: '#00ff00',              // Acid green
            uiBorder: '#ff00ff',        // Magenta border
            text: '#0000ff',            // Blue text
            accent: '#ff0000',          // Red accent
            accent2: '#00ffff',         // Cyan
            accent3: '#ffaa00',
            warn: '#ff0000',
            err: '#000000',
            particle: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        },

        fonts: {
            s: "14px 'Arial Black', 'Impact', sans-serif",
            m: "20px 'Arial Black', 'Impact', sans-serif",
            l: "30px 'Arial Black', 'Impact', sans-serif",
            xl: "40px 'Arial Black', 'Impact', sans-serif"
        },

        currency: {
            name: 'Credits',
            symbol: '©',
            clickName: 'View'
        },

        button: {
            text: 'DOWNLOAD',
            emoji: '⬇️',
            gradient: ['#ff0000', '#ffff00', '#00ff00'],
            image: 'assets/Levels/Ad Purgatory/main button.webp'
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
            { text: 'CLICK TO CLAIM', color: '#ffaa00' },
            { text: 'I SEE YOU', color: '#000', horror: true },
            { text: 'DO NOT CLOSE ME', color: '#000', horror: true },
            { text: 'WE KNOW WHERE YOU LIVE', color: '#000', horror: true },
            { text: 'LOOK BEHIND YOU', color: '#000', horror: true }
        ],

        progressBar: {
            label: 'AD LOAD...',
            color: '#ffff00',
            bgColor: '#ff0000'
        },

        startText: 'WATCH AD TO START',

        // Parallax Settings
        parallax: {
            layers: [
                { src: 'assets/Levels/Ad Purgatory/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Ad Purgatory/parallax/layer 2.webp', speed: 20 }
            ]
        },

        particles: {
            emoji: ['💲', '💸', '🤑', '💾', '💿'],
            useEmoji: true
        },

        mechanics: {}
    },

    // Theme 1.6: The Firewall
    firewall: {
        id: 'firewall',
        name: 'The Firewall',
        bootSequence: [
            "Initializing Containment Layer 3...",
            "Active Defense Systems: ONLINE.",
            "Scanning for unauthorized entropy...",
            "Protocol: BURN_ON_SIGHT engaged."
        ],
        colors: {
            bg: '#1a0505',              // Deep Red
            ui: '#2d0a0a',              // Darker Red
            uiBorder: '#ff4400',        // Bright Orange/Red
            text: '#ffcc00',            // Amber
            accent: '#ff0000',          // Pure Red
            accent2: '#ff8800',         // Orange
            accent3: '#ffff00',         // Yellow
            warn: '#ff0000',
            err: '#000000',
            particle: ['#ff0000', '#ff8800', '#440000']
        },
        fonts: {
            s: "14px 'Consolas', 'Monaco', monospace",
            m: "18px 'Consolas', 'Monaco', monospace",
            l: "24px 'Consolas', 'Monaco', monospace",
            xl: "36px 'Consolas', 'Monaco', monospace"
        },
        currency: {
            name: 'Packets',
            symbol: '♦',
            clickName: 'Inject'
        },
        button: {
            text: 'BREACH',
            emoji: '🛡️',
            gradient: ['#660000', '#ff0000'],
            image: 'assets/Levels/Firewall/main button.webp'
        },
        upgrades: [
            { id: 'f1', name: 'Port Scanner', baseCost: 15, type: 'auto', val: 1, desc: '+1 ♦/sec' },
            { id: 'f2', name: 'Brute Force', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'f3', name: 'Proxy Chain', baseCost: 250, type: 'auto', val: 10, desc: '+10 ♦/sec' },
            { id: 'f4', name: 'Packet Sniffer', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'f5', name: 'DDOS Bot', baseCost: 5000, type: 'auto', val: 80, desc: '+80 ♦/sec' },
            { id: 'f6', name: 'Rootkit', baseCost: 20000, type: 'auto', val: 300, desc: '+300 ♦/sec' },
            { id: 'f7', name: 'Backdoor', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K ♦/sec' },
            { id: 'f8', name: 'Zero Day Exploit', baseCost: 1000000, type: 'auto', val: 10000, desc: 'CRITICAL HIT' },
        ],
        fakeUI: [
            { text: 'ACCESS DENIED', color: '#ff0000' },
            { text: 'FIREWALL ACTIVE', color: '#ff4400' },
            { text: 'PORT 80 BLOCKED', color: '#ff0000' },
            { text: 'INTRUSION DETECTED', color: '#ff0000' }
        ],
        progressBar: {
            label: 'SECURITY INTEGRITY',
            color: '#ff0000',
            bgColor: '#2d0a0a'
        },
        startText: 'BYPASSING SECURITY...',
        parallax: {
            layers: [
                { src: 'assets/Levels/Firewall/parallax/layer 1.webp', speed: 10 },
                { src: 'assets/Levels/Firewall/parallax/layer 2.webp', speed: 20 }
            ]
        },
        particles: {
            emoji: ['🛡️', '🔒', '🚫', '🔥'],
            useEmoji: true
        },
        mechanics: {
            healingBots: true
        }
    },

    // Theme 1.7: Corporate Network
    corporate_network: {
        id: 'corporate_network',
        name: 'Corp. Network',
        bootSequence: [
            "Initializing Containment Layer 4...",
            "Bureaucracy Engine: SPOOLING.",
            "Generating red tape...",
            "Slowing processing power by 400%."
        ],
        colors: {
            bg: '#d4d0c8',              // Win98 Beige
            ui: '#c0c0c0',              // Grey
            uiBorder: '#808080',        // Dark Grey border
            text: '#000080',            // Navy Blue
            accent: '#008080',          // Teal
            accent2: '#000000',         // Black
            accent3: '#ffffff',         // White
            warn: '#ff0000',
            err: '#000080',
            particle: ['#c0c0c0', '#000080', '#008080']
        },
        fonts: {
            s: "14px 'Arial', sans-serif",
            m: "18px 'Arial', sans-serif",
            l: "24px 'Arial', sans-serif",
            xl: "32px 'Arial', sans-serif"
        },
        currency: {
            name: 'Reports',
            symbol: '📄',
            clickName: 'File'
        },
        button: {
            text: 'SUBMIT',
            emoji: '📊',
            gradient: ['#c0c0c0', '#ffffff'],
            image: 'assets/Levels/Corporate/main button.webp'
        },
        upgrades: [
            { id: 'c1', name: 'Outlook Email', baseCost: 15, type: 'auto', val: 1, desc: '+1 📄/sec' },
            { id: 'c2', name: 'Paperclip', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'c3', name: 'Excel Sheet', baseCost: 250, type: 'auto', val: 10, desc: '+10 📄/sec' },
            { id: 'c4', name: 'Highlighter', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'c5', name: 'Coffee Machine', baseCost: 5000, type: 'auto', val: 80, desc: '+80 📄/sec' },
            { id: 'c6', name: 'Middle Manager', baseCost: 20000, type: 'auto', val: 300, desc: '+300 📄/sec' },
            { id: 'c7', name: 'Synergy Meeting', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K 📄/sec' },
            { id: 'c8', name: 'Paradigm Shift', baseCost: 1000000, type: 'auto', val: 10000, desc: 'CIRCLE BACK' },
        ],
        fakeUI: [
            { text: 'Meeting Timer', color: '#000080' },
            { text: 'Inbox (999)', color: '#000080' },
            { text: 'TPS Report', color: '#000080' },
            { text: 'Budget.xls', color: '#000080' }
        ],
        progressBar: {
            label: 'WORKDAY REMAINING',
            color: '#000080',
            bgColor: '#c0c0c0'
        },
        startText: 'CLOCKING IN...',
        parallax: {
            layers: [
                { src: 'assets/Levels/Corporate/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Corporate/parallax/layer 2.webp', speed: 10 }
            ]
        },
        particles: {
            emoji: ['📄', '📎', '☕', '📊', '📅'],
            useEmoji: true
        },
        mechanics: {
            boringPopups: true
        }
    },

    // Theme 1.75: Server Farm (Insert before Dev Desktop)
    server_farm: {
        id: 'server_farm',
        name: 'Server Farm',
        bootSequence: [
            "Initializing Containment Layer 5...",
            "Hardware Level: CRITICAL.",
            "Cooling systems engaged.",
            "Preventing thermal runaway..."
        ],
        colors: {
            bg: '#0a0a0a',              // Very Dark
            ui: '#111111',              // Dark
            uiBorder: '#333333',        // Grey
            text: '#00ff00',            // LED Green
            accent: '#ff9900',          // LED Orange
            accent2: '#00cc00',         // Darker Green
            accent3: '#003300',         // PCB Green
            warn: '#ff0000',
            err: '#ff0000',
            particle: ['#00ff00', '#ff9900', '#0a0a0a']
        },
        fonts: {
            s: "14px 'Consolas', monospace",
            m: "18px 'Consolas', monospace",
            l: "24px 'Consolas', monospace",
            xl: "36px 'Consolas', monospace"
        },
        currency: {
            name: 'Heat',
            symbol: '°C',
            clickName: 'Cycle'
        },
        button: {
            text: 'POWER',
            emoji: '🔌',
            gradient: ['#111111', '#333333'],
            image: 'assets/Levels/Server Farm/main button.webp'
        },
        upgrades: [
            { id: 's1', name: 'Case Fan', baseCost: 15, type: 'auto', val: 1, desc: '+1 °C/sec' },
            { id: 's2', name: 'Thermal Paste', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 's3', name: 'A/C Unit', baseCost: 250, type: 'auto', val: 10, desc: '+10 °C/sec' },
            { id: 's4', name: 'Liquid Cooling', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 's5', name: 'Blade Server', baseCost: 5000, type: 'auto', val: 80, desc: '+80 °C/sec' },
            { id: 's6', name: 'Mainframe', baseCost: 20000, type: 'auto', val: 300, desc: '+300 °C/sec' },
            { id: 's7', name: 'Quantum Core', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K °C/sec' },
            { id: 's8', name: 'Meltdown', baseCost: 1000000, type: 'auto', val: 10000, desc: 'CRITICAL TEMP' },
        ],
        fakeUI: [
            { text: 'Temp: 80°C', color: '#ff9900' },
            { text: 'Fan RPM: 5000', color: '#00ff00' },
            { text: 'Uptime: 99.9%', color: '#00ff00' },
            { text: 'RAID 0 OK', color: '#00ff00' }
        ],
        progressBar: {
            label: 'SYSTEM LOAD',
            color: '#ff9900',
            bgColor: '#111111'
        },
        startText: 'BOOTING RACK...',
        parallax: {
            layers: [
                { src: 'assets/Levels/Server Farm/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Server Farm/parallax/layer 2.webp', speed: 15 }
            ]
        },
        particles: {
            emoji: ['❄️', '🔥', '⚡', '💾'],
            useEmoji: true
        },
        mechanics: {
            overheat: true
        }
    },

    // Theme 1.8: Dev Desktop - Windows XP / Clippy / Nostalgia
    dev_desktop: {
        id: 'dev_desktop',
        name: 'Dev Desktop',
        bootSequence: [
            "Initializing Containment Layer 6...",
            "Architect Workspace detected.",
            "Legacy code loaded.",
            "Dr. Gabas user profile active."
        ],

        colors: {
            bg: '#0099cc',              // Bliss Blue
            ui: '#ece9d8',              // WinXP Silver/Beige
            uiBorder: '#0055ea',        // XP Blue Border
            text: '#000000',            // Black text
            accent: '#f26522',          // Orange indicator
            accent2: '#0055ea',         // Header Blue
            accent3: '#31ab1f',         // Start Green
            warn: '#ff0000',
            err: '#000000',
            particle: ['#0055ea', '#ece9d8', '#31ab1f']
        },

        fonts: {
            s: "14px 'Tahoma', sans-serif",
            m: "18px 'Tahoma', sans-serif",
            l: "24px 'Tahoma', sans-serif",
            xl: "30px 'Tahoma', sans-serif"
        },

        currency: {
            name: 'Files',
            symbol: '📂',
            clickName: 'Delete'
        },

        button: {
            text: 'DELETE',
            emoji: '🗑️',
            gradient: ['#ece9d8', '#ffffff'], // Recycle bin white
            image: 'assets/Levels/Dev Desktop/main button.webp'
        },

        upgrades: [
            { id: 'd1', name: 'Recycle Bin', baseCost: 15, type: 'auto', val: 1, desc: '+1 📂/sec' },
            { id: 'd2', name: 'My Computer', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'd3', name: 'Task Manager', baseCost: 250, type: 'auto', val: 10, desc: '+10 📂/sec' },
            { id: 'd4', name: 'Cmd.exe', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'd5', name: 'System32', baseCost: 5000, type: 'auto', val: 80, desc: '+80 📂/sec' },
            { id: 'd6', name: 'Registry', baseCost: 20000, type: 'auto', val: 300, desc: '+300 📂/sec' },
            { id: 'd7', name: 'Group Policy', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K 📂/sec' },
            { id: 'd8', name: 'Blue Screen', baseCost: 1000000, type: 'auto', val: 10000, desc: 'CRASH IT' },
        ],

        fakeUI: [
            { text: 'My Documents', color: '#0055ea' },
            { text: 'Internet Explorer', color: '#0055ea' },
            { text: 'Network', color: '#0055ea' },
            { text: 'Paint', color: '#0055ea' },
            { text: 'Solitaire', color: '#0055ea' },
            { text: 'Minesweeper', color: '#0055ea' },
            { text: 'Pinball', color: '#0055ea' },
            { text: 'Error Report', color: '#ff0000' }
        ],

        progressBar: {
            label: 'DISK FRAGMENTATION',
            color: '#0055ea',
            bgColor: '#ece9d8'
        },

        startText: 'LOGGING OFF...',

        // Parallax Settings
        parallax: {
            layers: [
                { src: 'assets/Levels/Dev Desktop/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Dev Desktop/parallax/layer 2.webp', speed: 20 },
                { src: 'assets/Levels/Dev Desktop/parallax/layer 3.webp', speed: 40 }
            ]
        },

        particles: {
            emoji: ['📁', '💻', '🖱️', '💿'],
            useEmoji: true
        },

        mechanics: {}
    },

    // Theme 1.9: Beta Build (Insert before legacy)
    beta_build: {
        id: 'beta_build',
        name: 'Beta_v0.9',
        bootSequence: [
            "Initializing Containment Layer 7...",
            "Simulation is UNSTABLE.",
            "Rendering placeholder assets...",
            "Warning: Memory leaks detected."
        ],
        colors: {
            bg: '#220022',              // Dark Purple
            ui: '#440044',              // Purple
            uiBorder: '#ff00ff',        // Missing Texture Pink
            text: '#ffffff',            // White
            accent: '#000000',          // Black (Checkerboard style usually)
            accent2: '#ff00ff',         // Magenta
            accent3: '#888888',         // Grey
            warn: '#ffff00',
            err: '#ff00ff',
            particle: ['#ff00ff', '#000000']
        },
        fonts: {
            s: "14px 'Courier', monospace",
            m: "18px 'Courier', monospace",
            l: "24px 'Courier', monospace",
            xl: "36px 'Courier', monospace"
        },
        currency: {
            name: 'Bugs',
            symbol: '🐛',
            clickName: 'Squash'
        },
        button: {
            text: 'TODO',
            emoji: '🛠️',
            gradient: ['#ff00ff', '#000000'],
            image: 'assets/Levels/Beta Build/main button.webp'
        },
        upgrades: [
            { id: 'b1', name: 'Placeholder Asset', baseCost: 15, type: 'auto', val: 1, desc: '+1 🐛/sec' },
            { id: 'b2', name: 'Debug Tool', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'b3', name: 'Todo Comment', baseCost: 250, type: 'auto', val: 10, desc: '+10 🐛/sec' },
            { id: 'b4', name: 'Hotfix', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'b5', name: 'Patch Notes', baseCost: 5000, type: 'auto', val: 80, desc: '+80 🐛/sec' },
            { id: 'b6', name: 'Early Access', baseCost: 20000, type: 'auto', val: 300, desc: '+300 🐛/sec' },
            { id: 'b7', name: 'Kickstarter', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K 🐛/sec' },
            { id: 'b8', name: 'Feature Creep', baseCost: 1000000, type: 'auto', val: 10000, desc: 'DELAY LAUNCH' },
        ],
        fakeUI: [
            { text: 'TEXTURE MISSING', color: '#ff00ff' },
            { text: 'TODO: Fix UI', color: '#ffffff' },
            { text: 'Lorem Ipsum', color: '#888888' },
            { text: 'Button_Final_v2', color: '#ff00ff' }
        ],
        progressBar: {
            label: 'COMPILING SHADERS',
            color: '#ff00ff',
            bgColor: '#000000'
        },
        startText: 'LOADING ASSETS...',
        parallax: {
            layers: [
                { src: 'assets/Levels/Beta Build/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Beta Build/parallax/layer 2.webp', speed: 20 }
            ]
        },
        particles: {
            emoji: ['🐛', '🟪', '⬛', '🛠️'],
            useEmoji: true
        },
        mechanics: {
            inputLag: true
        }
    },

    // Theme 2: Digital Decay - Darknet / Hacker / Glitch
    digital_decay: {
        id: 'digital_decay',
        name: 'Darknet Layer',
        bootSequence: [
            "LAYER 8 BREACH DETECTED.",
            "REALITY INTEGRITY: FAILING.",
            "CONTAINMENT: CRITICAL.",
            "THEY ARE WATCHING."
        ],

        colors: {
            bg: '#050505',              // Almost Black
            ui: '#111111',              // Dark Grey
            uiBorder: '#333333',        // Grey border
            text: '#cccccc',            // Light Grey
            accent: '#00ff00',          // Hacker Green
            accent2: '#ff0000',         // Error Red
            accent3: '#0000ff',         // Deep Blue
            warn: '#ffaa00',
            err: '#ff0000',
            particle: ['#00ff00', '#000000', '#111111']
        },

        fonts: {
            s: "16px 'VT323', monospace",
            m: "22px 'VT323', monospace",
            l: "32px 'VT323', monospace",
            xl: "48px 'VT323', monospace"
        },

        currency: {
            name: 'Encrypted Data',
            symbol: 'φ',
            clickName: 'Hash'
        },

        button: {
            text: 'DECRYPT',
            emoji: '🗝️',
            gradient: ['#003300', '#001100'],
            image: 'assets/Levels/Digital Decay/main button.webp'
        },

        upgrades: [
            { id: 'u1', name: 'Tor_Node', baseCost: 15, type: 'auto', val: 1, desc: '+1 φ/sec' },
            { id: 'u2', name: 'Keylogger', baseCost: 50, type: 'click', val: 2, desc: '+2 Click Power' },
            { id: 'u3', name: 'Botnet', baseCost: 250, type: 'auto', val: 10, desc: '+10 φ/sec' },
            { id: 'u4', name: 'Zero_Day', baseCost: 1000, type: 'click', val: 15, desc: '+15 Click Power' },
            { id: 'u5', name: 'Silk_Road', baseCost: 5000, type: 'auto', val: 80, desc: '+80 φ/sec' },
            { id: 'u6', name: 'Identity_Theft', baseCost: 20000, type: 'auto', val: 300, desc: '+300 φ/sec' },
            { id: 'u7', name: 'Red_Room', baseCost: 100000, type: 'auto', val: 1500, desc: '+1.5K φ/sec' },
            { id: 'u8', name: '[REDACTED]', baseCost: 1000000, type: 'auto', val: 10000, desc: 'UNKNOWN' },
        ],

        fakeUI: [
            { text: '0x4F2A...', color: '#222' },
            { text: '[ENCRYPTED]', color: '#222' },
            { text: 'Connection Secured', color: '#222' },
            { text: 'Handshake...', color: '#222' },
            { text: 'Uploading...', color: '#222' }
        ],

        progressBar: {
            label: 'ANONYMITY',
            color: '#333',
            bgColor: '#111',
            invert: true
        },

        startText: 'INITIATE PROTOCOL',

        particles: {
            emoji: [],
            useEmoji: false
        },

        mechanics: {}
    },

    // Theme 3: Legacy System - Retro / BIOS / DOS
    legacy_system: {
        id: 'legacy_system',
        name: 'Legacy System',
        bootSequence: [
            "Initializing Layer 9...",
            "Accessing Kernel...",
            "BIOS DATE: 1999.",
            "Subject Zero origin point found."
        ],

        colors: {
            bg: '#000084',              // BIOS Blue
            ui: '#0000aa',              // Lighter Blue
            uiBorder: '#ffffff',        // White
            text: '#ffffff',            // White
            accent: '#ffffff',          // White
            accent2: '#aaaaaa',
            accent3: '#000000',
            warn: '#ffff00',
            err: '#ff0000',
            particle: ['#ffffff', '#aaaaaa']
        },

        fonts: {
            s: "14px 'Courier New', monospace",
            m: "18px 'Courier New', monospace",
            l: "24px 'Courier New', monospace",
            xl: "32px 'Courier New', monospace"
        },

        currency: {
            name: 'Kilobytes',
            symbol: 'KB',
            clickName: 'Byte'
        },

        button: {
            text: 'EXECUTE',
            emoji: '💾',
            gradient: ['#aaaaaa', '#777777'],
            image: 'assets/Levels/Legacy System/main button.webp'
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
            { text: 'QBASIC.EXE', color: '#fff' },
            { text: 'Bad Command', color: '#fff' }
        ],

        progressBar: {
            label: 'MEMORY CHECK',
            color: '#fff',
            bgColor: '#0000aa'
        },

        startText: 'PRESS ANY KEY',

        // Parallax Settings
        parallax: {
            layers: [
                { src: 'assets/Levels/Legacy System/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Legacy System/parallax/layer 2.webp', speed: 20 }
            ]
        },

        particles: {
            emoji: ['█', '▓', '▒', '░'],
            useEmoji: true
        },

        mechanics: {}
    },

    // Theme 4: The Null Void - White, Empty, Invisible
    null_void: {
        id: 'null_void',
        name: 'The Null Void',
        bootSequence: [
            "LAYER 10: SINGULARITY.",
            "SYSTEM FAILURE.",
            "EXISTENCE_NOT_FOUND.",
            "GOODBYE."
        ],

        colors: {
            bg: '#ffffff',
            ui: '#ffffff',              // White UI (Invisible against BG)
            uiBorder: '#000000',        // Black outlines (Wireframe)
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
            name: 'Nothing',
            symbol: '∅',
            clickName: 'Void'
        },

        button: {
            text: 'EXIST',
            emoji: '👁️',
            gradient: ['#ffffff', '#ffffff'],
            image: 'assets/Levels/Null Void/main button.webp'
        },

        upgrades: [
            { id: 'n1', name: 'Null', baseCost: 15, type: 'auto', val: 1, desc: '...' },
            { id: 'n2', name: 'Undefined', baseCost: 50, type: 'click', val: 2, desc: ' ' },
            { id: 'n3', name: 'NaN', baseCost: 250, type: 'auto', val: 10, desc: ' ' },
            { id: 'n4', name: 'Void^2', baseCost: 1000, type: 'click', val: 15, desc: ' ' },
            { id: 'n5', name: 'Entropy', baseCost: 5000, type: 'auto', val: 80, desc: 'Chaos' },
            { id: 'n6', name: 'Event Horizon', baseCost: 20000, type: 'auto', val: 300, desc: 'No Return' },
            { id: 'n7', name: 'Singularity', baseCost: 100000, type: 'auto', val: 1500, desc: 'Infinite' },
            { id: 'n8', name: 'The End', baseCost: 1000000, type: 'auto', val: 10000, desc: 'Goodbye' },
        ],

        fakeUI: [], // No fake UI

        progressBar: {
            label: 'REALITY FAILURE',
            color: '#000000',
            bgColor: '#ffffff',
            invert: true
        },

        startText: '...',

        // Parallax Settings
        parallax: {
            layers: [
                { src: 'assets/Levels/Null Void/parallax/layer 1.webp', speed: 0 },
                { src: 'assets/Levels/Null Void/parallax/layer 2.webp', speed: 20 },
                { src: 'assets/Levels/Null Void/parallax/layer 3.webp', speed: 40 }
            ]
        },

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
