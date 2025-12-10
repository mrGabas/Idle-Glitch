/**
 * Input Handling Module
 * Decouples DOM events from Game Logic.
 */
export class InputHandler {
    constructor(targetElement) {
        this.target = targetElement || window;

        // State
        this.mouse = { x: 0, y: 0, down: false };
        this.realMouse = { x: 0, y: 0 }; // For raw tracking without game scaling
        this.keys = {}; // keys[code] = boolean

        // Events
        this.resizeCallbacks = [];

        // Mouse History for lag effects
        this.mouseHistory = [];

        this._bindEvents();
    }

    _bindEvents() {
        // Mouse / Pointer
        window.addEventListener('mousemove', (e) => this._onMouseMove(e));
        window.addEventListener('mousedown', (e) => this._onMouseDown(e));
        window.addEventListener('mouseup', (e) => this._onMouseUp(e));

        // Keyboard
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Window
        window.addEventListener('resize', () => this._onResize());
    }

    _onMouseMove(e) {
        // We might need to adjust for canvas offset if not full screen, 
        // strictly speaking usually we pass a canvas ref or bounding rect getter.
        // For now, assume full screen or handled by game loop using clientX/Y.

        this.realMouse.x = e.clientX;
        this.realMouse.y = e.clientY;

        // If we want game-space coordinates (relative to canvas), the Game or Renderer 
        // should adjust `this.mouse` or we pass the canvas rect.
        // Let's store raw here and let systems map it.
        // BUT, for compatibility with existing logic:

        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Track history
        this.mouseHistory.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        if (this.mouseHistory.length > 200) this.mouseHistory.shift();
    }

    _onMouseDown(e) {
        this.mouse.down = true;
    }

    _onMouseUp(e) {
        this.mouse.down = false;
    }

    _onKeyDown(e) {
        this.keys[e.key] = true;
    }

    _onKeyUp(e) {
        this.keys[e.key] = false;
    }

    _onResize() {
        this.resizeCallbacks.forEach(cb => cb());
    }

    // --- Public API ---

    /**
     * Check if a key is held down
     * @param {string} key 
     */
    isDown(key) {
        return !!this.keys[key];
    }

    /**
     * Register resize handler
     */
    onResize(cb) {
        this.resizeCallbacks.push(cb);
    }

    /**
     * Transforms raw mouse coordinates based on a container
     * @param {HTMLElement} element 
     */
    updateMouseRelative(element) {
        const rect = element.getBoundingClientRect();
        this.mouse.x = this.realMouse.x - rect.left;
        this.mouse.y = this.realMouse.y - rect.top;
    }
}
