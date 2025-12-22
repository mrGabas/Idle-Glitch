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
        const fullKey = this.prefix + key;
        const stringData = JSON.stringify(data);

        // 1. Primary: CrazyGames Cloud Save
        try {
            if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.data) {
                window.CrazyGames.SDK.data.setItem(fullKey, stringData);
            }
        } catch (e) {
            console.warn('Cloud save failed:', e);
        }

        // 2. Secondary: LocalStorage (Backup/Offline)
        try {
            localStorage.setItem(fullKey, stringData);
        } catch (e) {
            console.error('Local save failed:', e);
        }
    }

    load(key, defaultData) {
        const fullKey = this.prefix + key;

        // 1. Primary: Try CrazyGames Cloud Save
        try {
            if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.data) {
                const cloudData = window.CrazyGames.SDK.data.getItem(fullKey);
                if (cloudData !== null) {
                    return JSON.parse(cloudData);
                }
            }
        } catch (e) {
            console.warn('Cloud load failed, falling back to local:', e);
        }

        // 2. Secondary: Fallback to LocalStorage
        try {
            const localData = localStorage.getItem(fullKey);
            return localData !== null ? JSON.parse(localData) : defaultData;
        } catch (e) {
            console.error('Local load failed:', e);
            return defaultData;
        }
    }

    // Legacy support for plain strings if needed, or helper for numbers
    // Legacy support for plain strings if needed, or helper for numbers
    loadNumber(key, defaultValue) {
        return this.load(key, defaultValue);
    }

    saveNumber(key, value) {
        this.save(key, value);
    }
}
