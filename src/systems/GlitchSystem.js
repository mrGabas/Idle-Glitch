import { CFG, UTILS } from '../core/config.js';
import { GlitchHunter, CursedCaptcha, AntiVirusBot, SuddenMeeting } from '../entities/enemies.js';
import { LoreFile, ExecutableFile } from '../entities/items.js';
import { FakeCursor } from '../entities/FakeCursor.js';
import { Popup } from '../ui/windows.js';
import { MinigameWindow } from '../ui/MinigameWindow.js';
import { TerminalHack } from '../minigames/TerminalHack.js';
import { SnakeGame } from '../minigames/SnakeGame.js';

export class GlitchSystem {
    constructor(game) {
        this.game = game;
        this.fakeCursor = new FakeCursor(0, 0, game);
    }

    update(dt) {
        const state = this.game.state;
        const currentTheme = this.game.themeManager.currentTheme;
        const mechanics = currentTheme.mechanics || {};

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
            return;
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

        // --- NEW MECHANICS SPAWNING ---

        // 1. Anti-Virus Bots (Firewall)
        if (mechanics.healingBots && state.corruption > 10) {
            const enemies = this.game.entities.getAll('enemies');
            const avBot = enemies.find(e => e instanceof AntiVirusBot);

            // Spawn aggressively if high corruption
            const spawnChance = 0.005 + (state.corruption * 0.0001);
            if (!avBot && Math.random() < spawnChance) {
                this.game.entities.add('enemies', new AntiVirusBot(this.game.w, this.game.h));
                this.game.uiManager.chat.addMessage('SYSTEM', 'ANTIVIRUS PROTOCOL INITIATED');
            }
        }

        // 2. Boring Popups / Sudden Meeting (Corporate)
        if (mechanics.boringPopups) {
            if (Math.random() < 0.0005) { // Occasional
                const enemies = this.game.entities.getAll('enemies');
                const hasMeeting = enemies.some(e => e instanceof SuddenMeeting);
                if (!hasMeeting) {
                    this.game.entities.add('enemies', new SuddenMeeting(this.game.w, this.game.h));
                    this.game.events.emit('play_sound', 'error');
                }
            }
        }

        // Hunter Spawn
        const enemies = this.game.entities.getAll('enemies');
        const hunter = enemies.find(e => e instanceof GlitchHunter);

        if (!hunter && state.corruption > 40 && Math.random() < 0.001) {
            this.game.entities.add('enemies', new GlitchHunter(this.game.w, this.game.h));
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
        // const enemies = this.game.entities.getAll('enemies'); // Reuse from above
        if (state.corruption > 15 && Math.random() < 0.0005) {
            const caps = enemies.filter(e => e instanceof CursedCaptcha);
            if (caps.length < 1) {
                this.game.entities.add('enemies', new CursedCaptcha(this.game.w, this.game.h));
                this.game.events.emit('play_sound', 'error');
            }
        }

        // Lore Files
        if (state.corruption > 10 && Math.random() < 0.001 && !this.game.uiManager.activeNotepad) {
            if (this.game.entities.getAll('items').length < 2) {
                this.game.entities.add('items', new LoreFile(this.game.w, this.game.h));
            }
        }

        // Snake Game Spawn (Desktop Themes or Random)
        const currentThemeId = this.game.themeManager.currentTheme.id;
        if ((currentThemeId === 'dev_desktop' || currentThemeId === 'legacy_system') || Math.random() < 0.0005) {
            const items = this.game.entities.getAll('items');
            const hasSnake = items.some(i => i instanceof ExecutableFile && i.programName === 'Snake');
            const chance = (currentThemeId === 'dev_desktop' || currentThemeId === 'legacy_system') ? 0.002 : 0.0005;

            if (!hasSnake && Math.random() < chance) {
                this.game.entities.add('items', new ExecutableFile(this.game.w, this.game.h, 'Snake'));
            }
        }



        // --- MINIGAME LOGIC ---
        // Iterate UI Windows to find active Minigames
        const windows = this.game.uiManager.windowManager.windows;
        let activeMinigameWindow = null;

        for (const win of windows) {
            if (win instanceof MinigameWindow && win.active) {
                activeMinigameWindow = win;
                break;
            }
        }

        if (activeMinigameWindow) {
            const mg = activeMinigameWindow.minigame;

            if (mg instanceof TerminalHack) {
                if (mg.won) {
                    this.game.events.emit('play_sound', 'startup');
                    this.game.state.addScore(this.game.state.autoRate * 300 + 5000);
                    this.game.state.addCorruption(-20);
                    this.game.uiManager.chat.addMessage('SYSTEM', 'OVERRIDE SUCCESSFUL. CORRUPTION PURGED.');
                    this.game.shake = 2;
                    this.game.uiManager.windowManager.close(activeMinigameWindow);
                } else if (mg.lost) {
                    this.game.events.emit('play_sound', 'error');
                    this.game.state.addCorruption(5);
                    this.game.shake = 20;
                    this.game.uiManager.chat.addMessage('SYSTEM', 'OVERRIDE FAILED. SYSTEM UNSTABLE.');
                    this.game.uiManager.windowManager.close(activeMinigameWindow);
                }
            } else if (mg instanceof SnakeGame) {
                if (mg.lost) {
                    // Snake Game Over logic handled visually. 
                    // Won't close automatically so user can see score.
                }
            }
        } else {
            // Spawn Chance
            // Corruption > 40
            if (state.corruption > 40 && !state.crashed && !state.rebooting && Math.random() < 0.0005) {
                // Check if we already have one open? (Handled by activeMinigameWindow check above, kind of)
                // But we need to make sure we don't open multiple.
                // The loop above finds ANY, so if one exists, we won't enter this 'else'.
                // Wait! The logic structure was 'if (active) ... else { spawn }'.
                // So if any minigame is active, we don't spawn another. Correct.

                this.game.uiManager.openMinigame(new TerminalHack());
                this.game.events.emit('play_sound', 'error');
                this.game.uiManager.chat.addMessage('SYSTEM', 'WARNING: INTRUSION DETECTED. OVERRIDE REQUIRED.');
            }
        }
    }

    handleClick(mx, my) {
        // 1. Enemies (Hunter & Captchas & AntiVirus & Meeting)
        const enemies = this.game.entities.getAll('enemies');
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];

            // Standard Enemies checkClick
            // AntiVirusBot, GlitchHunter, CursedCaptcha, SuddenMeeting all implement checkClick
            // We can unify this block

            const hit = e.checkClick(mx, my);
            if (hit) {
                if (e instanceof SuddenMeeting) {
                    this.game.events.emit('play_sound', 'click');
                    if (hit === true) {
                        enemies.splice(i, 1);
                        this.game.uiManager.chat.addMessage('SYSTEM', 'MEETING ADJOURNED.');
                    }
                    return true;
                }

                if (e instanceof AntiVirusBot) {
                    this.game.events.emit('play_sound', 'click');
                    this.game.createParticles(mx, my, '#00ffff');
                    if (hit === true) {
                        this.game.state.addScore(2000 * this.game.state.multiplier);
                        enemies.splice(i, 1);
                        this.game.uiManager.chat.addMessage('SYSTEM', 'THREAT NEUTRALIZED.');
                    }
                    return true;
                }

                // ... rest of existing logic for Hunter/Captcha ...
                if (e instanceof GlitchHunter) {
                    this.game.events.emit('play_sound', 'click');
                    this.game.createParticles(mx, my, '#f00');
                    if (hit === true) {
                        this.game.state.addScore(1000 * this.game.state.multiplier);
                        enemies.splice(i, 1);
                        this.game.uiManager.chat.addMessage('Admin_Alex', 'Фух... пронесло.');
                    }
                    return true;
                }

                if (e instanceof CursedCaptcha) {
                    this.game.events.emit('play_sound', 'buy');
                    this.game.addScore(this.game.state.autoRate * 120 + 1000);
                    this.game.state.addCorruption(-5);
                    this.game.createParticles(mx, my, '#0f0');
                    this.game.uiManager.chat.addMessage('SYSTEM', 'VERIFICATION SUCCESSFUL');
                    enemies.splice(i, 1);
                    return true;
                }
            }
        }

        // 3. Lore Files
        const loreFiles = this.game.entities.getAll('items');
        for (let i = 0; i < loreFiles.length; i++) {
            if (loreFiles[i].checkClick(mx, my)) {
                const file = loreFiles[i];
                if (file instanceof ExecutableFile) {
                    if (file.programName === 'Snake') {
                        this.game.uiManager.openMinigame(new SnakeGame());
                        this.game.events.emit('play_sound', 'startup');
                    }
                } else {
                    this.game.uiManager.openNotepad(file.content, { password: file.password, title: file.label });
                }
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
