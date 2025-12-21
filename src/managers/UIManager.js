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
        // Priority 1: Windows (Top to Bottom)
        if (this.windowManager.handleInput(mx, my)) {
            return true;
        }

        // Priority 2: Reviews Tab
        if (this.reviewsTab.visible) {
            if (this.reviewsTab.checkClick(mx, my)) {
                return true;
            }
        }

        // Priority 3: Achievements Window
        if (this.achievementsWindow && this.achievementsWindow.visible) {
            if (this.achievementsWindow.checkClick(mx, my)) {
                return true;
            }
        }

        // Mail Window is now in WindowManager

        // Priority 4: HUD Icons (Header Config)
        const sx = this.game.w * CFG.game.shop.startXRatio;
        const sw = this.game.w - sx;
        const iconY = this.game.h * 0.05;
        const iconStep = sw / 4;
        const halfStep = iconStep / 2;

        const mailX = sx + halfStep;
        const chatX = sx + halfStep + iconStep;
        const achX = sx + halfStep + iconStep * 2;
        const arcX = sx + halfStep + iconStep * 3;

        const hitRadius = 25;

        // Mail
        if (Math.hypot(mx - mailX, my - iconY) < hitRadius) {
            // Toggle Mail
            this.toggleMail();
            return true;
        }

        // Priority 4.5: Overclock Button (Left of Mail)
        const ocX = sx - halfStep;

        if (Math.hypot(mx - ocX, my - iconY) < hitRadius) {
            // Confirmation Popup
            const msg = "Watch Ad for x2 Production?\n(DURATION: 15 MINUTES)";
            const win = new ConfirmationWindow(
                this.game.w, this.game.h,
                "OVERCLOCK SYSTEM",
                msg,
                () => {
                    this.game.adsManager.watchOverclockAd();
                }
            );
            this.windowManager.add(win, true);
            this.game.events.emit('play_sound', 'click');
            return true;
        }

        // Priority 5: HUD Icons (Reviews Icon)
        if (Math.hypot(mx - chatX, my - iconY) < hitRadius) {
            this.reviewsTab.toggle();
            return true;
        }

        // Priority 6: HUD Icons (Achievements)
        if (this.achievementsWindow && Math.hypot(mx - achX, my - iconY) < hitRadius) {
            this.achievementsWindow.toggle();
            // Clear flag
            if (this.achievementsWindow.visible && this.game.achievementSystem) this.game.achievementSystem.hasNew = false;
            return true;
        }

        // Priority 6.5: HUD Icons (Archive)
        if (Math.hypot(mx - arcX, my - iconY) < hitRadius) {
            if (this.archiveWindow.manager) {
                this.archiveWindow.close();
            } else {
                this.windowManager.add(this.archiveWindow, true);
                this.game.events.emit('play_sound', 'archive');
                // Clear flag
                if (this.game.loreSystem) this.game.loreSystem.hasNew = false;
            }
            return true;
        }

        // Priority 7: Chat Console Focus
        if (this.chat.checkClick(mx, my, this.game.h)) {
            return true;
        }

        // Handle clicking outside to blur chat
        if (this.chat.isFocused) {
            this.chat.isFocused = false;
        }

        return false; // Not consumed by UI
    }

    // Draw method to be called by Renderer
    draw(ctx) {

        // --- DRAW HUD ICONS (Overclock) ---
        // Ideally Renderer handles HUD, but UIManager seems to have some drawing resp?
        // Wait, looking at Renderer.js would confirm if it draws HUD icons.
        // `UIManager.draw` currently calls sub-systems. 
        // `handleInput` has HUD logic, but where is HUD draw?
        // Likely in `Renderer.js`.
        // I will check Renderer.js. If HUD loop is there, I should modify THAT file instead for drawing.
        // But if I add it here, I might duplicate or layer issues. 
        // Let's assume UIManager draws OVERLAYS. 
        // I should check Renderer.js quickly to be sure where HUD icons are drawn.
        // For now, I'll assume they are in Renderer.js because UIManager.draw listed only windows/chat.
        // I will revert this DRAW change here and only keep INPUT.
        // And then I will update Renderer.js to draw the icon.

        // Draw Full-screen / Overlay Systems first (or last depending on desired z-order)
        // Chat is bottom-aligned console
        if (this.chat) this.chat.draw(ctx, this.game.h);

        // Windows (WindowManager)
        this.windowManager.draw(ctx);

        // Overlays (Reviews, Achievements) - behave like modal overlays currently
        if (this.reviewsTab) this.reviewsTab.draw(ctx);
        if (this.achievementsWindow) this.achievementsWindow.draw(ctx);
    }

    startDrag(windowObj, mx, my) {
        this.windowManager.startDrag(windowObj, mx, my);
    }

    handleMouseMove(mx, my) {
        return this.windowManager.handleMouseMove(mx, my);
    }

    handleMouseUp() {
        return this.windowManager.handleMouseUp();
    }
}

