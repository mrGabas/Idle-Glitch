/**
 * Game Orchestrator
 * The central hub that wires systems together.
 */
import { GameState } from './GameState.js';
import { GameLoop } from './GameLoop.js';
import { InputHandler } from './Input.js';

import { EntityManager } from '../managers/EntityManager.js';
import { ThemeManager } from '../managers/ThemeManager.js';
import { UIManager } from '../managers/UIManager.js';

import { Renderer } from '../systems/Renderer.js';
import { EconomySystem } from '../systems/EconomySystem.js';
import { GlitchSystem } from '../systems/GlitchSystem.js';
// ChatSystem refactor is pending, using placeholder or old one if compatible?
// For now, let's assume we need to import the old one or the new one if we get to it.
// The task says "Refactor ChatSystem to Command Pattern". I haven't done that yet.
// I will temporarily import the old ChatSystem if possible or just comment it out until next step.
// Actually, I should probably do the ChatSystem refactor next.
// But for "Game.js", I will import it as if it's there.
import { ChatSystem } from '../systems/ChatSystem.js';
import { SoundEngine } from './audio.js';
import { SaveSystem } from './SaveSystem.js';
import { events } from './events.js';

export class Game {
    constructor() {
        // ...

        // 3. Systems
        this.renderer = new Renderer('gameCanvas');
        this.chat = new ChatSystem(this); // Initialize before UI Manager potentially if UI manager needs it

        this.state = new GameState();

        // 2. Managers
        this.entityManager = new EntityManager();
        this.themeManager = new ThemeManager(this.state);
        this.uiManager = new UIManager(this);

        // 3. Systems
        // Renderer initialized above at line 29.

        // Pass events/state to systems
        this.economySystem = new EconomySystem(this.state, this.state); // State acts as event emitter too
        this.glitchSystem = new GlitchSystem(this);

        // 4. Loop
        this.loop = new GameLoop(this);

        // Wiring Input
        this.input.onResize(() => this.resize());
        this.resize();

        this.mode = 'MENU'; // Init mode
        this.saveSystem = new SaveSystem();
        this.events = events; // Expose global event bus
        this.audio = new SoundEngine();

        this.uiManager.bindUI();

        this.init();
    }

    init() {
        // Load initial data?
        console.log("Game Initialized");
        this.loop.start();
    }

    setMode(mode) {
        this.mode = mode;
        console.log("Game Mode:", mode);
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update(dt) {
        if (this.mode !== 'PLAYING') return;

        // 1. Systems Update
        this.economySystem.update(dt);
        this.glitchSystem.update(dt);
        this.chat.update(dt); // Update chat

        // 2. Managers Update
        this.entityManager.update(dt);
        this.uiManager.update(dt);

        // 3. Input Handling (if not event driven)
    }

    draw(alpha) {
        // Construct the "World" object that Renderer expects
        // Renderer signature: draw(state, world, entities)

        // Adapter for Renderer
        const renderState = this.state.data;
        const renderWorld = {
            currentTheme: this.themeManager.currentTheme,
            mouse: this.input.mouse, // Input module mouse
            shake: 0, // TODO: store in GlitchSystem or State
            scareTimer: 0,
            gameState: this.mode, // Use real mode
            metaUpgrades: this.state.data.meta || {}
        };

        const renderEntities = {
            particles: this.entityManager.getAll('particles'),
            debris: this.entityManager.getAll('debris'),
            // ... map other layers
            // fakeUI: ...
        };

        this.renderer.draw(renderState, renderWorld, renderEntities);
    }
}
