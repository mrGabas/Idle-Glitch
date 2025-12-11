/**
 * UI MANAGER
 * Handles all UI window states, interactions, and updates.
 */
import { ChatSystem } from '../ui/chat.js';
import { ReviewsTab } from '../ui/reviewsTab.js';
import { MailWindow, NotepadWindow } from '../ui/windows.js';
import { AchievementsWindow } from '../ui/achievementsWindow.js';

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

        this.achievementsWindow = new AchievementsWindow(game);

        this.activeNotepad = null;

        // Dragging State
        this.draggedWindow = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    resize(w, h) {
        if (this.mailWindow) this.mailWindow.resize(w, h);
        if (this.reviewsTab) this.reviewsTab.resize();
        if (this.achievementsWindow) this.achievementsWindow.resize();
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
        // Priority 1: Notepad (Modal-like top layer)
        if (this.activeNotepad) {
            // Check Title Bar for Drag
            if (my >= this.activeNotepad.y && my <= this.activeNotepad.y + 24 && mx >= this.activeNotepad.x && mx <= this.activeNotepad.x + this.activeNotepad.w) {
                // But wait, check close button first? Close button is inside the window area usually right aligned.
                // Let's defer to window.checkClick, but we need to know if it was a capture or a close.
            }

            // Check if click closes it
            const res = this.activeNotepad.checkClick(mx, my);
            if (res === 'close') {
                this.activeNotepad = null;
                return true;
            } else if (res === 'drag') {
                this.startDrag(this.activeNotepad, mx, my);
                return true;
            } else if (res) {
                return true;
            }

            // If click was outside, do we close? No, modal stays open usually? 
            // Or maybe click blocking?
            // "Modal-like top layer" -> Blocks everything.
            // But if we clicked outside, we still return true?
            // Original code: `return true;`. So yes, modal blocks everything.
            return true;
        }

        // Priority 2: Reviews Tab
        if (this.reviewsTab.visible) {
            // checkClick handles close logic internal to the class or returns true if consumed
            // ReviewsTab.checkClick returns true if consumed, and toggles visibility if close clicked.
            if (this.reviewsTab.checkClick(mx, my)) {
                return true;
            }
        }

        // Priority 2.5: Achievements Window
        if (this.achievementsWindow && this.achievementsWindow.visible) {
            if (this.achievementsWindow.checkClick(mx, my)) {
                return true;
            }
        }

        // Priority 3: Mail Window
        // Priority 3: Mail Window
        if (this.mailWindow.active) {
            const res = this.mailWindow.checkClick(mx, my);
            if (res === 'close') {
                this.mailWindow.active = false;
                return true;
            } else if (res === 'drag') {
                this.startDrag(this.mailWindow, mx, my);
                return true;
            } else if (res) {
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

        // Priority 6: HUD Icons (Achievements)
        // Center: w-50, 170
        if (this.achievementsWindow && Math.hypot(mx - (this.game.w - 50), my - 170) < 25) {
            this.achievementsWindow.toggle();
            return true;
        }

        // Priority 6: Chat Console Focus
        // Pass 'h' because chat position depends on bottom align
        if (this.chat.checkClick(mx, my, this.game.h)) {
            return true;
        }

        return false; // Not consumed by UI
    }

    startDrag(windowObj, mx, my) {
        this.draggedWindow = windowObj;
        this.dragOffsetX = mx - windowObj.x;
        this.dragOffsetY = my - windowObj.y;
    }

    handleMouseMove(mx, my) {
        if (this.draggedWindow) {
            this.draggedWindow.x = mx - this.dragOffsetX;
            this.draggedWindow.y = my - this.dragOffsetY;

            // Clamp to screen
            // Basic clamping
            /*
            if (this.draggedWindow.x < 0) this.draggedWindow.x = 0;
            if (this.draggedWindow.y < 0) this.draggedWindow.y = 0;
            if (this.draggedWindow.x + this.draggedWindow.w > this.game.w) this.draggedWindow.x = this.game.w - this.draggedWindow.w;
            if (this.draggedWindow.y + this.draggedWindow.h > this.game.h) this.draggedWindow.y = this.game.h - this.draggedWindow.h;
            */
            return true;
        }
        return false;
    }

    handleMouseUp() {
        if (this.draggedWindow) {
            this.draggedWindow = null;
            return true;
        }
        return false;
    }
}
