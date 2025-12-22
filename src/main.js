/**
 * ENTRY POINT
 * @module main
 */
import { Game } from './core/game.js';

import { assetLoader } from './core/AssetLoader.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { ASSETS } from './data/assets.js';

window.addEventListener('load', () => {
    // Init Error Handler First
    ErrorHandler.init();

    // Create simple loading screen
    const loader = document.createElement('div');
    loader.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #000; color: #fff; display: flex;
        justify-content: center; align-items: center;
        font-family: monospace; font-size: 24px; z-index: 9999;
    `;
    loader.innerText = 'Initializing Protocol... 0%';
    document.body.appendChild(loader);

    // Load assets then start game
    assetLoader.loadAll(ASSETS, (progress) => {
        loader.innerText = `Initializing Protocol... ${Math.floor(progress * 100)}%`;
    }).then(() => {
        // Remove loader
        document.body.removeChild(loader);

        // Init Game
        const game = new Game();
        //window.game = game; // Expose for console commands


    });
});
