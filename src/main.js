/**
 * ENTRY POINT
 * @module main
 */
import { Game } from './core/game.js';

import { assetLoader } from './core/AssetLoader.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { CORE_ASSETS, LAZY_ASSETS } from './data/assets.js';

window.addEventListener('load', () => {
    // Init Error Handler First
    ErrorHandler.init();

    // Create simple loading screen
    const loader = document.createElement('div');
    loader.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #000; color: #fff; display: flex;
        justify-content: center; align-items: center;
        flex-direction: column;
        font-family: monospace; font-size: 24px; z-index: 9999;
    `;
    loader.innerHTML = `
        <div>Initializing Protocol...</div>
        <div id="load-progress">0%</div>
    `;
    document.body.appendChild(loader);

    const progressEl = document.getElementById('load-progress');

    // Load CORE assets then start game
    assetLoader.loadAll(CORE_ASSETS, (progress) => {
        progressEl.innerText = `${Math.floor(progress * 100)}%`;
    }).then(() => {
        // Remove loader
        document.body.removeChild(loader);

        checkPhotosensitivityWarning(() => {
            // Init Game
            const game = new Game();

            // Start loading LAZY assets in background
            assetLoader.loadAll(LAZY_ASSETS).then(() => {
                console.log("Background assets loaded successfully.");
            });
        });
    });
});

/**
 * Checks if the player has seen the photosensitivity warning.
 * @param {Function} callback - Called when game can proceed.
 */
function checkPhotosensitivityWarning(callback) {
    const hasSeenWarning = localStorage.getItem('glitch_photosensitivity_accepted') === 'true';

    if (hasSeenWarning) {
        callback();
        return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'warning-overlay';
    overlay.innerHTML = `
        <div class="warning-content">
            <h2>SAFETY WARNING</h2>
            <p>
                This game contains flashing lights, rapid visual patterns, and glitch effects 
                that may trigger seizures for people with photosensitive epilepsy.
                <br><br>
                Player discretion is advised.
            </p>
            <button class="warning-btn" id="btn-accept-warning">I UNDERSTAND & PROCEED</button>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-accept-warning').onclick = () => {
        localStorage.setItem('glitch_photosensitivity_accepted', 'true');
        document.body.removeChild(overlay);
        callback();
    };
}
