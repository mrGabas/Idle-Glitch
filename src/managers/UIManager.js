/**
 * UI MANAGER
 * Handles all UI window states, interactions, and updates.
 */
import { ChatSystem } from '../ui/chat.js';
import { ReviewsTab } from '../ui/reviewsTab.js';
import { MailWindow, NotepadWindow, ConfirmationWindow } from '../ui/windows.js';
import { ArchiveWindow, MediaViewerWindow } from '../ui/ArchiveWindow.js';
import { MinigameWindow } from '../ui/MinigameWindow.js';
import { AchievementsWindow } from '../ui/achievementsWindow.js';
import { OfflineReportWindow } from '../ui/OfflineWindow.js';

import { MailSystem } from '../systems/MailSystem.js';
import { WindowManager } from './WindowManager.js';
import { assetLoader } from '../core/AssetLoader.js';
import { CFG } from '../core/config.js';
import { Debris } from '../entities/particles.js';

export class UIManager {
    constructor(game) {
        this.game = game; // Reference to main game

        // Window Manager (Handles Z-ordered windows like Notepad, Mail, Minigames)
        this.windowManager = new WindowManager(game);

        // Initialize Sub-Systems
        this.chat = new ChatSystem(game);
        this.reviewsTab = new ReviewsTab(game);

        // Mail System
        this.mail = new MailSystem(game, this.chat);
        this.mail = new MailSystem(game, this.chat);
        this.mailWindow = new MailWindow(game.w, game.h, this.mail);

        this.archiveWindow = new ArchiveWindow(game);

        this.achievementsWindow = new AchievementsWindow(game);

        // Bind Inputs
        this.game.input.on('wheel', (e) => this.handleWheel(e));
    }

    handleWheel(e) {
        // Propagate to WindowManager
        this.windowManager.handleWheel(e.deltaY);
    }

    resize(w, h) {
        if (this.mailWindow) this.mailWindow.resize(w, h);
        if (this.archiveWindow) this.archiveWindow.update(0); // Basic recheck if needed, usually window handles itself
        if (this.reviewsTab) this.reviewsTab.resize();
        if (this.achievementsWindow) this.achievementsWindow.resize();
        if (this.achievementsWindow) this.achievementsWindow.resize();
    }

    update(dt) {
        const corruption = this.game.state.corruption;

        this.chat.update(dt, corruption);
        this.reviewsTab.update(dt);

        // Update Windows
        this.windowManager.update(dt);

        // --- Input Context Management ---
        const input = this.game.input;
        if (input) {
            // Check for CANCEL to drop focus
            if (input.isActionPressed('CANCEL')) {
                if (this.chat.isFocused) {
                    this.chat.isFocused = false;
                    // input.setContext('global'); // Will be handled below
                }
                // Determine if we need to close a minigame? 
                // MinigameWindow usually handles its own close on X, but ESC could also work?
                // For now, let's just handle focus dropping.
            }

            // Determine Context
            if (this.chat.isFocused) {
                if (input.context !== 'chat') input.setContext('chat');
            } else if (this.windowManager.hasActiveInputWindow()) {
                // If a minigame or interactive window is top-most
                // This method doesn't exist yet on WindowManager, we should implement it or check manually
                // For now, let's check basic assumption: if any window is open? No, most are passive.
                // We need to know if an ACTIVE INPUT window is there.
                // Shortcuts:
                if (input.context !== 'minigame') input.setContext('minigame');
            } else {
                if (input.context !== 'global') input.setContext('global');
            }
        }
    }

    openNotepad(content, options = {}) {
        const notepad = new NotepadWindow(this.game.w, this.game.h, content, options);
        if (options.title) notepad.title = options.title;

        // Track active instance
        this.activeNotepad = notepad;

        // Add callback to clear reference on close
        notepad.onClose = () => {
            if (this.activeNotepad === notepad) {
                this.activeNotepad = null;
            }
        };

        this.windowManager.add(notepad, options.silentOpen);
    }

    openMinigame(minigame) {
        const win = new MinigameWindow(this.game.w, this.game.h, minigame);
        this.windowManager.add(win);
    }

    showMedia(data) {
        if (data.mediaType === 'audio') {
            // Play Audio
            // Use AssetLoader to get Audio object
            // Just assume it acts like play_sound but for specific file
            const audio = assetLoader.getAudio(data.src);
            if (audio) {
                try {
                    audio.currentTime = 0;
                    audio.volume = this.game.audio.sfxGain ? this.game.audio.sfxGain.gain.value : 0.5;
                    audio.play().catch(e => console.warn("Audio play failed", e));

                    // Show Notification
                    this.game.createFloatingText(this.game.w / 2, this.game.h - 100, "PLAYING: " + data.name, '#0ff');
                } catch (e) { console.warn(e); }
            } else {
                this.game.uiManager.chat.addMessage('SYSTEM', 'AUDIO NOT FOUND: ' + data.src);
            }
        } else if (data.mediaType === 'image' || data.mediaType === 'video') {
            // Open Media Viewer
            const win = new MediaViewerWindow(this.game.w, this.game.h, data.mediaType, data.src, data.name);
            this.windowManager.add(win, data.silentOpen);
        }
    }

    showOfflineReport(earnings, timeOffline) {
        const win = new OfflineReportWindow(this.game, earnings, timeOffline);
        this.windowManager.add(win);
    }

    // Toggle Mail
    toggleMail() {
        if (this.mailWindow.manager) {
            this.mailWindow.close();
        } else {
            this.mailWindow.active = true;
            this.windowManager.add(this.mailWindow);
        }
    }


    handleInput(mx, my) {
        // Priority 1: Console / Chat (Topmost)
        if (this.chat) {
            const res = this.chat.checkClick(mx, my, this.game.h);
            if (res === 'toggle') return true;
            if (res === 'consumed') {
                this.startScrollDrag(this.chat, my);
                return true;
            }
            if (res === true) return true;
        }

        // Priority 2: Modal Overlays (Reviews, Achievements)
        if (this.reviewsTab && this.reviewsTab.visible) {
            const res = this.reviewsTab.checkClick(mx, my);
            if (res === 'close') {
                this.reviewsTab.toggle();
                return true;
            }
            if (res === 'consumed') {
                this.startScrollDrag(this.reviewsTab, my);
                return true;
            }
        }

        if (this.achievementsWindow && this.achievementsWindow.visible) {
            const res = this.achievementsWindow.checkClick(mx, my);
            if (res === 'close') {
                this.achievementsWindow.toggle();
                return true;
            }
            if (res === 'consumed') {
                this.startScrollDrag(this.achievementsWindow, my);
                return true;
            }
        }

        // Priority 3: Windows (Manager)
        if (this.windowManager.handleInput(mx, my)) {
            return true;
        }

        // Priority 4: HUD Icons (Header)
        if (this.game.canTriggerDestruction) return false;

        const sx = this.game.w * CFG.game.shop.startXRatio;
        const sw = this.game.w - sx;
        const iconY = this.game.h * 0.05;
        const iconStep = sw / 5;
        const halfStep = iconStep / 2;

        const ocX = sx + halfStep;
        const mailX = sx + halfStep + iconStep;
        const chatX = sx + halfStep + iconStep * 2;
        const achX = sx + halfStep + iconStep * 3;
        const arcX = sx + halfStep + iconStep * 4;
        const hitRadius = 25;

        const checkBreak = (x, y) => {
            if (this.game.canTriggerDestruction) {
                this.game.events.emit('play_sound', 'break');
                for (let k = 0; k < 5; k++) this.game.entities.add('debris', new Debris(x, y, '#fff'));
                return true;
            }
            return false;
        };

        // 4.1 Overclock
        if (Math.hypot(mx - ocX, my - iconY) < hitRadius) {
            if (checkBreak(ocX, iconY)) return true;
            if (this.game.adsManager) {
                const win = new ConfirmationWindow(
                    this.game.w,
                    this.game.h,
                    "ACTIVATE OVERCLOCK",
                    "Watch an ad to boost production\nby 2x for 10 minutes?",
                    () => { this.game.adsManager.watchOverclockAd(); }
                );
                this.windowManager.add(win);
            }
            return true;
        }

        // 4.2 Mail
        if (Math.hypot(mx - mailX, my - iconY) < hitRadius) {
            if (checkBreak(mailX, iconY)) return true;
            this.toggleMail();
            return true;
        }

        // 4.3 Reviews Icon
        if (Math.hypot(mx - chatX, my - iconY) < hitRadius) {
            if (checkBreak(chatX, iconY)) return true;
            this.reviewsTab.toggle();
            return true;
        }

        // 4.4 Achievements
        if (Math.hypot(mx - achX, my - iconY) < hitRadius) {
            if (checkBreak(achX, iconY)) return true;
            this.achievementsWindow.toggle();
            if (this.achievementsWindow.visible && this.game.achievementSystem) this.game.achievementSystem.hasNew = false;
            return true;
        }

        // 4.5 Archive
        if (Math.hypot(mx - arcX, my - iconY) < hitRadius) {
            if (checkBreak(arcX, iconY)) return true;
            if (this.archiveWindow.manager) {
                this.archiveWindow.close();
            } else {
                this.windowManager.add(this.archiveWindow, true);
                this.game.events.emit('play_sound', 'archive');
                if (this.game.loreSystem) this.game.loreSystem.hasNew = false;
            }
            return true;
        }

        return false;
    }

    startScrollDrag(target, my) {
        this.currentScrollTarget = target;
        this.lastMouseY = my;
    }

    handleMouseMove(mx, my) {
        // 1. Handle Global Scroll Drag
        if (this.currentScrollTarget) {
            const dy = this.lastMouseY - my; // Drag down -> scroll up
            if (this.currentScrollTarget.handleScroll) {
                this.currentScrollTarget.handleScroll(dy);
            }
            this.lastMouseY = my;
            return true;
        }

        // 2. Window Manager Drag
        if (this.windowManager.handleMouseMove(mx, my)) return true;

        return false;
    }

    handleMouseUp() {
        if (this.currentScrollTarget) {
            this.currentScrollTarget = null;
            return true;
        }

        if (this.windowManager.handleMouseUp()) return true;

        return false;
    }

    // Draw method to be called by Renderer
    draw(ctx) {
        // Draw Full-screen / Overlay Systems first (or last depending on desired z-order)
        if (this.chat) this.chat.draw(ctx, this.game.h);

        // Windows (WindowManager)
        this.windowManager.draw(ctx);

        // Overlays (Reviews, Achievements)
        if (this.reviewsTab) this.reviewsTab.draw(ctx);
        if (this.achievementsWindow) this.achievementsWindow.draw(ctx);
    }

    startDrag(windowObj, mx, my) {
        this.windowManager.startDrag(windowObj, mx, my);
    }
}
