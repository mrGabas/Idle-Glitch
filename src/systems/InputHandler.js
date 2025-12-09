/**
 * INPUT SYSTEM
 * Handles mouse, keyboard, and window events
 * @module systems/InputHandler
 */
import { NotepadWindow } from '../ui/windows.js';
import { Particle, Debris } from '../entities/particles.js';
import { events } from '../core/events.js';

export class InputHandler {
    constructor(game) {
        this.game = game;
        this.mouse = { x: 0, y: 0, down: false };
        this.realMouse = { x: 0, y: 0 }; // Track physical mouse
        this.mouseHistory = []; // For lag effect

        // Tab Stalker State
        this.awayStartTime = 0;
        this.titleInterval = null;
        this.subTitles = [
            "Hey?", "Come back...", "I see you...",
            "Don't leave me", "WHERE ARE YOU?", "I'M LONELY",
            "LOOK BEHIND YOU", "SYSTEM FAILURE"
        ];
        this.originalTitle = document.title;

        this.bindEvents();
    }

    bindEvents() {
        // Window Resize
        window.addEventListener('resize', () => this.game.resize());

        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.game.gameState === 'PLAYING') this.game.togglePause();
                else if (this.game.gameState === 'PAUSED') this.game.togglePause();
                else if (this.game.gameState === 'SETTINGS') this.game.closeSettings();
            }
        });

        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            if (this.game.gameState === 'PLAYING') {
                this.realMouse.x = e.clientX;
                this.realMouse.y = e.clientY;
                this.mouseHistory.push({ x: e.clientX, y: e.clientY, time: Date.now() });
                if (this.mouseHistory.length > 200) this.mouseHistory.shift();
            }
        });

        // Mouse Click
        // Note: 'mousedown' is used in original game.js
        this.game.renderer.canvas.addEventListener('mousedown', (e) => this.handleClick(e));

        // Tab Visibility
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.awayStartTime = Date.now();
            let i = 0;
            this.titleInterval = setInterval(() => {
                document.title = this.subTitles[i % this.subTitles.length];
                i++;
            }, 2000);
        } else {
            document.title = this.originalTitle;
            if (this.titleInterval) clearInterval(this.titleInterval);
            const timeAway = (Date.now() - this.awayStartTime) / 1000;
            if (timeAway > 5) this.handleTabReturn(timeAway);
        }
    }

    handleTabReturn(seconds) {
        if (this.game.gameState !== 'PLAYING') return;

        const penalty = this.game.state.autoRate * seconds * 1.5;
        this.game.state.score = Math.max(0, this.game.state.score - penalty);
        this.game.addScore(0);

        events.emit('play_sound', 'error');
        this.game.shake = 10;
        this.game.state.corruption += 5;
        this.game.triggerScareOverlay("WHERE WERE YOU?");
    }

    updateMouse(dt, corruption) {
        // Calculate Lag
        let lagAmount = 0;
        if (corruption > 60) {
            lagAmount = (corruption - 60) * 12;
        }

        if (lagAmount > 0 && this.mouseHistory.length > 0) {
            const targetTime = Date.now() - lagAmount;
            let best = this.mouseHistory[this.mouseHistory.length - 1];
            for (let i = this.mouseHistory.length - 1; i >= 0; i--) {
                if (this.mouseHistory[i].time <= targetTime) {
                    best = this.mouseHistory[i];
                    break;
                }
            }
            this.mouse.x = best.x;
            this.mouse.y = best.y;
        } else {
            this.mouse.x = this.realMouse.x;
            this.mouse.y = this.realMouse.y;
        }

        // Calculate Inversion
        if (corruption > 85) {
            this.mouse.x = this.game.w - this.mouse.x;
        }
    }

    handleClick(e) {
        if (this.game.gameState !== 'PLAYING') return;

        this.mouse.down = true;
        const mx = this.mouse.x;
        const my = this.mouse.y;
        const game = this.game;

        // 1. Notepad (Top Priority)
        if (game.activeNotepad) {
            const close = game.activeNotepad.checkClick(mx, my);
            if (close) game.activeNotepad = null;
            return;
        }

        // 2. Mail Window
        if (game.mailWindow && game.mailWindow.active) {
            const consumed = game.mailWindow.checkClick(mx, my);
            if (consumed) return;
        }

        // 3. Mail Button
        if (mx > game.w - 80 && mx < game.w - 20 && my > 20 && my < 80) {
            game.mailWindow.active = !game.mailWindow.active;
            events.emit('play_sound', 'click');
            return;
        }

        // 4. Lore Files
        for (let i = 0; i < game.loreFiles.length; i++) {
            if (game.loreFiles[i].checkClick(mx, my)) {
                game.activeNotepad = new NotepadWindow(game.w, game.h, "ACCESS GRANTED\n\nPROJECT: RAINBOW\nSTATUS: FAILED\n\nLOG: The AI has become self-aware. It demands more pixels.");
                game.loreFiles.splice(i, 1);
                events.emit('play_sound', 'click');

                // Mail Archive Logic
                if (game.mail) {
                    game.mail.receiveMail({
                        id: 'lore_' + Date.now(),
                        sender: 'ARCHIVE_BOT',
                        subject: 'FILE RECOVERED',
                        body: "Recovered Data Content:\n\n" + "PROJECT: RAINBOW\nSTATUS: FAILED\n\nLOG: The AI has become self-aware. It demands more pixels.",
                        trigger: { type: 'manual' }
                    });
                }
                return;
            }
        }

        // 5. Captchas
        for (let i = 0; i < game.captchas.length; i++) {
            const c = game.captchas[i];
            if (c.checkClick(mx, my)) {
                events.emit('play_sound', 'buy');
                game.addScore(game.state.autoRate * 120 + 1000);
                game.state.corruption = Math.max(0, game.state.corruption - 5);
                game.createParticles(mx, my, '#0f0');
                game.chat.addMessage('SYSTEM', 'VERIFICATION SUCCESSFUL');
                game.captchas.splice(i, 1);
                return;
            }
        }

        // 6. Popups
        let popupHit = false;
        for (let p of game.popups) {
            const res = p.checkClick(mx, my);
            if (res) {
                popupHit = true;
                if (res === 'bonus') {
                    game.addScore(game.state.autoRate * 20 + 500);
                    game.createParticles(mx, my, game.currentTheme.colors.accent);
                    events.emit('play_sound', 'buy');
                } else {
                    events.emit('play_sound', 'click');
                }
            }
        }
        if (popupHit) return;

        // 7. Shop Upgrades
        let shopHit = false;
        game.upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = game.w / 2 - 230 + col * 240;
            const by = game.h / 2 + 50 + row * 80;

            if (mx >= bx && mx <= bx + 220 && my >= by && my <= by + 70) {
                shopHit = true;
                if (game.state.score >= u.cost) {
                    game.buyUpgrade(u);
                } else {
                    events.emit('play_sound', 'error');
                }
            }
        });
        if (shopHit) return;

        // 8. Main Button
        const cx = game.w / 2;
        const cy = game.h / 2 - 100;
        if (Math.hypot(mx - cx, my - cy) < 80) {
            game.clickMain();
            return;
        }

        // 9. Fake UI Destruction
        let hitUI = false;
        game.fakeUI.elements.forEach(el => {
            if (el.active && mx > el.x && mx < el.x + el.w && my > el.y && my < el.y + el.h) {
                hitUI = true;
                const destroyed = game.fakeUI.damage(el);

                // Spawn debris
                for (let i = 0; i < 3; i++) {
                    game.debris.push(new Debris(mx, my, el.color));
                }

                if (destroyed) {
                    for (let i = 0; i < 15; i++) {
                        game.debris.push(new Debris(el.x + el.w / 2, el.y + el.h / 2, el.color));
                    }
                    game.addScore(100 * game.state.multiplier);
                    game.state.corruption += game.currentTheme.id === 'rainbow_paradise' ? 1.5 : 0.5;
                }
            }
        });

        if (hitUI) {
            game.shake = 3;
            if (game.currentTheme.id === 'rainbow_paradise' && game.state.corruption < 30) {
                events.emit('play_sound', 'error');
                game.createFloatingText(mx, my, "LOCKED", "#888");
                return;
            }

            events.emit('play_sound', 'glitch');
            if (game.currentTheme.id === 'rainbow_paradise') {
                game.state.corruption += 0.2;
            }
        }

        // 10. Hunter
        if (game.hunter && game.hunter.active) {
            const hit = game.hunter.checkClick(mx, my);
            if (hit) {
                events.emit('play_sound', 'click');
                game.createParticles(mx, my, '#f00');
                if (hit === true) {
                    game.addScore(1000 * game.state.multiplier);
                    game.hunter = null;
                    game.chat.addMessage('Admin_Alex', 'Фух... пронесло.');
                }
                return;
            }
        }
    }
}
