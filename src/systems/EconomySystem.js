
import { CFG, UTILS } from '../core/config.js';
import { META_UPGRADES } from '../data/metaUpgrades.js';

export class EconomySystem {
    /**
     * @param {import('../core/game.js').Game} game - Reference to the main Game instance.
     */
    constructor(game) {
        this.game = game;
        this.shopOpen = false; // Default closed for tutorial flow
    }

    toggleShop() {
        this.shopOpen = !this.shopOpen;
        this.game.events.emit('play_sound', 'click');
    }

    openShop() {
        this.shopOpen = true;
    }

    /**
     * Updates economy logic (auto-production).
     * @param {number} dt - Delta time in seconds.
     */
    update(dt) {
        // META: SOURCE_LEAK (Lucky Tick)
        // 1% chance per second per level.
        const luckyLevel = this.game.metaUpgrades['lucky_tick'] || 0;
        if (luckyLevel > 0) {
            // Chance per frame = (0.01 * level) * dt
            if (Math.random() < (0.01 * luckyLevel) * dt) {
                const bonus = this.game.state.autoRate * 10;
                this.game.state.addScore(bonus);
                this.game.createFloatingText(this.game.w / 2, this.game.h / 3, "SOURCE LEAK! +" + UTILS.fmt(bonus), "#0f0");
                this.game.events.emit('play_sound', 'buy');
            }
        }

        // META: NEURAL_ENGINE (Auto Buy)
        if (this.game.metaUpgrades['auto_buy']) {
            this.handleAutoBuy(dt);
        }

        // Auto score gain
        if (this.game.state.autoRate > 0) {
            // META: DAEMON_PROCESS (Auto Clicker Efficiency)
            // We apply it here as a dynamic multiplier to the rate
            const daemonLevel = this.game.metaUpgrades['daemon_buff'] || 0;
            const daemonMult = 1 + (daemonLevel * 0.1);

            this.game.state.addScore(this.game.state.autoRate * daemonMult * dt);
        }
    }

    handleAutoBuy(dt) {
        // Simple logic: Buy cheapest affordable upgrade if we have 10x the cost
        // Throttle check to once per second
        this.autoBuyTimer = (this.autoBuyTimer || 0) + dt;
        if (this.autoBuyTimer < 1) return;
        this.autoBuyTimer = 0;

        if (!this.shopOpen) return; // Only if shop "accessible" (logic-wise, though UI might be closed. Let's allow anytime if unlocked?)
        // Let's require shop to be unlocked/logic running.

        const upgrades = this.game.themeManager.upgrades;
        // Find cheapest affordable
        let best = null;
        for (let u of upgrades) {
            const cost = this.getDiscountedCost(u.cost);
            if (this.game.state.score >= cost * 10) { // Safety margin
                if (!best || cost < this.getDiscountedCost(best.cost)) {
                    best = u;
                }
            }
        }

        if (best) {
            this.buyUpgrade(best);
        }
    }

    /**
     * Handles click interactions for the economy system (Shop, Main Button).
     * @param {number} mx - Mouse X coordinate relative to canvas.
     * @param {number} my - Mouse Y coordinate relative to canvas.
     * @returns {boolean} True if a click was handled.
     */
    handleClick(mx, my) {
        // 1. Shop Upgrades (Only if open)
        let shopHit = false;

        const w = this.game.w;
        const h = this.game.h;

        if (this.shopOpen) {
            // Access upgrades via themeManager
            const upgrades = this.game.themeManager.upgrades;

            // Must match Renderer.js positioning (Responsive)
            const shopStartX = w * CFG.game.shop.startXRatio;
            const shopStartY = h * CFG.game.shop.startYRatio;

            const cardW = w * CFG.game.shop.cardWidthRatio;
            const cardH = h * CFG.game.shop.cardHeightRatio;

            const colStep = w * CFG.game.shop.colSpacingRatio;
            const rowStep = h * CFG.game.shop.rowSpacingRatio;

            upgrades.forEach((u, i) => {
                const bx = shopStartX;
                const by = shopStartY + i * rowStep;

                if (mx >= bx && mx <= bx + cardW && my >= by && my <= by + cardH) {
                    shopHit = true;
                    // META: NETWORK_CARD (Discount)
                    const cost = this.getDiscountedCost(u.cost);

                    if (this.game.state.score >= cost) {
                        this.buyUpgrade(u);
                    } else {
                        this.game.events.emit('play_sound', 'error');
                    }
                }
            });
        }

        if (shopHit) return true;

        // 2. Main Button (Game Area Center)
        const gameW = w * CFG.game.gameAreaWidthRatio;
        const btnX = gameW / 2;
        const btnY = h * 0.5;
        const btnRadius = Math.min(gameW, h) * CFG.game.mainButtonRatio;

        if (Math.hypot(mx - btnX, my - btnY) < btnRadius) {
            this.game.createParticles(mx, my, this.game.themeManager.currentTheme.colors.accent); // Visual tap feedback at actual mouse pos
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
            // META: GPU_DRIVER (Crit Damage)
            const gpuLevel = this.game.metaUpgrades['gpu_crit'] || 0;
            const critMult = 5 * (1 + (gpuLevel * 0.2));

            gain *= critMult;
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

        // Track Clicks
        this.game.state.totalClicks++;


        if (this.game.themeManager.currentTheme.id === 'rainbow_paradise') {
            this.game.state.addCorruption(0.05);
        }

        // WHISPER SYSTEM
        if (this.game.state.corruption > 20) {
            if (Math.random() < 0.1) { // 10% chance
                const phrases = CFG.texts.whispers;
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
        // META: NETWORK_CARD (Discount)
        const cost = this.getDiscountedCost(u.cost);

        this.game.state.score -= cost;
        u.count++;
        u.cost = Math.floor(u.cost * 1.4);

        if (u.type === 'auto') this.game.state.autoRate += u.val;
        if (u.type === 'click') this.game.state.clickPower += u.val;

        this.game.events.emit('play_sound', 'buy');
        this.game.state.addCorruption(1.5);
        this.game.saveGame();
    }

    getDiscountedCost(baseCost) {
        const netLevel = this.game.metaUpgrades['net_card'] || 0;
        if (netLevel === 0) return baseCost;

        // -2% per level, max 50%
        let discount = netLevel * 0.02;
        if (discount > 0.5) discount = 0.5;

        return Math.floor(baseCost * (1 - discount));
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
            // Additive multiplier
            this.game.state.setMultiplier(this.game.state.multiplier + (boostLevel * 0.5));
        }

        // META: SATA_CONTROLLER (Global Production)
        const sataLevel = this.game.metaUpgrades['sata_boost'] || 0;
        if (sataLevel > 0) {
            // Multiplicative or Additive? Let's make it multiplicative with prestige to be strong.
            // Or additive to the multiplier?
            // "Global Production Multiplier" implies it boosts the final result.
            // internal multiplier is already a factor.
            // Let's add (5% * level) to the multiplier base.
            // Current logic: multiplier = 1 * prestige.
            // Let's do: multiplier = (1 * prestige) * (1 + sata * 0.05)

            // BUT `setMultiplier` overrides.
            // We need to know base.
            // Assuming this function runs after base set.
            // Let's apply it as a factor.
            const current = this.game.state.multiplier;
            this.game.state.setMultiplier(current * (1 + sataLevel * 0.05));
        }

        // META: HEAT_SINK (Corruption Resistance)
        const heatLevel = this.game.metaUpgrades['heat_sink'] || 0;
        if (heatLevel > 0) {
            // 5% per level
            this.game.state.corruptionResistance = heatLevel * 0.05;
        }
    }

    /**
     * Calculates and awards offline progress gains.
     */
    checkOfflineProgress() {
        if (this.game.metaUpgrades['offline_progress']) {
            const now = Date.now();
            const diff = now - this.game.lastSaveTime; // ms

            // Minimum time check (e.g. 60 seconds) - using config value in seconds * 1000
            if (diff > CFG.economy.minOfflineTime * 1000) {

                const MAX_OFFLINE_TIME = 8 * 60 * 60 * 1000; // 8 Hours
                const effectiveTime = Math.min(diff, MAX_OFFLINE_TIME);

                const lastRate = this.game.saveSystem.loadNumber('last_auto_rate', 0);

                if (lastRate > 0) {
                    // Calculate earnings: rate (per sec) * seconds * efficiency
                    // Note: effectiveTime is ms, rate is per second

                    // META: THREAD_SCHEDULER (Offline Improv)
                    const threadLevel = this.game.metaUpgrades['offline_buff'] || 0;
                    const efficiency = Math.min(1.0, CFG.economy.offlineEfficiency + (threadLevel * 0.25));

                    const earnings = lastRate * (effectiveTime / 1000) * efficiency;

                    if (earnings > 0) {
                        // Do NOT add score immediately. Show Report.
                        this.game.uiManager.showOfflineReport(earnings, effectiveTime);
                    } else {
                        console.log("Offline: Earnings 0");
                    }
                } else {
                    console.log("Offline: Rate 0");
                }
            } else {
                console.log("Offline: Time diff too small", diff);
            }
        }
    }
}
