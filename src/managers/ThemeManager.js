/**
 * Theme Manager
 * Handles visuals and theme-specific logic
 */
import { THEMES } from '../data/themes.js';

export class ThemeManager {
    constructor(gameState) {
        this.state = gameState;
        this.currentTheme = THEMES.rainbow_paradise;
        this.themeId = 'rainbow_paradise';
    }

    setTheme(id) {
        if (!THEMES[id]) {
            console.error(`Theme ${id} not found`);
            return;
        }
        this.themeId = id;
        this.currentTheme = THEMES[id];

        // Notify others if needed via state or event
        // But for now, styling is pulled from here

        // Apply global styles if any
        document.body.style.background = this.currentTheme.colors.bg || '#000';
    }

    getColors() {
        return this.currentTheme.colors;
    }

    // Logic for specific mechanics could go here or in a System
    // e.g. "Is this theme glitchy?"
}
