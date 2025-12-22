/**
 * FAKE SITE UI (CRAZYFAKES)
 * @module ui/ui
 */
import { UTILS } from '../core/config.js';

export class CrazyFakes {
    constructor(game) {
        this.game = game; // Reference to main game for config/theme access
        this.elements = [];
    }

    init(w, h) {
        this.elements = [];
        const theme = this.game.themeManager.currentTheme;

        // Restriction: Fake UI only exists in Rainbow Paradise
        if (theme.id !== 'rainbow_paradise') {
            return;
        }

        const isGlitchTheme = theme.id === 'digital_decay';

        // CrazyFakes Colors
        const cardColor = isGlitchTheme ? '#222' : '#2b2b2b';

        // 0. Background & Title (Unlocked for total destruction)
        this.elements.push({
            id: 'sidebar_bg', // Added ID for persistence
            type: 'sidebar_bg',
            x: 0, y: 0, w: 240, h: h,
            color: '#161616',
            hp: 10, maxHp: 10,
            active: true,
            locked: false
        });

        this.elements.push({
            id: 'title', // Added ID for persistence
            type: 'title',
            x: 20, y: 15, w: 150, h: 30, // Approx rect for text
            text: "CrazyFakes",
            color: '#6842ff',
            hp: 5, maxHp: 5,
            active: true,
            locked: false
        });

        // 1. Sidebar (Left)
        // Generate category buttons
        const cats = ['New', 'Trending', 'Action', 'Driving', 'Clicker', 'Horror', 'Multiplayer'];
        cats.forEach((txt, i) => {
            this.elements.push({
                id: `sidebar_btn_${i}`, // Added ID for persistence
                type: 'sidebar_btn',
                x: 20, y: 80 + i * 50, w: 180, h: 35,
                text: txt,
                color: '#6842ff', // Purple accent
                hp: 3,
                maxHp: 3,
                active: true,
                locked: false
            });
        });

        // Load saved state if available
        if (this.game.saveSystem) {
            const savedData = this.game.saveSystem.load('fake_ui_data', null);
            if (savedData) this.importData(savedData);
        }
    }

    exportData() {
        // Map element ID to active status
        const data = {};
        this.elements.forEach(el => {
            if (el.id) {
                data[el.id] = {
                    active: el.active,
                    hp: el.hp
                };
            }
        });
        return data;
    }

    importData(data) {
        this.elements.forEach(el => {
            if (el.id && data[el.id]) {
                el.active = data[el.id].active;
                el.hp = data[el.id].hp;
            }
        });
    }

    draw(ctx) {
        // Restriction: Only draw in Rainbow Paradise
        if (this.game.themeManager.currentTheme.id !== 'rainbow_paradise') return;

        const h = this.game.h;

        this.elements.forEach(el => {
            if (!el.active) return;
            // Locked elements look normal (or maybe slightly hinted?)
            // For now, look identical.

            let dx = 0, dy = 0;
            if (el.hp < el.maxHp) {
                dx = (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 2;
            }

            if (el.type === 'sidebar_bg') {
                ctx.fillStyle = el.color;
                ctx.fillRect(el.x + dx, el.y + dy, el.w, el.h);
            }
            else if (el.type === 'title') {
                ctx.fillStyle = el.color;
                ctx.font = "bold 24px Arial";
                // If damaged/unlocked, maybe glitch text?
                let txt = el.text;
                if (!el.locked) txt = UTILS.corrupt(txt, (el.maxHp - el.hp) / el.maxHp);
                ctx.fillText(txt, el.x + dx, el.y + 24 + dy); // y is baseline? No, usually fillText uses x,y baseline. 
                // Previous code: ctx.fillText("CrazyFakes", 20, 40); -> y=40.
                // My rect y=40 is top? Or baseline? Canvas default textBaseline is alphabetic (so y is bottom).
                // Let's assume passed y is baseline.
            }
            else if (el.type === 'sidebar_btn') {
                ctx.fillStyle = (el.hp < el.maxHp) ? '#444' : '#222';
                ctx.fillRect(el.x + dx, el.y + dy, el.w, el.h);
                // Icon placeholder
                ctx.fillStyle = el.color;
                ctx.fillRect(el.x + 5 + dx, el.y + 5 + dy, 25, 25);
                // Text
                ctx.fillStyle = '#eee';
                ctx.font = '14px Arial';
                let txt = el.text;
                if (this.game.state.glitchIntensity > 0.5) txt = UTILS.corrupt(txt, 0.5);
                ctx.fillText(txt, el.x + 40 + dx, el.y + 22 + dy);
            }
        });
    }

    damage(el) {
        if (el.locked) return false;

        el.hp--;
        if (el.hp <= 0) {
            el.active = false;

            // Bonus for destroying anything large (like buttons or bg)
            this.game.state.addCorruption(1);

            if (el.type === 'sidebar_btn') {
                // Check if cleared all buttons for extra bonus?
                const remaining = this.elements.filter(e => e.type === 'sidebar_btn' && e.active).length;
                if (remaining === 0) {
                    this.game.state.addCorruption(5); // Bonus corruption for clearing list
                    this.game.events.emit('play_sound', 'powerup');
                }
            }

            return true; // Destroyed
        }
        return false;
    }
}
