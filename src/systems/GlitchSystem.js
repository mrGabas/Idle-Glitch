
import { CFG, UTILS } from '../core/config.js';
import { GlitchHunter, CursedCaptcha } from '../entities/enemies.js';
import { LoreFile } from '../entities/items.js';
import { FakeCursor } from '../entities/FakeCursor.js';
import { Popup } from '../ui/windows.js';
import { MinigameWindow } from '../ui/MinigameWindow.js';

export class GlitchSystem {
    constructor(game) {
        this.game = game;
        this.fakeCursor = new FakeCursor(0, 0, game);
    }

    update(dt) {
        const state = this.game.state;

        // --- INPUT DECAY LOGIC (Lag) ---
        let lagAmount = 0;
        if (state.corruption > 60) {
            lagAmount = (state.corruption - 60) * 12;
        }

        if (lagAmount > 0 && this.game.mouseHistory.length > 0) {
            const targetTime = Date.now() - lagAmount;
            let best = this.game.mouseHistory[this.game.mouseHistory.length - 1];
            for (let i = this.game.mouseHistory.length - 1; i >= 0; i--) {
                if (this.game.mouseHistory[i].time <= targetTime) {
                    best = this.game.mouseHistory[i];
                    break;
                }
            }
            this.game.mouse.x = best.x;
            this.game.mouse.y = best.y;
        } else {
            this.game.mouse.x = this.game.realMouse.x;
            this.game.mouse.y = this.game.realMouse.y;
        }

        // Mouse Inversion
        if (state.corruption > 85) {
            this.game.mouse.x = this.game.w - this.game.mouse.x;
        }

        // --- FALSE CRASH LOGIC ---
        if (state.falseCrash) {
            state.crashTimer += dt;
            // Renderer handles the visual drawing of black screen / text based on this state
            if (state.crashTimer > 6.0) {
                state.falseCrash = false;
                document.body.style.cursor = 'default';
                this.game.uiManager.chat.addMessage('SYSTEM', 'ERROR: SYSTEM RECOVERED');
                this.game.events.emit('play_sound', 'startup');
            }
            return; // Block other updates? Game.js loop did "return" to stop other updates.
            // But if I return here, I only stop GlitchSystem update.
            // Game.js needs to know to stop OTHER systems.
            // I should maybe handle this via a property that Game checks, or Game checks state.falseCrash itself for high-level blocking.
            // Requirement said "Move logic... triggerFalseCrash...".
            // If Game.js loop has: `this.glitchSystem.update(dt)`, and then checks `if (this.state.falseCrash) return;` ?
            // Or GlitchSystem handles the timer, and Game.js just checks the flag to skip others.
        }

        // --- CRASH / REBOOT LOGIC ---
        if (state.crashed) {
            this.game.rebootTimer -= dt;
            if (this.game.rebootTimer <= 0) {
                state.crashed = false;
                state.rebooting = true;
                this.game.rebootTimer = 5.0; // 5s BIOS
            }
            return;
        }

        if (state.rebooting) {
            this.game.rebootTimer -= dt;
            if (this.game.rebootTimer <= 0) {
                if (this.game.gameState === 'PLAYING') {
                    state.rebooting = false;
                    this.game.uiManager.chat.addMessage('SYSTEM', 'SYSTEM REBOOT SUCCESSFUL.');
                    this.game.events.emit('play_sound', 'startup');
                } else {
                    this.game.hardReset();
                }
            }
            return;
        }

        // --- SPAWNING LOGIC ---

        // Random Popups
        if (Math.random() < 0.001 + (state.glitchIntensity * 0.02)) {
            if (this.game.entities.getAll('ui').length < 5) {
                this.game.entities.add('ui', new Popup(this.game.w, this.game.h, this.game.themeManager.currentTheme));
            }
        }

        // Hunter Spawn
        if (!this.game.hunter && state.corruption > 40 && Math.random() < 0.001) {
            this.game.hunter = new GlitchHunter(this.game.w, this.game.h);
            this.game.uiManager.chat.addMessage('SYSTEM', 'WARNING: VIRUS DETECTED');
            this.game.events.emit('play_sound', 'error');
        }

        // Fake Cursor Update/Spawn
        if (state.corruption > 20) {
            if (!this.fakeCursor.active && Math.random() < 0.0005 * state.corruption) {
                this.fakeCursor.reset(this.game.w, this.game.h);
            }
            this.fakeCursor.update(dt);
        }

        // Fake Browser Error
        if (state.corruption > 60 && !state.crashed && !state.rebooting && !state.falseCrash) {
            if (Math.random() < 0.0001) {
                this.triggerBrowserError();
            }
        }

        // Captchas
        const enemies = this.game.entities.getAll('enemies');
        if (state.corruption > 15 && Math.random() < 0.0005) {
            const caps = enemies.filter(e => e instanceof CursedCaptcha);
            if (caps.length < 1) {
                this.game.entities.add('enemies', new CursedCaptcha(this.game.w, this.game.h));
                this.game.events.emit('play_sound', 'error');
            }
        }

        // Lore Files
        if (state.corruption > 10 && Math.random() < 0.0003 && !this.game.uiManager.activeNotepad) {
            if (this.game.entities.getAll('items').length < 2) {
                this.game.entities.add('items', new LoreFile(this.game.w, this.game.h));
            }
        }

        // Hunter Update
        if (this.game.hunter && this.game.hunter.active) {
            const status = this.game.hunter.update(dt, this.game);
            if (status === 'damage') {
                state.score -= state.autoRate * dt * 2;
                if (state.score < 0) state.score = 0;
                this.game.shake = 5;
            }
        }

        // --- MINIGAME LOGIC ---
        const uiEntities = this.game.entities.getAll('ui');
        // Find existing minigame (search backwards or just find)
        // We use a loop or find.
        let activeMinigameIndex = -1;
        let activeMinigame = null;
        for (let i = 0; i < uiEntities.length; i++) {
            if (uiEntities[i] instanceof MinigameWindow) {
                activeMinigame = uiEntities[i];
                activeMinigameIndex = i;
                break;
            }
        }

        if (activeMinigame) {
            // Check status
            if (activeMinigame.hack.won) {
                this.game.events.emit('play_sound', 'startup');
                this.game.state.addScore(this.game.state.autoRate * 300 + 5000);
                this.game.state.addCorruption(-20);
                this.game.uiManager.chat.addMessage('SYSTEM', 'OVERRIDE SUCCESSFUL. CORRUPTION PURGED.');
                this.game.shake = 2; // Happy little shake

                // Remove functionality: logic implies game tracks it, but it's in EntityManager.
                // We need to remove it from EntityManager.
                // EntityManager.remove? It doesn't have it. It has clear() or we splice array if we had direct access.
                // But game.entities.getAll returns reference to array? 
                // Let's check EntityManager.getAll implementation.
                // If it returns `this.layers[layer]`, then splicing works.
                uiEntities.splice(activeMinigameIndex, 1);

            } else if (activeMinigame.hack.lost) {
                this.game.events.emit('play_sound', 'error');
                this.game.state.addCorruption(5); // Penalty
                this.game.shake = 20; // Big shake
                this.game.uiManager.chat.addMessage('SYSTEM', 'OVERRIDE FAILED. SYSTEM UNSTABLE.');

                uiEntities.splice(activeMinigameIndex, 1);
            }
        } else {
            // Spawn Chance
            // Corruption > 40
            if (state.corruption > 40 && !state.crashed && !state.rebooting && Math.random() < 0.0005) {
                this.game.entities.add('ui', new MinigameWindow(this.game.w, this.game.h));
                this.game.events.emit('play_sound', 'error'); // Alert player
                this.game.uiManager.chat.addMessage('SYSTEM', 'WARNING: INTRUSION DETECTED. OVERRIDE REQUIRED.');
            }
        }
    }

    handleClick(mx, my) {
        // 1. Hunter
        if (this.game.hunter && this.game.hunter.active) {
            const hit = this.game.hunter.checkClick(mx, my);
            if (hit) {
                this.game.events.emit('play_sound', 'click');
                this.game.createParticles(mx, my, '#f00');
                if (hit === true) {
                    this.game.state.addScore(1000 * this.game.state.multiplier);
                    this.game.hunter = null;
                    this.game.uiManager.chat.addMessage('Admin_Alex', 'Фух... пронесло.');
                }
                return true;
            }
        }

        // 2. Captchas
        const captchas = this.game.entities.getAll('enemies');
        for (let i = 0; i < captchas.length; i++) {
            const c = captchas[i];
            if (c instanceof CursedCaptcha && c.checkClick(mx, my)) {
                this.game.events.emit('play_sound', 'buy');
                this.game.addScore(this.game.state.autoRate * 120 + 1000);
                this.game.state.addCorruption(-5);
                this.game.createParticles(mx, my, '#0f0');
                this.game.uiManager.chat.addMessage('SYSTEM', 'VERIFICATION SUCCESSFUL');
                captchas.splice(i, 1);
                return true;
            }
        }

        // 3. Lore Files
        const loreFiles = this.game.entities.getAll('items');
        for (let i = 0; i < loreFiles.length; i++) {
            if (loreFiles[i].checkClick(mx, my)) {
                const file = loreFiles[i];
                this.game.uiManager.openNotepad(file.content, { password: file.password, title: file.label });
                loreFiles.splice(i, 1); // remove
                this.game.events.emit('play_sound', 'click');
                return true;
            }
        }

        return false;
    }

    triggerFalseCrash() {
        if (this.game.state.falseCrash) return;
        this.game.state.falseCrash = true;
        this.game.state.crashTimer = 0;
        document.body.style.cursor = 'wait';
    }

    triggerBrowserError() {
        // We need to access DOM elements. Game.js had logic for this.
        // Game.js accessed document directly.
        // ideally we move this to UIManager or keep direct access if "System" related.
        const el = document.getElementById('browser-error-overlay');
        if (el) el.style.display = 'flex';
        this.game.gameState = 'PAUSED';
        this.game.events.emit('play_sound', 'error');
    }

    handleBrowserWait() {
        const el = document.getElementById('browser-error-overlay');
        if (el) el.style.display = 'none';
        this.game.gameState = 'PLAYING';
        const reward = this.game.state.autoRate * 60;
        this.game.addScore(reward);
        this.game.uiManager.chat.addMessage('SYSTEM', `Recalibrating... compensation awarded: ${UTILS.fmt(reward)}`);
        this.game.events.emit('play_sound', 'startup');
    }

    handleBrowserKill() {
        location.reload();
    }

    // Resize handler for fake cursor
    resize(w, h) {
        if (this.fakeCursor) this.fakeCursor.resize(w, h);
    }
}
