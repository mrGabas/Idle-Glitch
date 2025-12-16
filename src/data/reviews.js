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
    { user: 'HappyClicker', rating: 5, text: "So satisfying to watch numbers go up! 📈", type: 'normal', avatar: 'assets/Reviews/5.webp' },
    { user: 'CoffeeLover', rating: 5, text: "Perfect game to play during work meetings. Don't tell my boss.", type: 'normal', avatar: 'assets/Reviews/6.webp' },
    { user: 'RetroFan99', rating: 5, text: "Reminds me of the old internet. Nostalgia!", type: 'normal', avatar: 'assets/Reviews/7.webp' },
    { user: 'NoobMaster69', rating: 4, text: "Works great on my potato PC. 10/10 optimization.", type: 'normal', avatar: 'assets/Reviews/8.webp' },
    { user: 'Genius', rating: 1, text: "Top", type: 'normal', avatar: 'assets/Reviews/9.webp' },
    { user: 'LongTester', rating: 5, text: "This is a very long review to test the new text wrapping functionality. It should automatically move to the next line when it reaches the edge of the card. If it works, the card height will increase.", type: 'normal', avatar: 'assets/Reviews/10.webp' },

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
    },
    {
        user: 'Camera_Feed',
        rating: 0,
        text: "Nice room. You should probably lock your door though.",
        type: 'creepy',
        triggerCorruption: 65,
        avatar: 'assets/Reviews/16.webp'
    }
];
