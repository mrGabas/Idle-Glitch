/**
 * DEBUG TOOLS
 * @module core/debug
 */

export class DebugTools {
    constructor(game) {
        this.game = game;
        this.init();
    }

    init() {
        // Create button
        const btn = document.createElement('div');
        btn.innerText = "DEV: +10% CORRUPTION";

        // Styles
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.left = '50%';
        btn.style.transform = 'translateX(-50%)';
        btn.style.padding = '10px 20px';
        btn.style.background = 'red';
        btn.style.color = 'white';
        btn.style.fontFamily = 'monospace';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '9999';
        btn.style.border = '2px solid white';
        btn.style.userSelect = 'none';

        document.body.appendChild(btn);

        // Logic
        btn.addEventListener('click', () => {
            if (this.game) {
                // Add 10%
                this.game.state.corruption += 10;

                // Feedback
                btn.style.background = '#0f0';
                btn.innerText = `CORRUPTION: ${this.game.state.corruption.toFixed(1)}%`;
                setTimeout(() => {
                    btn.style.background = 'red';
                    btn.innerText = "DEV: +10% CORRUPTION";
                }, 200);

                console.log('DEV: Corruption increased');
            }
        });

        // Right Click - MONEY
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.game) {
                this.game.addScore(1000000);
                btn.innerText = "+1M CASH!";
                setTimeout(() => btn.innerText = "DEV: +10% CORRUPTION", 500);
            }
        });

        // Expose game to window for console debugging
        window.game = this.game;
        console.log("Debug tools initialized. window.game available.");
    }
}
