/**
 * Window Manager
 * Handles Z-ordering, focus, and updates for all windows.
 */
import { Debris } from '../entities/particles.js';

export class WindowManager {
    constructor(game) {
        this.game = game;
        /** @type {import('../ui/Window.js').Window[]} */
        this.windows = [];

        this.draggedWindow = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Content Drag/Scroll Tracking
        this.potentialScrollWindow = null;
        this.scrollStartX = 0;
        this.scrollStartY = 0;
        this.isDragScrolling = false;
        this.dragThreshold = 5; // Pixels
        this.lastScrollY = 0;
    }

    /**
     * Adds a new window to the stack (focused).
     * @param {import('../ui/Window.js').Window} window 
     */
    add(window, silent = false) {
        window.manager = this;
        this.windows.push(window);
        if (!silent) this.game.events.emit('play_sound', 'click');
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
            if (this.potentialScrollWindow === window) {
                this.potentialScrollWindow = null;
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

    /**
     * Checks if there's any active window that requires exclusive input.
     * @returns {boolean}
     */
    hasActiveInputWindow() {
        if (this.windows.length === 0) return false;

        const top = this.windows[this.windows.length - 1];
        if (top.constructor.name === 'MinigameWindow') return true;

        return false;
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
                // UNIVERSAL DESTRUCTION: Windows
                if (this.game.canTriggerDestruction) {
                    this.game.events.emit('play_sound', 'break');
                    // Visuals
                    const cx = win.x + win.w / 2;
                    const cy = win.y + win.h / 2;
                    for (let k = 0; k < 5; k++) this.game.entities.add('debris', new Debris(cx, cy, '#fff'));

                    this.close(win);
                    return true;
                }

                // Determine action
                if (res === 'close') {
                    this.close(win);
                } else if (res === 'drag') {
                    this.focus(win); // Bring to front on drag start
                    this.startDrag(win, mx, my);
                } else if (res === 'consumed') {
                    this.focus(win); // Bring to front on click

                    // START POTENTIAL DRAG SCROLL
                    this.potentialScrollWindow = win;
                    this.scrollStartX = mx;
                    this.scrollStartY = my;
                    this.isDragScrolling = false;
                    this.lastScrollY = my;

                    // Do NOT execute action here. Wait for MouseUp.
                }
                return true; // Input blocked by this window
            }
        }
        return false;
    }

    /**
     * Handles Mouse Wheel. Iterates Top-Down.
     * @param {number} deltaY
     * @returns {boolean} True if input was consumed
     */
    handleWheel(deltaY) {
        // Iterate backwards (Top windows first)
        for (let i = this.windows.length - 1; i >= 0; i--) {
            const win = this.windows[i];
            if (win.active && win.onScroll) {
                win.onScroll(deltaY);
                return true;
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
        let consumed = false;

        // 1. Handle Window Drag (Moving the window itself)
        if (this.draggedWindow) {
            this.draggedWindow.x = mx - this.dragOffsetX;
            this.draggedWindow.y = my - this.dragOffsetY;
            consumed = true;
        }

        // 2. Handle Content Drag (Scrolling)
        if (this.potentialScrollWindow) {
            // Only scroll if window HAS scroll capability
            if (this.potentialScrollWindow.onScroll) {
                const dy = my - this.scrollStartY;
                const dx = mx - this.scrollStartX; // Track for threshold

                // Check threshold
                if (!this.isDragScrolling) {
                    if (Math.hypot(dx, dy) > this.dragThreshold) {
                        this.isDragScrolling = true;
                        this.lastScrollY = my; // Reset to avoid jump
                    }
                }

                if (this.isDragScrolling) {
                    const deltaY = this.lastScrollY - my; // Drag Down -> delta negative -> scroll decreases (move up?)
                    // Wait, standard wheel: Wheel Down (Positive) -> Scroll Offset Increases -> Content Moves UP (View moves down)
                    // Drag Mouse Down (Active Move): I want to pull the paper DOWN. Content Moves DOWN. 
                    // So View moves UP. Scroll Offset DECREASES.
                    // Drag Down => my increases => (last - my) is negative.
                    // deltaY negative -> Scroll Offset decreases.

                    // Multiplier for feel
                    this.potentialScrollWindow.onScroll(deltaY);

                    this.lastScrollY = my;
                    consumed = true;
                }
            }
        }

        return consumed;
    }

    handleMouseUp() {
        // Window Drag
        if (this.draggedWindow) {
            this.draggedWindow = null;
            return true;
        }

        // Content Drag/Click
        if (this.potentialScrollWindow) {
            const win = this.potentialScrollWindow;

            // If it WASN'T a drag scroll, treat as Click
            if (!this.isDragScrolling) {
                // We use game input coordinates because handleMouseUp doesn't always get args depending on caller,
                // but usually we rely on current state.
                const mx = this.game.input.x;
                const my = this.game.input.y;
                win.onContentClick(mx, my);
            }

            this.potentialScrollWindow = null;
            this.isDragScrolling = false;
            return true;
        }

        return false;
    }
}
