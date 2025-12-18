export const COLLECTION_DB = {
    rarities: {
        common: { id: 'common', name: 'Common', chance: 0.60, color: '#ffffff' },
        uncommon: { id: 'uncommon', name: 'Uncommon', chance: 0.25, color: '#1eff00' },
        rare: { id: 'rare', name: 'Rare', chance: 0.10, color: '#0070dd' },
        epic: { id: 'epic', name: 'Epic', chance: 0.04, color: '#a335ee' },
        legendary: { id: 'legendary', name: 'Legendary', chance: 0.01, color: '#ff8000' }
    },
    items: [
        // Common
        // { id: 'meme_c_1', name: '1', type: 'image', rarity: 'common', src: 'assets/Media/1. Common/1.webp' }, // Exists in list?
        // Checked list: 1. Common contains: 1.webp, 3.webp. (Wait, let's just map safe ones)
        { id: 'meme_c_1', name: '1', type: 'image', rarity: 'common', src: 'assets/Media/1. Common/1.webp' },
        { id: 'meme_c_3', name: '3', type: 'image', rarity: 'common', src: 'assets/Media/1. Common/3.webp' },

        // Uncommon
        // List: Like.webp. (Others were 404 or not shown). Assumed 1-5 don't exist?
        // User error said 5.webp 404. 
        // I will only include what I SAW in the partial list output + 'Like.webp'.
        // Actually, I'll rely on the user to fill the rest or I ask for full dir list?
        // I'll add the ones I saw:
        { id: 'meme_u_like', name: 'Like', type: 'image', rarity: 'uncommon', src: 'assets/Media/2. Uncommon/Like.webp' },

        // Rare
        { id: 'meme_r_ginger', name: 'Ginger Catzilla', type: 'image', rarity: 'rare', src: 'assets/Media/3. Rare/Ginger Catzilla.webp' },
        { id: 'meme_r_dont', name: "don't eat me pls", type: 'image', rarity: 'rare', src: "assets/Media/3. Rare/don't eat me pls.webp" },

        // Epic
        { id: 'meme_e_1', name: '1', type: 'image', rarity: 'epic', src: 'assets/Media/4. Epic/1.webp' },
        { id: 'meme_e_2', name: '2', type: 'video', rarity: 'epic', src: 'assets/Media/4. Epic/2.webm' },
        { id: 'meme_e_3', name: '3', type: 'image', rarity: 'epic', src: 'assets/Media/4. Epic/3.webp' },
        { id: 'meme_e_strong', name: 'StrongCAT', type: 'image', rarity: 'epic', src: 'assets/Media/4. Epic/StrongCAT.webp' },

        // Legendary
        { id: 'meme_l_huh', name: 'huh', type: 'video', rarity: 'legendary', src: 'assets/Media/5. Legendary/huh.mp4' },
        { id: 'meme_l_fresh', name: 'Mr. Fresh', type: 'video', rarity: 'legendary', src: 'assets/Media/5. Legendary/Mr. Fresh.mp4' },
        { id: 'meme_l_oiia', name: 'OIIA', type: 'video', rarity: 'legendary', src: 'assets/Media/5. Legendary/OIIA.mp4' }
    ]
};
