/**
 * ENTRY POINT
 * @module main
 */
import { Game } from './core/game.js';
import { DebugTools } from './core/debug.js';

window.addEventListener('load', () => {
    // Init Game
    const game = new Game();

    // Init Debug Tools (which exposes window.game)
    new DebugTools(game);

    console.log("Protocol: FELINE initialized.");
});
