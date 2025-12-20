/**
 * LORE SYSTEM
 * Handles persistence and state of the Data Archive
 * @module systems/LoreSystem
 */
import { LORE_DB } from '../data/loreData.js';
import { THEME_ORDER } from '../data/themes.js';
import { UTILS } from '../core/config.js';

export class LoreSystem {
    constructor(game) {
        this.game = game;
        this.unlockedFiles = []; // Array of file IDs
        this.unlockedFolders = []; // Array of folder keys
        this.discoveredFolders = []; // Array of visible folder keys (persisted)
        this.newFileIds = []; // Track IDs of unviewed files
        this.acknowledgedLockedFolders = []; // Track locked folders clicked by user
        this.hasNew = false; // Legacy/Aggregate flag
    }

    /**
     * Loads the lore state from the save system.
     * @param {Object} data - Saved data object
     */
    load(data) {
        if (data) {
            this.unlockedFiles = data.unlockedFiles || [];
            this.unlockedFolders = data.unlockedFolders || [];
            this.discoveredFolders = data.discoveredFolders || [];
            this.newFileIds = data.newFileIds || [];
            this.acknowledgedLockedFolders = data.acknowledgedLockedFolders || [];
            this.hasNew = this.newFileIds.length > 0;
        }
    }

    /**
     * returns the data object to be saved.
     * @returns {Object}
     */
    getSaveData() {
        return {
            unlockedFiles: this.unlockedFiles,
            unlockedFolders: this.unlockedFolders,
            discoveredFolders: this.discoveredFolders,
            newFileIds: this.newFileIds,
            acknowledgedLockedFolders: this.acknowledgedLockedFolders
        };
    }

    /**
     * Unlocks a specific file ID.
     * @param {string} id 
     * @returns {boolean} True if newly unlocked
     */
    unlockFile(id) {
        if (!this.unlockedFiles.includes(id)) {
            this.unlockedFiles.push(id);
            this.newFileIds.push(id);
            this.hasNew = true;
            this.game.uiManager.chat.addMessage('SYSTEM', `NEW DATA ACQUIRED: ${this.getFileName(id)}`);
            this.game.events.emit('play_sound', 'startup');
            this.game.saveGame(); // Trigger auto-save or ensure state is marked dirty
            return true;
        }
        return false;
    }

    /**
     * Unlocks a specific folder key.
     * @param {string} key 
     */
    unlockFolder(key) {
        if (!this.unlockedFolders.includes(key)) {
            this.unlockedFolders.push(key);
            // Remove from acknowledged list so badge can reappear if needed
            const idx = this.acknowledgedLockedFolders.indexOf(key);
            if (idx !== -1) this.acknowledgedLockedFolders.splice(idx, 1);

            this.game.saveGame();
            return true;
        }
        return false;
    }

    /**
     * Checks if a file is unlocked.
     * @param {string} id 
     * @returns {boolean}
     */
    isFileUnlocked(id) {
        return this.unlockedFiles.includes(id);
    }

    markFileAsViewed(id) {
        const idx = this.newFileIds.indexOf(id);
        if (idx !== -1) {
            this.newFileIds.splice(idx, 1);
            if (this.newFileIds.length === 0) this.hasNew = false;
            this.game.saveGame();
        }
    }

    /**
     * Checks if a folder is unlocked.
     * @param {string} key 
     * @returns {boolean}
     */
    acknowledgeLockedFolder(key) {
        if (!this.acknowledgedLockedFolders.includes(key)) {
            this.acknowledgedLockedFolders.push(key);
            this.game.saveGame();
        }
    }

    /**
     * Checks if a folder is visible (discovered).
     * @param {string} key 
     * @returns {boolean}
     */
    isFolderVisible(key) {
        // 1. Check if already discovered
        if (this.discoveredFolders.includes(key)) return true;

        const folder = LORE_DB[key];
        if (!folder) return false;

        // Check Theme Requirement
        if (folder.requiredTheme) {
            const currentThemeId = this.game.themeManager.currentTheme.id;
            const currentIndex = THEME_ORDER.indexOf(currentThemeId);
            const requiredIndex = THEME_ORDER.indexOf(folder.requiredTheme);

            if (currentIndex < requiredIndex) return false;
        }

        // Check File Requirement
        if (folder.requiredFile) {
            if (!this.isFileUnlocked(folder.requiredFile)) return false;
        }

        // If we got here, it's visible. Latch it!
        this.discoveredFolders.push(key);
        this.game.saveGame();
        return true;
    }

    /**
     * Checks if a folder is unlocked.
     * @param {string} key 
     * @returns {boolean}
     */
    isFolderUnlocked(key) {
        // If folder is not locked in DB, it's always unlocked
        if (LORE_DB[key] && !LORE_DB[key].locked) return true;
        return this.unlockedFolders.includes(key);
    }

    /**
     * Validates password for a folder or file.
     * @param {string} targetId - Folder key or ID (usually folder key for now)
     * @param {string} input - User input
     * @returns {boolean}
     */
    checkPassword(targetId, input) {
        // Check Folders
        if (LORE_DB[targetId]) {
            return LORE_DB[targetId].password === input;
        }
        // Check Files (loop through all to find file?)
        // Usually files don't have individual passwords in this design, folders do.
        // But logic supports it if needed.
        return false;
    }

    /**
     * Helper to get a random uncollected file ID.
     * @param {string[]} excludeIds - IDs to exclude (optional)
     * @returns {string|null} ID or null if all collected
     */
    getUncollectedFileId(excludeIds = []) {
        // Gather all file IDs from DB
        const allFiles = [];
        Object.values(LORE_DB).forEach(folder => {
            folder.files.forEach(f => allFiles.push(f.id));
        });

        // Filter out unlocked AND excluded
        const remaining = allFiles.filter(id => !this.unlockedFiles.includes(id) && !excludeIds.includes(id));

        if (remaining.length === 0) return null;
        return UTILS.randArr(remaining);
    }

    /**
     * Helper to get file data by ID
     */
    getFile(id) {
        for (const key in LORE_DB) {
            const folder = LORE_DB[key];
            const file = folder.files.find(f => f.id === id);
            if (file) return file;
        }
        return null;
    }

    getFileName(id) {
        const f = this.getFile(id);
        return f ? f.name : "Unknown";
    }
}
