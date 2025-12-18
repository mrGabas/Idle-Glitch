export const COLLECTION_DB = {
    rarities: {
        common: { id: 'common', name: 'Common', chance: 0.60, color: '#ffffff' },      // 55-65% -> 60%
        uncommon: { id: 'uncommon', name: 'Uncommon', chance: 0.25, color: '#1eff00' }, // 20-25% -> 25%
        rare: { id: 'rare', name: 'Rare', chance: 0.10, color: '#0070dd' },             // 8-12% -> 10%
        epic: { id: 'epic', name: 'Epic', chance: 0.04, color: '#a335ee' },             // 3-5% -> 4%
        legendary: { id: 'legendary', name: 'Legendary', chance: 0.01, color: '#ff8000' } // 0.5-1% -> 1%
    },
    items: [
        // Common
        { id: 'meme_c_1', name: 'Chill Guy', type: 'image', rarity: 'common', src: 'assets/Media/1. Common/3.webp' },

        // Uncommon
        { id: 'meme_u_1', name: 'Confused Cat', type: 'image', rarity: 'uncommon', src: 'assets/Media/2. Uncommon/5.webp' },

        // Rare
        { id: 'meme_r_1', name: 'Coding Dog', type: 'image', rarity: 'rare', src: 'assets/Media/3. Rare/2.webp' },

        // Epic
        { id: 'meme_e_1', name: 'Hacker Man', type: 'image', rarity: 'epic', src: 'assets/Media/4. Epic/1.webp' },

        // Legendary (Placeholder until files are added)
        // { id: 'meme_l_1', name: 'Golden Glitch', type: 'image', rarity: 'legendary', src: 'assets/Media/5. Legendary/...' },
    ]
};
