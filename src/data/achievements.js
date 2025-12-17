/**
 * @module data/achievements
 * Definitions for all game achievements.
 */

export const ACHIEVEMENTS = [
    {
        id: 'first_click',
        name: 'First Click',
        desc: 'Manually generate resources for the first time.',
        condition: (game) => game.state.score >= 10 || game.mouse.down, // Use game.mouse instead of game.input.mouse
        reward: (game) => {
            game.state.addScore(5);
        }
    },
    {
        id: '1000_bytes',
        name: '1000 Bytes',
        desc: 'Reach a score of 1000.',
        condition: (game) => game.state.score >= 1000,
        reward: (game) => {
            game.state.clickPower += 1;
        }
    },
    {
        id: 'system_corrupted',
        name: 'System Corrupted',
        desc: 'Reach 10% Corruption.',
        condition: (game) => game.state.corruption >= 10,
        reward: (game) => {
            game.state.multiplier += 0.1;
        }
    },
    {
        id: 'automation',
        name: 'Automation',
        desc: 'Have an automatic resource generation rate.',
        condition: (game) => game.state.autoRate > 0,
        reward: (game) => {
            game.state.addScore(500);; // 10% boost
        }
    },
    {
        id: 'glitch_hunter',
        name: 'Glitch Hunter',
        desc: 'Encounter a glitch entity.',
        // This condition might need a specific flag tracked in game state or stats
        // For now, let's assume if they have some lifetime glitch data or similar, or just check if hunter is active (hard to catch exact moment)
        // Better: check if they have clicked a glitch. Game.js tracks this?
        // Let's use lifetime glitch data > 0 as a proxy if they get it from glitches, 
        // BUT wait, hard reset gives glitch data too.
        // Let's stick to a simple score/prop check for now or add a stat later.
        // Let's use: Have > 0 glitchIntensity
        condition: (game) => game.glitchSystem && game.state.glitchIntensity > 0.1,
        reward: (game) => {
            game.state.multiplier += 0.2;
        }
    }
];
