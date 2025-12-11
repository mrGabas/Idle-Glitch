/**
 * Base Window Class
 * Handles common logic for all UI windows.
 */
export class Window {
    constructor(x, y, w, h, title) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.title = title || "Window";

        this.active = true;
        this.isDraggable = true;
        this.isClosable = true;

        // Reference to manager (set when added)
        this.manager = null;
    }

    /**
     * Called when window is closed (before removal).
     */
    onClose() {
        // Override me
    }

    /**
     * Bring this window to the front.
     */
    focus() {
        if (this.manager) {
            this.manager.focus(this);
        }
    }

    /**
     * Close this window.
     */
    close() {
        if (this.manager) {
            this.manager.close(this);
        } else {
            this.active = false; // Fallback
        }
    }

    /**
     * Updates window logic.
     * @param {number} dt 
     */
    update(dt) {
        // Override me
    }

    /**
     * Draws the window.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        // Override me
        // Default box for debugging
        ctx.fillStyle = '#ccc';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#000';
        ctx.fillText(this.title, this.x + 5, this.y + 15);
    }

    /**
     * Checks interactions with the window.
     * @param {number} mx - Mouse X
     * @param {number} my - Mouse Y
     * @returns {string|null} - 'drag', 'close', 'consumed', or null
     */
    checkClick(mx, my) {
        if (!this.active) return null;

        // Bounding box check
        if (mx < this.x || mx > this.x + this.w || my < this.y || my > this.y + this.h) {
            return null;
        }

        // Close Button (Fixed position relative to top-right)
        // Adjust these coords to match your specific window styling if needed,
        // but base class should have a consistent area if it draws the frame.
        // Assuming Standard Windows 95 style: Right edge - 18px
        if (this.isClosable) {
            const bx = this.x + this.w - 18;
            const by = this.y + 4;
            if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
                return 'close';
            }
        }

        // Title Bar Drag
        if (this.isDraggable && my < this.y + 24) {
            return 'drag';
        }

        return 'consumed';
    }
}
