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
        condition: (game) => game.glitchSystem && game.state.glitchIntensity > 0.1,
        reward: (game) => {
            game.state.multiplier += 0.2;
        }
    },
    {
        id: 'megabyte',
        name: 'Megabyte',
        desc: 'Reach 1,000,000 Score.',
        condition: (game) => game.state.score >= 1000000,
        reward: (game) => {
            game.state.clickPower += 50;
        }
    },
    {
        id: 'gigabyte',
        name: 'Gigabyte',
        desc: 'Reach 1,000,000,000 Score.',
        condition: (game) => game.state.score >= 1000000000,
        reward: (game) => {
            game.state.multiplier += 0.5;
        }
    },
    {
        id: 'hello_world',
        name: 'Hello World',
        desc: 'Reboot the system for the first time.',
        condition: (game) => game.rebootCount >= 1,
        reward: (game) => {
            game.state.multiplier += 0.1;
        }
    },
    {
        id: 'boot_loop',
        name: 'Boot Loop',
        desc: 'Reboot the system 5 times.',
        condition: (game) => game.rebootCount >= 5,
        reward: (game) => {
            game.state.multiplier += 0.5;
        }
    },
    {
        id: 'sysadmin',
        name: 'SysAdmin',
        desc: 'Reboot the system 10 times.',
        condition: (game) => game.rebootCount >= 10,
        reward: (game) => {
            game.state.multiplier += 1.0;
        }
    },
    {
        id: 'critical_error',
        name: 'Critical Error',
        desc: 'Reach 90% Corruption.',
        condition: (game) => game.state.corruption >= 90,
        reward: (game) => {
            game.state.multiplier += 0.2;
        }
    },
    {
        id: 'glitch_collector',
        name: 'Glitch Collector',
        desc: 'Accumulate 100 Lifetime Glitch Data.',
        condition: (game) => game.lifetimeGlitchData >= 100,
        reward: (game) => {
            game.state.multiplier += 0.25;
        }
    },
    {
        id: 'data_hoarder',
        name: 'Data Hoarder',
        desc: 'Accumulate 1,000 Lifetime Glitch Data.',
        condition: (game) => game.lifetimeGlitchData >= 1000,
        reward: (game) => {
            game.state.multiplier += 1.0;
        }
    },
    {
        id: 'power_user',
        name: 'Power User',
        desc: 'Purchase 5 Meta Upgrades (Total Levels).',
        condition: (game) => Object.values(game.metaUpgrades).reduce((a, b) => a + b, 0) >= 5,
        reward: (game) => {
            game.state.clickPower += 100;
        }
    },
    {
        id: 'truth_seeker',
        name: 'Truth Seeker',
        desc: 'Unlock 3 Hidden Archive Folders.',
        condition: (game) => game.loreSystem.unlockedFolders.length >= 3,
        reward: (game) => {
            game.state.multiplier += 0.3;
        }
    }
];
