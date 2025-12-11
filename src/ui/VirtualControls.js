
export class VirtualControls {
    constructor(game) {
        this.game = game;
        this.active = false;

        // Configuration
        this.btnSize = 60;
        this.gap = 10;

        this.elements = {};

        this.createDOM();
        this.checkMobile();

        window.addEventListener('resize', () => this.checkMobile());
    }

    createDOM() {
        // ... (Styles and Container setup same as before, skipping style injection for brevity if possible, but replace tool needs full logic or we rely on existing style block if not changing it.
        // I will replace createDOM content to update button creation with groups)

        // Container
        this.container = document.createElement('div');
        this.container.id = 'virtual-controls';
        Object.assign(this.container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'none',
            zIndex: '9999',
            fontFamily: '"Courier New", monospace',
            userSelect: 'none',
            touchAction: 'none'
        });
        document.body.appendChild(this.container);

        // Inject Styles (Idempotent check ideally, but overwriting is fine)
        const style = document.createElement('style');
        style.textContent = `
            .v-btn {
                position: absolute;
                background: rgba(0, 0, 0, 0.3);
                border: 2px solid #0f0;
                color: #0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 24px;
                border-radius: 50%;
                pointer-events: auto;
                transition: background 0.1s, transform 0.1s, opacity 0.2s;
                backdrop-filter: blur(2px);
                user-select: none;
                -webkit-user-select: none;
                touch-action: none;
            }
            .v-btn:active, .v-btn.active {
                background: rgba(0, 255, 0, 0.3);
                transform: scale(0.95);
            }
            .v-btn.hidden {
                opacity: 0;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        // --- BUTTON GROUPS ---
        this.groups = {
            dpad: [],
            actions: []
        };

        const startX = 20;
        const startBottom = 20;

        // D-PAD
        this.createButton('UP', startX + this.btnSize + this.gap, startBottom + this.btnSize * 2 + this.gap * 2, '▲', 'dpad');
        this.createButton('DOWN', startX + this.btnSize + this.gap, startBottom, '▼', 'dpad');
        this.createButton('LEFT', startX, startBottom + this.btnSize + this.gap, '◀', 'dpad');
        this.createButton('RIGHT', startX + (this.btnSize + this.gap) * 2, startBottom + this.btnSize + this.gap, '▶', 'dpad');

        // ACTIONS
        const actionBottom = 40;
        const actionRight = 40;

        this.createButton('CONFIRM', null, actionBottom + 20, 'A', 'actions', { right: actionRight });
        this.createButton('CANCEL', null, actionBottom - 10, 'B', 'actions', { right: actionRight + this.btnSize + 20 });

        // Removed PAUSE ('P') button as per user feedback
    }

    createButton(action, left, bottom, label, group, options = {}) {
        const btn = document.createElement('div');
        btn.className = 'v-btn hidden'; // Hidden by default
        btn.innerText = label;

        const size = options.size || this.btnSize;

        Object.assign(btn.style, {
            width: size + 'px',
            height: size + 'px',
        });

        if (left !== null) btn.style.left = left + 'px';
        if (bottom !== null) btn.style.bottom = bottom + 'px';
        if (options.right) btn.style.right = options.right + 'px';

        // Events
        const startHandler = (e) => {
            e.preventDefault();
            btn.classList.add('active');
            this.game.input.setVirtualButtonState(action, true);
        };

        const endHandler = (e) => {
            e.preventDefault();
            btn.classList.remove('active');
            this.game.input.setVirtualButtonState(action, false);
        };

        btn.addEventListener('touchstart', startHandler, { passive: false });
        btn.addEventListener('touchend', endHandler, { passive: false });
        btn.addEventListener('mousedown', startHandler);
        btn.addEventListener('mouseup', endHandler);
        btn.addEventListener('mouseleave', endHandler);

        this.container.appendChild(btn);
        this.elements[action] = btn;
        if (this.groups[group]) this.groups[group].push(btn);
    }

    checkMobile() {
        const isMobile = 'ontouchstart' in window || window.innerWidth < 1000;
        if (isMobile) {
            this.container.style.display = 'block';
            this.active = true;
        } else {
            this.container.style.display = 'none';
            this.active = false;
        }
    }

    /**
     * Updates visibility of buttons based on context.
     * @param {string} mode - 'none', 'bios', 'snake', 'menu'
     */
    setContext(mode) {
        if (!this.active) return;

        // Reset all to hidden
        Object.values(this.elements).forEach(el => el.classList.add('hidden'));

        if (mode === 'none') return;

        if (mode === 'bios') {
            // BIOS needs UP, DOWN, CONFIRM (A)
            this.elements['UP'].classList.remove('hidden');
            this.elements['DOWN'].classList.remove('hidden');
            this.elements['CONFIRM'].classList.remove('hidden');
        } else if (mode === 'snake') {
            // Snake needs D-PAD + CONFIRM (for restart)
            this.groups['dpad'].forEach(el => el.classList.remove('hidden'));
            this.elements['CONFIRM'].classList.remove('hidden');
        } else if (mode === 'menu') {
            // Menus might need Back (B)
            this.elements['CANCEL'].classList.remove('hidden');
        }
    }
}
