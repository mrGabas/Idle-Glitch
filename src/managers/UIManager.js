/**
 * UI MANAGER
 * Handles all UI window states, interactions, and updates.
 */
import { ChatSystem } from '../ui/chat.js';
import { ReviewsTab } from '../ui/reviewsTab.js';
import { MailWindow, NotepadWindow } from '../ui/windows.js';
import { ArchiveWindow, ImageViewerWindow } from '../ui/ArchiveWindow.js';
import { MinigameWindow } from '../ui/MinigameWindow.js';
import { AchievementsWindow } from '../ui/achievementsWindow.js';

import { MailSystem } from '../systems/MailSystem.js';
import { WindowManager } from './WindowManager.js';
import { assetLoader } from '../core/AssetLoader.js';

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
        // Create MailWindow instance but don't add to windowManager yet (until opened)
        // Actually, let's keep it managed by us and add/remove when toggled.
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
        // WindowManager windows might need resize too?
        // Basic windows handle it manually or stay relative.
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

        this.windowManager.add(notepad);
        // this.game.events.emit('play_sound', 'click'); // WindowManager.add plays click
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
        } else if (data.mediaType === 'image') {
            // Open Image Viewer
            const win = new ImageViewerWindow(this.game.w, this.game.h, data.src, data.name);
            this.windowManager.add(win);
        }
    }

    // Toggle Mail
    toggleMail() {
        if (this.mailWindow.manager) {
            this.mailWindow.close(); // Calls this.manager.close
            // If MailWindow active flag logic is inside it? 
            // We changed MailWindow to extend Window.
            // If it's already in manager, close() removes it.
            // If it's not (but active=false), we add it.

            // Wait, logic in MailWindow.draw was 'if (!active) return'.
            // Now WindowManager controls drawing list.
            // So 'active' property on Window is slightly redundant if removal from list handles it.
            // But let's check:
            // If we use 'active' bool to toggle presence in manager:
            // This is complex if we use the same instance.
            // WindowManager.close removes it. So we can add it back.
        } else {
            this.mailWindow.active = true;
            this.windowManager.add(this.mailWindow);
        }
    }

    // Actually, MailWindow might need special handling because we want to keep the same instance.
    // WindowManager.close calls onClose.
    // If we just want to hide/show, we can add/remove.

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

        // Priority 4: HUD Icons (Mail Icon)
        if (Math.hypot(mx - (this.game.w - 50), my - 50) < 25) {
            // Toggle Mail
            if (this.mailWindow.manager) {
                this.mailWindow.close();
            } else {
                this.mailWindow.active = true;
                this.windowManager.add(this.mailWindow);
            }
            // this.game.events.emit('play_sound', 'click'); // Add does it
            return true;
        }

        // Priority 5: HUD Icons (Reviews Icon)
        if (Math.hypot(mx - (this.game.w - 50), my - 110) < 25) {
            this.reviewsTab.toggle();
            return true;
        }

        // Priority 6: HUD Icons (Achievements)
        if (this.achievementsWindow && Math.hypot(mx - (this.game.w - 50), my - 170) < 25) {
            this.achievementsWindow.toggle();
            return true;
        }

        // Priority 6.5: HUD Icons (Archive)
        // Only if unlocked? Or always visible? Let's make it always visible for now or check lore unlocked count?
        if (Math.hypot(mx - (this.game.w - 50), my - 230) < 25) {
            if (this.archiveWindow.manager) {
                this.archiveWindow.close();
            } else {
                this.windowManager.add(this.archiveWindow);
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

