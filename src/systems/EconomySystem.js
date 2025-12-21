
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
        if (this.game.metaUpgrades['auto_buy'] && this.game.state.autoBuyEnabled) {
            this.handleAutoBuy(dt);
        }

        // Auto score gain
        if (this.game.state.autoRate > 0) {
            // META: DAEMON_PROCESS (Auto Clicker Efficiency)
            // We apply it here as a dynamic multiplier to the rate
            const daemonLevel = this.game.metaUpgrades['daemon_buff'] || 0;
            const daemonMult = 1 + (daemonLevel * 0.1);

            // --- OVERCLOCK CHECK ---
            if (this.game.state.overclockEndTime > 0) {
                if (Date.now() < this.game.state.overclockEndTime) {
                    this.game.state.overclockMultiplier = 2; // Fixed 2x
                } else {
                    this.game.state.overclockMultiplier = 1;
                    this.game.state.overclockEndTime = 0;
                    this.game.createFloatingText(this.game.w / 2, this.game.h / 2, "OVERCLOCK ENDED", "#f00");
                }
            } else {
                this.game.state.overclockMultiplier = 1;
            }

            // Apply Multiplier
            const finalRate = this.game.state.autoRate * daemonMult * this.game.state.overclockMultiplier;
            this.game.state.addScore(finalRate * dt);
        }
    }

    /**
     * Activates the Overclock bonus.
     * @param {number} durationSeconds 
     */
    activateOverclock(durationSeconds) {
        this.game.state.overclockEndTime = Date.now() + (durationSeconds * 1000);
        this.game.state.overclockMultiplier = 2;
        this.game.createFloatingText(this.game.w / 2, this.game.h / 2, "OVERCLOCK ACTIVE! (x2)", "#0ff");
        this.game.events.emit('play_sound', 'buy');
        this.game.events.emit('state_updated', this.game.state);
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
            this.handleMainClick(mx, my, btnX, btnY);
            return true;
        }

        return false;
    }

    /**
     * logic for clicking the main game button.
     */
    handleMainClick(mx, my, btnX, btnY) {
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
            // Use btnX (Game Area Center) if provided, else fallback to window center (safeguard)
            const tx = btnX || this.game.w / 2;
            const ty = (btnY || this.game.h / 2) - 150;
            this.game.createFloatingText(tx, ty, "CRITICAL!", "#ff0");
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
        // Reset to base prestige multiplier to ensure idempotency
        let newMultiplier = 1 * this.game.prestigeMult;

        const boostLevel = this.game.metaUpgrades['prestige_boost'] || 0;
        if (boostLevel > 0) {
            // META: CPU_VOLTAGE_MOD (Prestige Boost)
            // +0.5x Passive Multiplier per level.
            newMultiplier += (boostLevel * 0.5);
        }

        // META: SATA_CONTROLLER (Global Production)
        const sataLevel = this.game.metaUpgrades['sata_boost'] || 0;
        if (sataLevel > 0) {
            // Apply as a % boost to the total multiplier
            // +5% per level
            newMultiplier *= (1 + sataLevel * 0.05);
        }

        // Apply final calculated multiplier
        this.game.state.setMultiplier(newMultiplier);

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
                    }
                }
            }
        }
    }

}
