/**
 * MAIN GAME ENGINE
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new SoundEngine();
        this.hunter = null;

        this.currentTheme = THEMES.rainbow_paradise;
        let savedMult = localStorage.getItem('glitch_prestige_mult');
        this.prestigeMult = savedMult ? parseFloat(savedMult) : 1.0;

        this.state = {
            score: 0,
            clickPower: 1,
            autoRate: 0,
            corruption: 0,
            multiplier: 1 * this.prestigeMult, // ПРИМЕНЯЕМ БОНУС
            startTime: Date.now(),
            glitchIntensity: 0,
            crashed: false // Флаг краша
        };

        this.loadThemeUpgrades();
        this.particles = [];
        this.chat = new ChatSystem();
        this.debris = [];
        this.popups = [];
        this.fakeUIElements = [];

        this.mouse = { x: 0, y: 0, down: false };
        this.shake = 0;

        this.resize();
        this.initFakeUI(); // Создаем CrazyFaces

        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', (e) => this.handleInput(e));
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    loadThemeUpgrades() {
        this.upgrades = this.currentTheme.upgrades.map(u => ({ ...u, count: 0, cost: u.baseCost }));
    }

    resize() {
        this.w = this.canvas.width = window.innerWidth;
        this.h = this.canvas.height = window.innerHeight;
        this.initFakeUI();
    }

    // --- CRAZYFACES GENERATOR ---
    initFakeUI() {
        this.fakeUIElements = [];
        const isGlitchTheme = this.currentTheme.id === 'digital_decay';

        // Цвета CrazyFaces
        const sidebarColor = '#161616';
        const cardColor = isGlitchTheme ? '#222' : '#2b2b2b';

        // 1. Sidebar (Left)
        const sbW = 220;
        // Просто генерируем кнопки "категорий"
        const cats = ['New', 'Trending', 'Action', 'Driving', 'Clicker', 'Horror', 'Multiplayer'];
        cats.forEach((txt, i) => {
            this.fakeUIElements.push({
                type: 'sidebar_btn',
                x: 20, y: 80 + i * 50, w: 180, h: 35,
                text: txt,
                color: '#6842ff', // Фиолетовый акцент CrazyGames
                hp: 3, // У элементов есть здоровье!
                maxHp: 3,
                active: true
            });
        });

        // 2. Game Grid (Right side background)
        // Заполняем пустое пространство фейковыми превьюшками
        const startX = sbW + 20;
        const cardW = 160;
        const cardH = 120;
        const gap = 20;
        const cols = Math.floor((this.w - startX) / (cardW + gap));
        const rows = Math.ceil(this.h / (cardH + gap));

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Не рисуем в центре, где находится наша "игра"
                const cx = this.w / 2;
                const cy = this.h / 2;
                const tx = startX + c * (cardW + gap);
                const ty = 80 + r * (cardH + gap);

                // Пропускаем зону в центре для главного круга
                const distToCenter = Math.hypot(tx + cardW / 2 - cx, ty + cardH / 2 - cy);
                if (distToCenter < 350) continue;

                this.fakeUIElements.push({
                    type: 'game_card',
                    x: tx, y: ty, w: cardW, h: cardH,
                    color: cardColor,
                    hp: 5,
                    maxHp: 5,
                    active: true,
                    // Процедурная иконка (просто тип)
                    iconType: Math.floor(Math.random() * 3)
                });
            }
        }
    }

    switchTheme(newThemeId) {
        this.currentTheme = THEMES[newThemeId];
        this.loadThemeUpgrades();
        // При смене темы не пересоздаем UI полностью, а "ломаем" его визуально в draw()
        // Но для чистоты эксперимента можно и пересоздать
        this.state.corruption = 0;

        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:999;transition:opacity 2s;';
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => flash.remove(), 2000); }, 100);
    }

    // --- LOGIC ---

    handleInput(e) {
        this.audio.resume();
        this.mouse.down = true;
        const mx = e.clientX;
        const my = e.clientY;

        // 1. Popups
        let popupHit = false;
        for (let p of this.popups) {
            const res = p.checkClick(mx, my);
            if (res) {
                popupHit = true;
                if (res === 'bonus') {
                    this.addScore(this.state.autoRate * 20 + 500);
                    this.createParticles(mx, my, this.currentTheme.colors.accent);
                    this.audio.play('buy');
                } else {
                    this.audio.play('click');
                }
            }
        }
        if (popupHit) return;

        // 2. Shop Upgrades
        let shopHit = false;
        this.upgrades.forEach((u, i) => {
            // Логика позиционирования кнопок (такая же как в draw)
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = this.w / 2 - 230 + col * 240;
            const by = this.h / 2 + 50 + row * 80;

            if (mx >= bx && mx <= bx + 220 && my >= by && my <= by + 70) {
                shopHit = true;
                if (this.state.score >= u.cost) {
                    this.buyUpgrade(u);
                } else {
                    this.audio.play('error');
                }
            }
        });
        if (shopHit) return;

        // 3. Main Button
        const cx = this.w / 2;
        const cy = this.h / 2 - 100;
        if (Math.hypot(mx - cx, my - cy) < 80) {
            this.clickMain();
            return;
        }

        // 4. DESTRUCTION OF FAKE UI (CRAZYFACES)
        // Если игрок кликнул мимо всего - он бьет сайт
        let hitUI = false;
        this.fakeUIElements.forEach(el => {
            if (el.active && mx > el.x && mx < el.x + el.w && my > el.y && my < el.y + el.h) {
                hitUI = true;
                this.damageUI(el, mx, my);
            }
        });

        if (hitUI) {
            this.shake = 3;
            this.audio.play('glitch');
            // Увеличиваем коррупцию за вандализм
            if (this.currentTheme.id === 'rainbow_paradise') {
                this.state.corruption += 0.2;
            }
        }
        if (this.hunter && this.hunter.active) {
            const hit = this.hunter.checkClick(mx, my);
            if (hit) {
                this.audio.play('click');
                this.createParticles(mx, my, '#f00');
                if (hit === true) {
                    // Убили
                    this.addScore(1000 * this.state.multiplier);
                    this.hunter = null;
                    this.chat.addMessage('Admin_Alex', 'Фух... пронесло.');
                }
                return; // Прерываем клик, чтобы не нажать на что-то под монстром
            }
        }
    }
    drawBSOD() {
        // Синий фон
        this.ctx.fillStyle = '#0000aa';
        this.ctx.fillRect(0, 0, this.w, this.h);

        // Текст
        this.ctx.fillStyle = '#fff';
        this.ctx.font = "20px 'Courier New', monospace"; // Системный шрифт
        this.ctx.textAlign = 'left';

        const x = 50;
        let y = 100;

        const lines = [
            "A problem has been detected and Windows has been shut down to prevent damage",
            "to your computer.",
            "",
            "THE_GLITCH_HAS_CONSUMED_ALL.",
            "",
            "If this is the first time you've seen this stop error screen,",
            "restart your computer. If this screen appears again, follow these steps:",
            "",
            "Check for viruses on your computer. Remove any newly installed hard drives.",
            "",
            "Technical Information:",
            "",
            "*** STOP: 0x00000666 (0xDEADDEAD, 0xC0000221, 0x00000000, 0x00000000)",
            "*** GLITCH.SYS - Address FFFFFFFF base at FFFFFFFF, DateStamp 666666",
            "",
            "Beginning dump of physical memory...",
            "Physical memory dump complete.",
            "Contact your system administrator or technical support group for further",
            "assistance."
        ];

        lines.forEach(line => {
            this.ctx.fillText(line, x, y);
            y += 28;
        });

        // Мигающий курсор внизу
        if (Date.now() % 1000 < 500) {
            this.ctx.fillRect(x, y + 20, 15, 20);
        }
    }
    damageUI(el, x, y) {
        // 1. БЛОКИРОВКА: Нельзя ломать интерфейс, пока система стабильна
        if (this.currentTheme.id === 'rainbow_paradise' && this.state.corruption < 30) {
            this.shake = 1;
            this.audio.play('error');
            // Совет: Можно добавить тут всплывающий текст, например "LOCKED"
            this.createFloatingText(x, y, "LOCKED", "#888");
            return;
        }

        // 2. НАНЕСЕНИЕ УРОНА (Ты пропустил это!)
        el.hp--;

        // 3. Спавним немного мусора при ударе
        for (let i = 0; i < 3; i++) {
            this.debris.push(new Debris(x, y, el.color));
        }

        // 4. Проверка на уничтожение
        if (el.hp <= 0) {
            el.active = false;
            // Большой взрыв мусора
            for (let i = 0; i < 15; i++) {
                this.debris.push(new Debris(el.x + el.w / 2, el.y + el.h / 2, el.color));
            }
            this.addScore(100 * this.state.multiplier);

            // Если мы в первой теме, уничтожение интерфейса сильно ускоряет порчу
            if (this.currentTheme.id === 'rainbow_paradise') {
                this.state.corruption += 1.5;
            } else {
                this.state.corruption += 0.5;
            }
        }
    }
    createFloatingText(x, y, text, color) {
        // Мы используем существующий класс Particle, но "хакнем" его
        // добавив свойство text. 
        // Если хочешь красиво - создай класс TextParticle, но так быстрее:
        const p = new Particle(x, y, color);
        p.text = text;
        p.vy = -2; // Летит строго вверх
        p.vx = 0;
        p.life = 1.0;

        // Переопределяем метод draw для этой одной частицы
        p.draw = (ctx) => {
            ctx.globalAlpha = p.life;
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = color;
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1;
        };

        this.particles.push(p);
    }

    clickMain() {
        this.addScore(this.state.clickPower);
        this.audio.play('click');
        this.createParticles(this.w / 2, this.h / 2 - 100, this.currentTheme.colors.accent);
        this.shake = 2;
        if (this.currentTheme.id === 'rainbow_paradise') this.state.corruption += 0.05;
    }

    buyUpgrade(u) {
        this.state.score -= u.cost;
        u.count++;
        u.cost = Math.floor(u.cost * 1.4);
        if (u.type === 'auto') this.state.autoRate += u.val;
        if (u.type === 'click') this.state.clickPower += u.val;
        this.audio.play('buy');
        this.state.corruption += 1.5;
    }

    addScore(val) {
        this.state.score += val * this.state.multiplier;
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    createGlitchSlice() {
        if (Math.random() > 0.3) return; // Не слишком часто
        const h = Math.random() * 30 + 5;
        const y = Math.random() * this.h;
        const offset = (Math.random() - 0.5) * 50;
        try {
            // RGB Shift simulation (быстрее чем putImageData)
            // Просто рисуем прямоугольник со смещением в режиме XOR или SCREEN
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = UTILS.randArr(['#f0f', '#0ff', '#ff0']);
            this.ctx.fillRect(0, y, this.w, h);
            this.ctx.globalCompositeOperation = 'source-over';
        } catch (e) { }
    }

    // --- UPDATE LOOP ---

    update(dt) {
        this.addScore(this.state.autoRate * dt);
        this.chat.update(dt, this.state.corruption);

        // --- ЛОГИКА СМЕНЫ ТЕМ И КОНЦОВКИ ---

        // Если мы уже в состоянии "КРАШ", ничего не обновляем, ждем рестарта
        if (this.state.crashed) {
            this.rebootTimer -= dt;
            if (this.rebootTimer <= 0) {
                this.hardReset();
            }
            return;
        }

        // Логика перехода тем
        if (this.currentTheme.id === 'rainbow_paradise') {
            this.state.glitchIntensity = Math.max(0, (this.state.corruption - 30) / 70);
            if (this.state.corruption >= 100) this.switchTheme('digital_decay');
        } else {
            // Digital Decay Phase
            this.state.glitchIntensity = 0.2 + (this.state.corruption / 100) * 0.8;

            // ФИНАЛ: Если коррупция > 100% во второй фазе
            if (this.state.corruption >= 100) {
                this.triggerCrash();
            }
        }

        // Particles
        this.particles.forEach((p, i) => {
            p.update();
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        // Debris Physics & Collection
        this.debris.forEach((d, i) => {
            const res = d.update(dt, this.h, this.mouse.x, this.mouse.y);
            if (res === 'collected') {
                this.addScore(10 * this.state.multiplier);
                this.audio.play('click'); // Тихий клик
            }
            if (d.life <= 0) this.debris.splice(i, 1);
        });

        // Popups
        this.popups.forEach((p, i) => {
            p.life -= dt;
            if (p.life <= 0) this.popups.splice(i, 1);
        });
        // Random events based on glitch
        if (Math.random() < 0.001 + (this.state.glitchIntensity * 0.02)) {
            if (this.popups.length < 5) this.popups.push(new Popup(this.w, this.h));
        }

        if (this.shake > 0) this.shake *= 0.9;
        this.addScore(this.state.autoRate * dt);

        if (!this.hunter && this.state.corruption > 40 && Math.random() < 0.001) {
            this.hunter = new GlitchHunter(this.w, this.h);
            this.chat.addMessage('SYSTEM', 'WARNING: VIRUS DETECTED');
            this.audio.play('error');
        }

        // Обновление Охотника
        if (this.hunter && this.hunter.active) {
            const status = this.hunter.update(this.mouse.x, this.mouse.y, dt);

            if (status === 'damage') {
                // Игрок теряет очки!
                this.state.score -= this.state.autoRate * dt * 2; // Теряем 2x от дохода
                if (this.state.score < 0) this.state.score = 0;

                // Визуальный эффект боли
                this.shake = 5;
                this.ctx.fillStyle = 'rgba(255,0,0,0.1)';
                this.ctx.fillRect(0, 0, this.w, this.h);
            }
        }
    }

    // --- DRAW LOOP ---

    draw() {
        // 0. Если краш - рисуем только BSOD и выходим
        if (this.state.crashed) {
            this.drawBSOD();
            return;
        }

        this.ctx.save();

        if (this.shake > 0.5) {
            this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }

        // Background
        this.ctx.fillStyle = this.currentTheme.colors.bg;
        this.ctx.fillRect(0, 0, this.w, this.h);

        // CRAZYFACES UI LAYER
        this.drawCrazyFaces();

        // GAME CENTER LAYER
        // Затемняем фон под игрой, чтобы UI не мешал
        const cx = this.w / 2;
        const cy = this.h / 2;

        // Vignette center
        const grad = this.ctx.createRadialGradient(cx, cy, 100, cx, cy, 500);
        grad.addColorStop(0, this.currentTheme.colors.bg);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.w, this.h);

        this.drawGameUI();

        // Particles & Debris
        this.debris.forEach(d => d.draw(this.ctx));
        this.particles.forEach(p => p.draw(this.ctx));
        this.popups.forEach(p => p.draw(this.ctx));

        // Post Processing
        if (this.state.glitchIntensity > 0.1) {
            if (Math.random() < this.state.glitchIntensity * 0.1) this.createGlitchSlice();
            this.drawPostEffects();
        }
        if (this.hunter) this.hunter.draw(this.ctx);

        this.chat.draw(this.ctx, this.h);
        this.drawCursor();
        this.ctx.restore();
    }

    drawCrazyFaces() {
        const uiColor = '#6842ff'; // CrazyGames Purple
        const textColor = '#fff';

        // Sidebar BG
        this.ctx.fillStyle = '#161616';
        this.ctx.fillRect(0, 0, 240, this.h);

        // Logo Area
        this.ctx.fillStyle = uiColor;
        this.ctx.font = "bold 24px Arial";
        this.ctx.fillText("CrazyFaces", 20, 40);

        this.fakeUIElements.forEach(el => {
            if (!el.active) return;

            // Если элемент поврежден, он меняет цвет или дрожит
            let dx = 0, dy = 0;
            if (el.hp < el.maxHp) {
                dx = (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 2;
            }

            if (el.type === 'sidebar_btn') {
                this.ctx.fillStyle = (el.hp < el.maxHp) ? '#444' : '#222';
                this.ctx.fillRect(el.x + dx, el.y + dy, el.w, el.h);
                // Icon placeholder
                this.ctx.fillStyle = el.color;
                this.ctx.fillRect(el.x + 5 + dx, el.y + 5 + dy, 25, 25);
                // Text
                this.ctx.fillStyle = '#eee';
                this.ctx.font = '14px Arial';
                let txt = el.text;
                if (this.state.glitchIntensity > 0.5) txt = UTILS.corrupt(txt, 0.5);
                this.ctx.fillText(txt, el.x + 40 + dx, el.y + 22 + dy);
            }
            else if (el.type === 'game_card') {
                // Card BG
                this.ctx.fillStyle = (el.hp < el.maxHp) ? '#333' : el.color;
                this.ctx.fillRect(el.x + dx, el.y + dy, el.w, el.h);

                // Procedural Thumbnail Art
                this.ctx.fillStyle = '#444';
                if (el.iconType === 0) { // Car
                    this.ctx.fillStyle = '#f55';
                    this.ctx.fillRect(el.x + 40 + dx, el.y + 50 + dy, 80, 30);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.beginPath(); this.ctx.arc(el.x + 60 + dx, el.y + 80 + dy, 10, 0, Math.PI * 2); this.ctx.fill();
                    this.ctx.beginPath(); this.ctx.arc(el.x + 100 + dx, el.y + 80 + dy, 10, 0, Math.PI * 2); this.ctx.fill();
                } else if (el.iconType === 1) { // Sword
                    this.ctx.strokeStyle = '#5ff';
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(el.x + 40 + dx, el.y + 90 + dy);
                    this.ctx.lineTo(el.x + 120 + dx, el.y + 30 + dy);
                    this.ctx.stroke();
                } else { // Clicker Circle
                    this.ctx.fillStyle = '#ff5';
                    this.ctx.beginPath();
                    this.ctx.arc(el.x + el.w / 2 + dx, el.y + el.h / 2 + dy, 20, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        });
    }

    drawGameUI() {
        const cx = this.w / 2;
        const cy = this.h / 2;
        const colors = this.currentTheme.colors;

        // Main Button
        this.ctx.beginPath();
        this.ctx.arc(cx, cy - 100, 80, 0, Math.PI * 2);

        const btnGrad = this.ctx.createRadialGradient(cx, cy - 100, 10, cx, cy - 100, 80);

        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        // Рассчитываем позицию (offset) как долю от 0 до 1
        const gradColors = this.currentTheme.button.gradient;
        gradColors.forEach((c, i) => {
            // Если цветов больше 1, делим индекс на (кол-во - 1), иначе 0
            const offset = gradColors.length > 1 ? i / (gradColors.length - 1) : 0;
            btnGrad.addColorStop(offset, c);
        });
        // -------------------------

        this.ctx.fillStyle = btnGrad;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 5;
        this.ctx.stroke();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.currentTheme.button.emoji, cx, cy - 100);
        this.ctx.textBaseline = 'alphabetic';

        // Score
        this.ctx.font = this.currentTheme.fonts.xl;
        this.ctx.fillStyle = colors.accent;
        this.ctx.shadowColor = colors.accent;
        this.ctx.shadowBlur = 10;
        this.ctx.fillText(UTILS.fmt(this.state.score) + ' ' + this.currentTheme.currency.symbol, cx, cy - 200);
        this.ctx.shadowBlur = 0;

        // Upgrades GRID
        this.upgrades.forEach((u, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx = cx - 230 + col * 240;
            const by = cy + 50 + row * 80;
            const canAfford = this.state.score >= u.cost;

            this.ctx.fillStyle = canAfford ? colors.ui : '#555';
            this.ctx.fillRect(bx, by, 220, 70);
            this.ctx.strokeStyle = canAfford ? colors.accent : '#777';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(bx, by, 220, 70);

            this.ctx.textAlign = 'left';
            this.ctx.fillStyle = canAfford ? colors.text : '#aaa';
            this.ctx.font = this.currentTheme.fonts.m;

            let name = u.name;
            if (this.state.glitchIntensity > 0.5) name = UTILS.corrupt(name, 0.2);

            this.ctx.fillText(name, bx + 10, by + 25);
            this.ctx.font = this.currentTheme.fonts.s;
            // Здесь используем accent3, который есть и в rainbow, и в digital темах
            this.ctx.fillStyle = canAfford ? (colors.accent3 || '#fff') : '#999';
            this.ctx.fillText(`Cost: ${UTILS.fmt(u.cost)}`, bx + 10, by + 45);
        });

        // Progress Bar
        const barY = this.h - 40;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(cx - 200, barY, 400, 25);
        const progress = Math.min(this.state.corruption, 100);

        // Проверка на наличие цвета, чтобы избежать ошибки при смене темы
        const barColor = this.currentTheme.progressBar ? this.currentTheme.progressBar.color : '#f00';
        this.ctx.fillStyle = barColor;
        this.ctx.fillRect(cx - 200, barY, (progress / 100) * 400, 25);

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fff';
        const barLabel = this.currentTheme.progressBar ? this.currentTheme.progressBar.label : 'LOADING';
        this.ctx.fillText(`${barLabel}: ${progress.toFixed(1)}%`, cx, barY + 18);
    }

    drawPostEffects() {
        if (this.state.glitchIntensity > 0.5) {
            this.ctx.fillStyle = "rgba(0,0,0,0.1)";
            for (let i = 0; i < this.h; i += 4) this.ctx.fillRect(0, i, this.w, 2);
        }
        // Vignette
        const grad = this.ctx.createRadialGradient(this.w / 2, this.h / 2, this.h / 2, this.w / 2, this.h / 2, this.h);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, "rgba(0,0,0,0.6)");
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    drawCursor() {
        const x = this.mouse.x;
        const y = this.mouse.y;
        this.ctx.strokeStyle = this.currentTheme.colors.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 10); this.ctx.lineTo(x, y + 10);
        this.ctx.moveTo(x - 10, y); this.ctx.lineTo(x + 10, y);
        this.ctx.stroke();
    }

    loop(t) {
        const dt = (t - this.lastTime) / 1000;
        this.lastTime = t;
        if (dt < 0.5) {
            this.update(dt);
            this.draw();
        }
        requestAnimationFrame((time) => this.loop(time));
    }
    triggerCrash() {
        this.state.crashed = true;
        this.rebootTimer = 8.0; // 8 секунд наслаждаемся синим экраном
        this.audio.play('glitch'); // Прощальный звук
        // Можно остановить музыку, если она была
    }

    hardReset() {
        // Сохраняем "Престиж"
        // Допустим, каждый рестарт дает +50% к множителю навсегда
        let savedMult = localStorage.getItem('glitch_prestige_mult');
        savedMult = savedMult ? parseFloat(savedMult) : 1.0;
        savedMult += 0.5;
        localStorage.setItem('glitch_prestige_mult', savedMult);

        // Перезагружаем страницу по-настоящему для эффекта
        location.reload();
    }
}
window.onload = () => { window.game = new Game(); };