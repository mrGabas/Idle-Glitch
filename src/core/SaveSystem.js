/**
 * SAVE SYSTEM
 * Handles persistence logic
 * @module core/SaveSystem
 */
export class SaveSystem {
    constructor() {
        this.prefix = 'glitch_';
    }

    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
        } catch (e) {
            console.error('Save failed:', e);
        }
    }

    load(key, defaultData) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultData;
        } catch (e) {
            console.error('Load failed:', e);
            return defaultData;
        }
    }

    // Legacy support for plain strings if needed, or helper for numbers
    loadNumber(key, defaultValue) {
        const val = localStorage.getItem(this.prefix + key);
        return val ? parseFloat(val) : defaultValue;
    }

    saveNumber(key, value) {
        localStorage.setItem(this.prefix + key, value.toString());
    }
}
