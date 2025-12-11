/**
 * Window Manager
 * Handles Z-ordering, focus, and updates for all windows.
 */
export class WindowManager {
    constructor(game) {
        this.game = game;
        /** @type {import('../ui/Window.js').Window[]} */
        this.windows = [];

        this.draggedWindow = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
    }

    /**
     * Adds a new window to the stack (focused).
     * @param {import('../ui/Window.js').Window} window 
     */
    add(window) {
        window.manager = this;
        this.windows.push(window);
        this.game.events.emit('play_sound', 'click');
    }

    /**
     * Removes a window from the stack.
     * @param {import('../ui/Window.js').Window} window 
     */
    close(window) {
        const idx = this.windows.indexOf(window);
        if (idx !== -1) {
            window.onClose();
            this.windows.splice(idx, 1);
            window.manager = null;
            if (this.draggedWindow === window) {
                this.draggedWindow = null;
            }
        }
    }

    /**
     * Brings a window to the front.
     * @param {import('../ui/Window.js').Window} window 
     */
    focus(window) {
        const idx = this.windows.indexOf(window);
        if (idx !== -1 && idx !== this.windows.length - 1) {
            this.windows.splice(idx, 1);
            this.windows.push(window);
        }
    }

    /**
     * Helper to find specific window type (e.g. for VirtualControls)
     * @param {Function} typeClass 
     */
    getWindow(typeClass) {
        return this.windows.find(w => w instanceof typeClass);
    }

    update(dt) {
        // Update all windows
        this.windows.forEach(w => w.update(dt, this.game));
    }

    draw(ctx) {
        // Draw from bottom to top
        this.windows.forEach(w => w.draw(ctx));
    }

    /**
     * Handles Input. Iterates Top-Down.
     * @returns {boolean} True if input was consumed.
     */
    handleInput(mx, my) {
        // Iterate backwards (Top windows first)
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const win = this.windows[i];
            const res = win.checkClick(mx, my);

            if (res) {
                // Determine action
                if (res === 'close') {
                    this.close(win);
                } else if (res === 'drag') {
                    this.focus(win); // Bring to front on drag start
                    this.startDrag(win, mx, my);
                } else if (res === 'consumed') {
                    this.focus(win); // Bring to front on click
                }
                return true; // Input blocked by this window
            }
        }
        return false;
    }

    startDrag(win, mx, my) {
        this.draggedWindow = win;
        this.dragOffsetX = mx - win.x;
        this.dragOffsetY = my - win.y;
    }

    handleMouseMove(mx, my) {
        if (this.draggedWindow) {
            this.draggedWindow.x = mx - this.dragOffsetX;
            this.draggedWindow.y = my - this.dragOffsetY;

            // Simple clamping
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
