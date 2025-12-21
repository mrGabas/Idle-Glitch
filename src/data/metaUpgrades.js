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
        costScale: 1.05,
        effectPerLevel: 0.5
    },
    // --- NEW HARDWARE UPGRADES ---
    {
        id: 'sata_boost',
        name: 'SATA_CONTROLLER',
        desc: '+5% Global Production Multiplier.',
        baseCost: 200,
        maxLevel: 20,
        type: 'stat',
        effectPerLevel: 0.05
    },
    {
        id: 'net_card',
        name: 'NETWORK_CARD',
        desc: '-2% Global Upgrade Discount.',
        baseCost: 350,
        maxLevel: 25,
        type: 'stat',
        costScale: 1.1,
        effectPerLevel: 0.02
    },
    {
        id: 'daemon_buff',
        name: 'DAEMON_PROCESS',
        desc: '+10% Auto-Clicker Efficiency.',
        baseCost: 600,
        maxLevel: 10,
        type: 'stat',
        effectPerLevel: 0.1
    },
    {
        id: 'lucky_tick',
        name: 'SOURCE_LEAK',
        desc: '1% Chance/sec for 10x Production burst.',
        baseCost: 1500,
        maxLevel: 5,
        type: 'stat',
        effectPerLevel: 0.01 // Chance add
    },
    {
        id: 'gpu_crit',
        name: 'GPU_DRIVER',
        desc: '+20% Critical Click Damage.',
        baseCost: 400,
        maxLevel: 10,
        type: 'stat',
        effectPerLevel: 0.2
    },
    {
        id: 'heat_sink',
        name: 'HEAT_SINK',
        desc: '-5% Corruption Gain Rate.',
        baseCost: 1000,
        maxLevel: 10,
        type: 'stat',
        effectPerLevel: 0.05
    },
    {
        id: 'start_bonus',
        name: 'RAM_EXPANSION',
        desc: 'Start run with +500 Data.',
        baseCost: 100,
        maxLevel: 10,
        type: 'stat',
        effectPerLevel: 500
    },
    {
        id: 'offline_buff',
        name: 'THREAD_SCHEDULER',
        desc: 'Optimize Offline Earnings (Max 100%).',
        baseCost: 2000,
        maxLevel: 3,
        type: 'stat',
        effectPerLevel: 0.25 // +25% per level, starting from 25% base? Or add to base? Base is 25%.
    },
    {
        id: 'safe_mode',
        name: 'BIOS_PASSWORD',
        desc: 'Unlock Debug/Safe Mode features.',
        baseCost: 5000,
        maxLevel: 1,
        type: 'feature'
    },
    {
        id: 'auto_buy',
        name: 'NEURAL_ENGINE',
        desc: 'Unlock Auto-Buy for cheap upgrades.',
        baseCost: 10000,
        maxLevel: 1,
        type: 'feature'
    }
];
