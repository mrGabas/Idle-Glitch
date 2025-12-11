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
        this.keys = {};

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

    _onMouseMove(e) {
        // We will store raw client coordinates. 
        // Conversions to canvas space should happen where needed or we can pass a reference element.
        // For now, raw.
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
        this.keys[e.key] = true;
        this.emit('keydown', e);
    }

    _onKeyUp(e) {
        this.keys[e.key] = false;
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
