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
     * Cleanup resources.
     */
    destroy() {
        // Unsubscribe events if any
    }

    /**
     * Updates window logic.
     * @param {number} dt 
     */
    update(dt) {
        // Override me
    }

    /**
     * Called when mouse wheel event is propagated.
     * @param {number} deltaY 
     */
    onScroll(deltaY) {
        // Override me
    }

    /**
     * Draws the window.
     * @param {CanvasRenderingContext2D} ctx 
     */
    /**
     * Draws the window frame and delegates content drawing.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // Main geometric frame
        ctx.fillStyle = '#c0c0c0'; // Win95 Grey
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Bevel borders (High Light)
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.w, 2); // Top
        ctx.fillRect(this.x, this.y, 2, this.h); // Left

        // Bevel borders (Shadow)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + this.w - 2, this.y, 2, this.h); // Right
        ctx.fillRect(this.x, this.y + this.h - 2, this.w, 2); // Bottom

        // Inner Bevel (Darker Grey)
        ctx.fillStyle = '#dfdfdf';
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 1);
        ctx.fillRect(this.x + 2, this.y + 2, 1, this.h - 4);

        ctx.fillStyle = '#808080';
        ctx.fillRect(this.x + this.w - 3, this.y + 2, 1, this.h - 4);
        ctx.fillRect(this.x + 2, this.y + this.h - 3, this.w - 4, 1);

        // Title Bar
        // Active vs Inactive colors could be added here if we track focus state more deeply
        const titleBarColor = this.manager && this.manager.windows[this.manager.windows.length - 1] === this
            ? '#000080' // Active Blue
            : '#808080'; // Inactive Grey

        ctx.fillStyle = titleBarColor;
        ctx.fillRect(this.x + 3, this.y + 3, this.w - 6, 18);

        // Title Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, this.x + 6, this.y + 16);

        // Close Button
        if (this.isClosable) {
            this.drawBevelButton(ctx, this.x + this.w - 19, this.y + 5, 14, 14, "X");
        }

        // Draw Content
        this.drawContent(ctx, this.x + 4, this.y + 24, this.w - 8, this.h - 28);
    }

    /**
     * Helper to draw a beveled button
     */
    drawBevelButton(ctx, x, y, w, h, text) {
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(x, y, w, h);

        // Bevel
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, y, w, 1);
        ctx.fillRect(x, y, 1, h);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + w - 1, y, 1, h);
        ctx.fillRect(x, y + h - 1, w, 1);

        if (text) {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, x + w / 2, y + h / 2 + 1);
        }
    }

    /**
     * Draw specific window content. Override this.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} x - Content area x
     * @param {number} y - Content area y
     * @param {number} w - Content area width
     * @param {number} h - Content area height
     */
    drawContent(ctx, x, y, w, h) {
        // Default content placeholder
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

        // Close Button Check
        if (this.isClosable) {
            const bx = this.x + this.w - 19;
            const by = this.y + 5;
            if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
                return 'close';
            }
        }

        // Title Bar Drag (Height is roughly 24 including borders)
        if (this.isDraggable && my >= this.y && my < this.y + 24) {
            return 'drag';
        }

        return 'consumed';
    }
}
