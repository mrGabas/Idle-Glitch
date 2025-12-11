/**
 * FAKE SITE UI (CRAZYFACES)
 * @module ui/ui
 */
import { UTILS } from '../core/config.js';

export class CrazyFaces {
    constructor(game) {
        this.game = game; // Reference to main game for config/theme access
        this.elements = [];
    }

    init(w, h) {
        this.elements = [];
        const theme = this.game.themeManager.currentTheme;
        const isGlitchTheme = theme.id === 'digital_decay';

        // CrazyFaces Colors
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

        // 2. Game Grid (Right side background)
        const startX = sbW + 20;
        const cardW = 160;
        const cardH = 120;
        const gap = 20;
        const cols = Math.floor((w - startX) / (cardW + gap));
        const rows = Math.ceil(h / (cardH + gap));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cx = w / 2;
                const cy = h / 2;
                const tx = startX + c * (cardW + gap);
                const ty = 80 + r * (cardH + gap);

                // Skip center zone
                const distToCenter = Math.hypot(tx + cardW / 2 - cx, ty + cardH / 2 - cy);
                if (distToCenter < 350) continue;

                this.elements.push({
                    type: 'game_card',
                    x: tx, y: ty, w: cardW, h: cardH,
                    color: cardColor,
                    hp: 5,
                    maxHp: 5,
                    active: true,
                    // Procedural icon type
                    iconType: Math.floor(Math.random() * 3)
                });
            }
        }
    }

    draw(ctx) {
        const uiColor = '#6842ff';
        const h = this.game.h;

        // Sidebar BG
        ctx.fillStyle = '#161616';
        ctx.fillRect(0, 0, 240, h);

        // Logo Area
        ctx.fillStyle = uiColor;
        ctx.font = "bold 24px Arial";
        ctx.fillText("CrazyFaces", 20, 40);

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
