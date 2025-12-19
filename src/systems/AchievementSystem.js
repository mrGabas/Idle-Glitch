import { ACHIEVEMENTS } from '../data/achievements.js';

export class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.achievements = ACHIEVEMENTS;
        this.unlocked = [];

        // Load progress
        const savedIds = this.game.saveSystem.load('unlocked_achievements', []);
        // Validate IDs
        this.unlocked = savedIds.filter(id => this.achievements.find(a => a.id === id));
        this.hasNew = false; // Track unviewed achievements
    }

    reset() {
        this.unlocked = [];
        this.save();
    }

    update(dt) {
        // Check for new unlocks
        this.achievements.forEach(ach => {
            if (!this.unlocked.includes(ach.id)) {
                if (ach.condition(this.game)) {
                    this.unlock(ach);
                }
            }
        });
    }

    unlock(achievement) {
        if (this.unlocked.includes(achievement.id)) return;

        this.unlocked.push(achievement.id);
        this.hasNew = true;

        // Grant Reward
        if (achievement.reward) {
            achievement.reward(this.game);
        }

        // Notify
        this.game.events.emit('achievement_unlocked', achievement);
        this.game.events.emit('play_sound', 'buy'); // Reuse buy sound or custom
        this.game.createFloatingText(this.game.w / 2, 50, "ACHIEVEMENT UNLOCKED!", "#FFD700");

        this.save();
    }

    save() {
        this.game.saveSystem.save('unlocked_achievements', this.unlocked);
    }

    /**
     * Re-applies rewards for all unlocked achievements.
     * Should only be called after a stat reset (e.g. Prestige).
     */
    applyRewards() {
        this.unlocked.forEach(id => {
            const ach = this.achievements.find(a => a.id === id);
            if (ach && ach.reward) {
                ach.reward(this.game);
            }
        });
    }
}
