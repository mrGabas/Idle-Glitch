/**
 * UI MANAGER
 * Handles all UI window states, interactions, and updates.
 */
import { ChatSystem } from '../ui/chat.js';
import { ReviewsTab } from '../ui/reviewsTab.js';
import { MailWindow, NotepadWindow } from '../ui/windows.js';

import { MailSystem } from '../systems/MailSystem.js';

export class UIManager {
    constructor(game) {
        this.game = game; // Reference to main game

        // Initialize Sub-Systems
        this.chat = new ChatSystem(game);
        this.reviewsTab = new ReviewsTab(game);

        // Mail System
        this.mail = new MailSystem(game, this.chat);
        this.mailWindow = new MailWindow(game.w, game.h, this.mail);

        this.activeNotepad = null;
    }

    resize(w, h) {
        if (this.mailWindow) this.mailWindow.resize(w, h);
        if (this.reviewsTab) this.reviewsTab.resize(); // ReviewsTab gets dims from game ref, but calling resize updates its relative position
    }

    update(dt) {
        const corruption = this.game.state.corruption;

        this.chat.update(dt, corruption);
        this.reviewsTab.update(dt);

        // Notepad Shake Effect Update
        // (Previously done in Game.draw or window.draw, but logic can be here)
        // Actually, NotepadWindow.draw handles the visual shake logic using its own properties.
        // Game.update didn't explicitly update activeNotepad, it just checked things.
        // We can leave visual update in draw or add state update here if needed.
    }

    openNotepad(content, options = {}) {
        this.activeNotepad = new NotepadWindow(this.game.w, this.game.h, content, options);
        if (options.title) this.activeNotepad.title = options.title;
        this.game.events.emit('play_sound', 'click');
    }

    handleInput(mx, my) {
        // Priority 1: Notepad (Modal-like top layer)
        if (this.activeNotepad) {
            // Check if click closes it
            const close = this.activeNotepad.checkClick(mx, my);
            if (close) {
                this.activeNotepad = null;
            }
            return true; // Block other inputs while notepad is open
        }

        // Priority 2: Reviews Tab
        if (this.reviewsTab.visible) {
            // checkClick handles close logic internal to the class or returns true if consumed
            // ReviewsTab.checkClick returns true if consumed, and toggles visibility if close clicked.
            if (this.reviewsTab.checkClick(mx, my)) {
                return true;
            }
        }

        // Priority 3: Mail Window
        if (this.mailWindow.active) {
            if (this.mailWindow.checkClick(mx, my)) {
                return true;
            }
        }

        // Priority 4: HUD Icons (Mail Icon)
        // Center: w-50, 50. Size: ~40x40 hit area
        if (Math.hypot(mx - (this.game.w - 50), my - 50) < 25) {
            this.mailWindow.active = !this.mailWindow.active;
            this.game.events.emit('play_sound', 'click');
            return true;
        }

        // Priority 5: HUD Icons (Reviews Icon)
        // Center: w-50, 110.
        if (Math.hypot(mx - (this.game.w - 50), my - 110) < 25) {
            this.reviewsTab.toggle();
            return true;
        }

        // Priority 6: Chat Console Focus
        // Pass 'h' because chat position depends on bottom align
        if (this.chat.checkClick(mx, my, this.game.h)) {
            return true;
        }

        return false; // Not consumed by UI
    }
}
