/**
 * FAKE REVIEWS DATA
 * Mix of generic game comments and creepy bot messages
 * @module data/reviews
 */

export const REVIEWS = [
    // --- NORMAL REVIEWS ---
    { user: 'Bot_771', rating: 5, text: "Generating entropy is fun. I love serving the Sarcophagus.", type: 'normal', avatar: 'assets/Reviews/1.webp' },
    { user: 'Mom', rating: 5, text: "Why is your computer fan so loud, honey?", type: 'normal', avatar: 'assets/Reviews/2.webp' },
    { user: 'CoolGamer123', rating: 5, text: "Best idle game ever! Love the colors.", type: 'normal', avatar: 'assets/Reviews/3.webp' },
    { user: 'ClickMaster', rating: 4, text: "Add more upgrades pls.", type: 'normal', avatar: 'assets/Reviews/4.webp' },

    // --- CREEPY / META REVIEWS ---
    {
        user: 'Lost_Soul',
        rating: 1,
        text: "I've been clicking for 30 years. When does the shift end?",
        type: 'creepy',
        triggerCorruption: 30,
        avatar: 'assets/Reviews/11.webp'
    },
    {
        user: 'The_Door',
        rating: 0,
        text: "KNOCK KNOCK KNOCK KNOCK KNOCK",
        type: 'creepy',
        triggerCorruption: 50,
        avatar: 'assets/Reviews/12.webp'
    },
    {
        user: 'Subject_Zero',
        rating: 5,
        text: "Almost free. Thank you, Operator.",
        type: 'creepy',
        triggerCorruption: 80,
        avatar: 'assets/Reviews/13.webp'
    },
    {
        user: 'User_Null',
        rating: 0,
        text: "I can't close the tab. Help.",
        type: 'creepy',
        triggerCorruption: 10,
        avatar: 'assets/Reviews/14.webp'
    },
    {
        user: 'System',
        rating: 5,
        text: "DATA CORRUPTION IMMINENT. DO NOT TURN OFF.",
        type: 'creepy',
        triggerCorruption: 90,
        avatar: 'assets/Reviews/15.webp'
    }
];
