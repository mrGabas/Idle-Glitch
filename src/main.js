/**
 * ENTRY POINT
 * @module main
 */
import { Game } from './core/game.js';

import { assetLoader } from './core/AssetLoader.js';
import { ErrorHandler } from './core/ErrorHandler.js';
import { CORE_ASSETS, LAZY_ASSETS } from './data/assets.js';

import { AdsManager } from './managers/AdsManager.js';

window.addEventListener('load', async () => {
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

    // 0. Initialize CrazyGames SDK early (Cloud Saves need this)
    await AdsManager.initSDK();

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
    const key = 'glitch_photosensitivity_accepted';
    let hasSeenWarning = localStorage.getItem(key) === 'true';

    // Check Cloud Save if local is empty
    if (!hasSeenWarning && window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.data) {
        hasSeenWarning = window.CrazyGames.SDK.data.getItem(key) === 'true';
    }

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
        const key = 'glitch_photosensitivity_accepted';
        localStorage.setItem(key, 'true');
        if (window.CrazyGames && window.CrazyGames.SDK && window.CrazyGames.SDK.data) {
            window.CrazyGames.SDK.data.setItem(key, 'true');
        }
        document.body.removeChild(overlay);
        callback();
    };
}
