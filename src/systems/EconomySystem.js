
import { CFG, UTILS } from '../core/config.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';

export class EconomySystem {
    /**
     * @param {import('../core/game.js').Game} game - Reference to the main Game instance.
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Updates economy logic (auto-production).
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        // Auto score gain
        if (this.game.state.autoRate > 0) {
            this.game.state.addScore(this.game.state.autoRate * dt);
        }
    }

    /**
     * Handles click interactions for the economy system (Shop, Main Button).
     * @param {number} mx - Mouse X coordinate relative to canvas.
     * @param {number} my - Mouse Y coordinate relative to canvas.
     * @returns {boolean} True if a click was handled.
     */
    handleClick(mx, my) {
        // 1. Shop Upgrades
        let shopHit = false;
        // Access upgrades via themeManager
        const upgrades = this.game.themeManager.upgrades;

        upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            // Re-calculate positions or use CFG constants directly as Game.js did
            const bx = (this.game.w / 2 - CFG.game.shop.startX) + col * CFG.game.shop.colWidth;
            const by = this.game.h / 2 + 50 + row * CFG.game.shop.rowHeight;

            if (mx >= bx && mx <= bx + CFG.game.shop.width && my >= by && my <= by + CFG.game.shop.height) {
                shopHit = true;
                if (this.game.state.score >= u.cost) {
                    this.buyUpgrade(u);
                } else {
                    this.game.events.emit('play_sound', 'error');
                }
            }
        });

        if (shopHit) return true;

        // 2. Main Button
        const cx = this.game.w / 2;
        const cy = this.game.h / 2 - 100;
        if (Math.hypot(mx - cx, my - cy) < CFG.game.mainButtonRadius) {
            this.handleMainClick(mx, my);
            return true;
        }

        return false;
    }

    /**
     * logic for clicking the main game button.
     */
    handleMainClick(mx, my) {
        let gain = this.game.state.clickPower;

        // System Purge penalty
        if (this.game.state.isPurged) {
            gain = 1;
        }

        let isCrit = false;

        // Critical Click Check
        const critLevel = this.game.metaUpgrades['critical_click'] || 0;
        if (critLevel > 0 && Math.random() < critLevel * 0.1) {
            gain *= 5;
            isCrit = true;
        }

        // Overheat Throttling
        if (this.game.state.throttled) {
            gain *= 0.5;
            // Visual feedback handled in Game or Renderer?
            // Maybe emit a 'throttled' event or small text?
            if (Math.random() < 0.2) this.game.createFloatingText(this.game.w / 2, this.game.h / 2 - 50, "THROTTLED", "#f00");
        }

        this.game.state.addScore(gain);

        if (isCrit) {
            this.game.events.emit('play_sound', 'buy');
            this.game.createFloatingText(this.game.w / 2, this.game.h / 2 - 150, "CRITICAL!", "#ff0");
            this.game.shake = 5;
        } else {
            this.game.events.emit('play_sound', 'click');
            this.game.shake = 2;
        }

        this.game.createParticles(this.game.w / 2, this.game.h / 2 - 100, this.game.themeManager.currentTheme.colors.accent);
        if (this.game.themeManager.currentTheme.id === 'rainbow_paradise') {
            this.game.state.addCorruption(0.05);
        }

        // WHISPER SYSTEM
        if (this.game.state.corruption > 20) {
            if (Math.random() < 0.1) { // 10% chance
                const phrases = ["I FEEL THAT", "DONT STOP", "CLOSER", "IT BURNS", "FEED ME", "ARE YOU REAL?", "7734..."];
                const text = UTILS.randArr(phrases);
                // Faint Red or Gray
                const color = Math.random() > 0.5 ? 'rgba(100, 0, 0, 0.7)' : 'rgba(100, 100, 100, 0.7)';
                this.game.createFloatingText(mx, my - 20, text, color);
            }
        }
    }

    /**
     * Purchases a normal upgrade.
     * @param {Object} u - The upgrade object.
     */
    buyUpgrade(u) {
        this.game.state.score -= u.cost;
        u.count++;
        u.cost = Math.floor(u.cost * 1.4);

        if (u.type === 'auto') this.game.state.autoRate += u.val;
        if (u.type === 'click') this.game.state.clickPower += u.val;

        this.game.events.emit('play_sound', 'buy');
        this.game.state.addCorruption(1.5);
    }

    /**
     * Purchases a meta-upgrade using Glitch Data.
     * @param {Object} u - The meta-upgrade object.
     */
    buyMetaUpgrade(u) {
        const currentLevel = this.game.metaUpgrades[u.id] || 0;
        if (u.maxLevel && currentLevel >= u.maxLevel) return false;

        let cost = u.baseCost;
        if (u.costScale) {
            cost = Math.floor(u.baseCost * Math.pow(u.costScale, currentLevel));
        }

        if (this.game.glitchData >= cost) {
            this.game.glitchData -= cost;
            this.game.metaUpgrades[u.id] = currentLevel + 1;
            this.game.events.emit('play_sound', 'buy');
            this.game.saveGame();
            this.applyMetaUpgrades();
            return true;
        } else {
            this.game.events.emit('play_sound', 'error');
            return false;
        }
    }

    /**
     * Applies effects of purchased meta-upgrades.
     */
    applyMetaUpgrades() {
        const boostLevel = this.game.metaUpgrades['prestige_boost'] || 0;
        if (boostLevel > 0) {
            this.game.state.setMultiplier(this.game.state.multiplier + (boostLevel * 0.5));
        }
    }

    /**
     * Calculates and awards offline progress gains.
     */
    checkOfflineProgress() {
        if (this.game.metaUpgrades['offline_progress']) {
            const now = Date.now();
            const diff = (now - this.game.lastSaveTime) / 1000; // seconds

            if (diff > 60) {
                const lastRate = this.game.saveSystem.loadNumber('last_auto_rate', 0);
                if (lastRate > 0) {
                    // 25% efficiency
                    const gained = lastRate * diff * 0.25;
                    if (gained > 0) {
                        this.game.state.addScore(gained);
                        this.game.uiManager.chat.addMessage('SYSTEM', `OFFLINE GAINS: +${UTILS.fmt(gained)} (Duration: ${Math.floor(diff / 60)}m)`);
                    }
                }
            }
        }
    }
}
