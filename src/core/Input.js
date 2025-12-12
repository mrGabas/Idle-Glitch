/**
 * INPUT HANDLING SYSTEM
 * @module core/Input
 */

export class InputHandler {
    constructor(target) {
        this.target = target || window;

        // State
        this.x = 0;
        this.y = 0;
        this.isDown = false;
        this.keys = {}; // Current frame raw keys
        this.prevKeys = {}; // Previous frame raw keys (for pressed check)

        // Virtual Buttons (for mobile/touch)
        this.virtualButtons = {};
        this.prevVirtualButtons = {};

        // Action Map
        this.actions = {
            'UP': ['ArrowUp', 'KeyW'],
            'DOWN': ['ArrowDown', 'KeyS'],
            'LEFT': ['ArrowLeft', 'KeyA'],
            'RIGHT': ['ArrowRight', 'KeyD'],
            'CONFIRM': ['Enter', 'Space'],
            'CANCEL': ['Escape'],
            'PAUSE': ['KeyP']
        };

        // Context
        this.context = 'global';

        // Events
        this.listeners = {};

        this._bindEvents();
    }

    _bindEvents() {
        // Mouse
        window.addEventListener('mousemove', (e) => this._onMouseMove(e));
        window.addEventListener('mousedown', (e) => this._onMouseDown(e));
        window.addEventListener('mouseup', (e) => this._onMouseUp(e));
        window.addEventListener('wheel', (e) => this._onWheel(e));

        // Keyboard
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Window
        window.addEventListener('resize', (e) => this._onResize(e));
        document.addEventListener('visibilitychange', (e) => this.emit('visibilitychange', e));
    }

    /**
     * Updates input state. Call this once per frame.
     */
    update() {
        // Store current keys as previous for next frame's "pressed" check
        this.prevKeys = { ...this.keys };
        this.prevVirtualButtons = { ...this.virtualButtons };
        // We do shallow copy. 
        // Note: usage of isActionPressed depends on calling update() at end of frame or start.
    }

    /**
     * Checks if an action is currently held down.
     * @param {string} actionName 
     * @returns {boolean}
     */
    isActionDown(actionName) {
        // Check Virtual Button
        if (this.virtualButtons[actionName]) return true;

        const keys = this.actions[actionName];
        if (!keys) return false;

        return keys.some(k => this.keys[k]);
    }

    /**
     * Checks if an action was just pressed this frame.
     * @param {string} actionName 
     * @returns {boolean}
     */
    isActionPressed(actionName) {
        // Check Virtual Button
        if (this.virtualButtons[actionName] && !this.prevVirtualButtons[actionName]) return true;

        const keys = this.actions[actionName];
        if (!keys) return false;

        return keys.some(k => this.keys[k] && !this.prevKeys[k]);
    }


    /**
     * Sets the state of a virtual button.
     * @param {string} actionName 
     * @param {boolean} active 
     */
    setVirtualButtonState(actionName, active) {
        this.virtualButtons[actionName] = active;
        // If we want to simulate key events for other systems:
        // this.emit(active ? 'keydown' : 'keyup', { key: 'Virtual' + actionName });
    }

    /**
     * Sets the input context.
     * @param {string} context 
     */
    setContext(context) {
        if (this.context !== context) {
            this.context = context;
            this.emit('contextchange', context);
        }
    }

    getPressedKeys() {
        const pressed = new Set();
        for (const code in this.keys) {
            if (this.keys[code] && !this.prevKeys[code]) {
                pressed.add(code);
            }
        }
        return Array.from(pressed);
    }

    _onMouseMove(e) {
        this.x = e.clientX;
        this.y = e.clientY;
        this.emit('mousemove', e);
    }

    _onMouseDown(e) {
        this.isDown = true;
        this.emit('mousedown', e);
    }

    _onMouseUp(e) {
        this.isDown = false;
        this.emit('mouseup', e);
    }

    _onWheel(e) {
        this.emit('wheel', e);
    }

    _onKeyDown(e) {
        // Prevent default scrolling for game keys if needed
        if (['ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
            // e.preventDefault(); // Optional, might block browser scrolling
        }
        this.keys[e.key] = true;
        this.keys[e.code] = true; // Store code too for position-independent check (KeyW vs w)
        this.emit('keydown', e);
    }

    _onKeyUp(e) {
        this.keys[e.key] = false;
        this.keys[e.code] = false;
        this.emit('keyup', e);
    }

    _onResize(e) {
        this.emit('resize', e);
    }

    // Simple Event Emitter
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}
