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

        // 1. Sidebar (Left)
        const sbW = 220;
        // Generate category buttons
        const cats = ['New', 'Trending', 'Action', 'Driving', 'Clicker', 'Horror', 'Multiplayer'];
        cats.forEach((txt, i) => {
            this.elements.push({
                type: 'sidebar_btn',
                x: 20, y: 80 + i * 50, w: 180, h: 35,
                text: txt,
                color: '#6842ff', // Purple accent
                hp: 3,
                maxHp: 3,
                active: true
            });
        });

        // 2. Game Grid REMOVED as per request.
        // Only Sidebar remains.
    }

    draw(ctx) {
        // Restriction: Only draw in Rainbow Paradise
        if (this.game.themeManager.currentTheme.id !== 'rainbow_paradise') return;

        const uiColor = '#6842ff';
        const h = this.game.h;

        // Sidebar BG
        ctx.fillStyle = '#161616';
        ctx.fillRect(0, 0, 240, h);

        // Logo Area
        ctx.fillStyle = uiColor;
        ctx.font = "bold 24px Arial";
        ctx.fillText("CrazyFakes", 20, 40);

        this.elements.forEach(el => {
            if (!el.active) return;

            let dx = 0, dy = 0;
            if (el.hp < el.maxHp) {
                dx = (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 2;
            }

            if (el.type === 'sidebar_btn') {
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
            else if (el.type === 'game_card') {
                // Card BG
                ctx.fillStyle = (el.hp < el.maxHp) ? '#333' : el.color;
                ctx.fillRect(el.x + dx, el.y + dy, el.w, el.h);

                // Procedural Thumbnail Art
                ctx.fillStyle = '#444';
                if (el.iconType === 0) { // Car
                    ctx.fillStyle = '#f55';
                    ctx.fillRect(el.x + 40 + dx, el.y + 50 + dy, 80, 30);
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(el.x + 60 + dx, el.y + 80 + dy, 10, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(el.x + 100 + dx, el.y + 80 + dy, 10, 0, Math.PI * 2); ctx.fill();
                } else if (el.iconType === 1) { // Sword
                    ctx.strokeStyle = '#5ff';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(el.x + 40 + dx, el.y + 90 + dy);
                    ctx.lineTo(el.x + 120 + dx, el.y + 30 + dy);
                    ctx.stroke();
                } else { // Clicker Circle
                    ctx.fillStyle = '#ff5';
                    ctx.beginPath();
                    ctx.arc(el.x + el.w / 2 + dx, el.y + el.h / 2 + dy, 20, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
    }

    damage(el) {
        el.hp--;
        if (el.hp <= 0) {
            el.active = false;
            return true; // Destroyed
        }
        return false;
    }
}
