/**
 * Game Assets Configuration
 * Lists all static assets to be preloaded
 * @module data/assets
 */

/**
 * CORE ASSETS
 * Required for the initial boot and first theme (Rainbow Paradise)
 */
export const CORE_ASSETS = {
    images: [
        // Rainbow Paradise (Theme 1)
        'assets/Levels/Rainbow Paradise/main button.webp',
        'assets/Levels/Rainbow Paradise/parallax/layer 1.webp',
        'assets/Levels/Rainbow Paradise/parallax/layer 2.webp',
        'assets/Levels/Rainbow Paradise/parallax/layer 3.webp',

        // Glitch Effects
        'assets/25fps/Larry.webp',
        'assets/25fps/Scarycat.webp',
        'assets/25fps/Scarycat2.webp'
    ],
    audio: [
        //Core UI
        'assets/Audios/General/archive.mp3',

        // Theme 1 Music
        'assets/Music/Pixel Party.mp3'
    ]
};

/**
 * LAZY ASSETS
 * Loaded in background after game starts
 */
export const LAZY_ASSETS = {
    images: [
        // Other Level Buttons
        'assets/Levels/Ad Purgatory/main button.webp',
        'assets/Levels/Firewall/main button.webp',
        'assets/Levels/Corporate/main button.webp',
        'assets/Levels/Server Farm/main button.webp',
        'assets/Levels/Dev Desktop/main button.webp',
        'assets/Levels/Beta Build/main button.webp',
        'assets/Levels/Digital Decay/main button.webp',
        'assets/Levels/Legacy System/main button.webp',
        'assets/Levels/Null Void/main button.webp',

        // Ad Purgatory
        'assets/Levels/Ad Purgatory/parallax/layer 1.webp',
        'assets/Levels/Ad Purgatory/parallax/layer 2.webp',

        // Dev Desktop
        'assets/Levels/Dev Desktop/parallax/layer 1.webp',
        'assets/Levels/Dev Desktop/parallax/layer 2.webp',
        'assets/Levels/Dev Desktop/parallax/layer 3.webp',

        // Firewall
        'assets/Levels/Firewall/parallax/layer 1.webp',
        'assets/Levels/Firewall/parallax/layer 2.webp',

        // Corporate
        'assets/Levels/Corporate/parallax/layer 1.webp',
        'assets/Levels/Corporate/parallax/layer 2.webp',

        // Beta Build
        'assets/Levels/Beta Build/parallax/layer 1.webp',
        'assets/Levels/Beta Build/parallax/layer 2.webp',

        // Legacy System
        'assets/Levels/Legacy System/parallax/layer 1.webp',
        'assets/Levels/Legacy System/parallax/layer 2.webp',

        // Null Void
        'assets/Levels/Null Void/parallax/layer 1.webp',
        'assets/Levels/Null Void/parallax/layer 2.webp',
        'assets/Levels/Null Void/parallax/layer 3.webp',

        // Review Avatars
        'assets/Reviews/1.webp',
        'assets/Reviews/2.webp',
        'assets/Reviews/3.webp',
        'assets/Reviews/4.webp',
        'assets/Reviews/5.webp',
        'assets/Reviews/6.webp',
        'assets/Reviews/7.webp',
        'assets/Reviews/8.webp',
        'assets/Reviews/9.webp',
        'assets/Reviews/10.webp',
        'assets/Reviews/11.webp',
        'assets/Reviews/12.webp',
        'assets/Reviews/13.webp',
        'assets/Reviews/14.webp',
        'assets/Reviews/15.webp',
        'assets/Reviews/16.webp',

        // Common Collection Items
        'assets/Media/1. Common/AAAAAAAA.webp',
        'assets/Media/1. Common/Bug Report.webp',
        'assets/Media/1. Common/Chill Guy.webp',
        'assets/Media/1. Common/Elgato.webp',
        'assets/Media/1. Common/Ginger Truck.webp',
        'assets/Media/1. Common/Im about to be mad.webp',
        'assets/Media/1. Common/Plush Guardian.webp',
        'assets/Media/1. Common/Truck from below.webp'
    ],

    // Audio files
    audio: [
        'assets/Audios/Terminal comands/felix/purr.mp3',
        'assets/Audios/Terminal comands/0xdead/I AM ALIVE.MP3',
        'assets/Audios/BIOS/Boot.mp3',
        'assets/Audios/BIOS/error.mp3',
        'assets/Audios/BIOS/working.mp3',
        'assets/Audios/Screamer sounds/Screamer 1.mp3',
        'assets/Audios/Screamer sounds/Connect.mp3',
        'assets/Audios/Screamer sounds/Disconnect.mp3',

        // Background Music
        'assets/Music/Digital Drift.mp3'
    ]
};
