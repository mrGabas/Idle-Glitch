/**
 * META UPGRADES (BIOS SETUP)
 * @module data/metaUpgrades
 */

export const META_UPGRADES = [
    {
        id: 'start_theme',
        name: 'CUSTOM_BOOT_SECTOR',
        desc: 'Unlock ability to select starting theme.',
        baseCost: 500,
        maxLevel: 1,
        type: 'feature'
    },
    {
        id: 'offline_progress',
        name: 'RTC_BATTERY_BACKUP',
        desc: 'Gain 25% of production while offline.',
        baseCost: 1000,
        maxLevel: 1,
        type: 'feature'
    },
    {
        id: 'critical_click',
        name: 'MOUSE_SWITCH_OVERCLOCK',
        desc: '+10% chance for 5x click power.',
        baseCost: 250,
        maxLevel: 5,
        type: 'stat',
        effectPerLevel: 0.1 // 10%
    },
    {
        id: 'prestige_boost',
        name: 'CPU_VOLTAGE_MOD',
        desc: '+0.5x Passive Multiplier per level.',
        baseCost: 2000,
        maxLevel: 999, // Infinite
        type: 'stat',
        costScale: 1.5,
        effectPerLevel: 0.5
    }
];
