/**
 * GAME ENTITIES (Particle, Debris, Popup, GlitchHunter)
 */

class Particle {
    constructor(x, y, color, size = 2) {
        this.x = x; this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.size = size;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Обломки интерфейса с физикой
class Debris extends Particle {
    constructor(x, y, color) {
        super(x, y, color, Math.random() * 4 + 2); // Чуть крупнее
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 2) * 5; // Взрыв вверх
        this.gravity = 0.5;
        this.grounded = false;
        this.life = 20.0; // Живут долго
        this.collected = false;
    }

    update(dt, h, mx, my) {
        if (this.collected) return;

        // Физика
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Пол (Collision)
        if (this.y > h - 10) {
            this.y = h - 10;
            this.vy *= -0.5; // Отскок
            this.vx *= 0.9;  // Трение
            if (Math.abs(this.vy) < 1) this.grounded = true;
        }

        // Стены
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;

        // Магнит курсора (Сбор мусора)
        if (this.grounded) {
            const dx = mx - this.x;
            const dy = my - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 50) {
                // Притягиваем к мышке
                this.x += dx * 0.2;
                this.y += dy * 0.2;
                if (dist < 10) {
                    this.life = 0; // Собрали
                    this.collected = true;
                    return 'collected';
                }
            }
        }

        this.life -= 0.005; // Исчезают очень медленно
    }
}

class Popup {
    constructor(w, h) {
        this.w = 240; this.h = 140;
        this.x = UTILS.rand(50, w - 290);
        this.y = UTILS.rand(50, h - 190);
        this.type = Math.random() > 0.3 ? 'error' : 'bonus';
        this.title = this.type === 'error' ? 'SYSTEM ALERT' : 'WINNER!';
        this.msg = this.type === 'error' ? 'Unauthorized access.' : 'Free BITCOIN found!';
        this.btnText = this.type === 'error' ? 'CLOSE' : 'GET';
        this.life = 5.0;
        this.active = true;
    }

    draw(ctx) {
        if (!this.active) return;
        // Тень окна
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // Win95 Style
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Borders (Bevel)
        ctx.fillStyle = '#fff'; // Top/Left light
        ctx.fillRect(this.x, this.y, this.w, 2);
        ctx.fillRect(this.x, this.y, 2, this.h);
        ctx.fillStyle = '#000'; // Bottom/Right shadow
        ctx.fillRect(this.x + this.w - 2, this.y, 2, this.h);
        ctx.fillRect(this.x, this.y + this.h - 2, this.w, 2);

        // Header
        const headerColor = this.type === 'error' ? '#800000' : '#000080';
        ctx.fillStyle = headerColor;
        ctx.fillRect(this.x + 4, this.y + 4, this.w - 8, 20);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.title, this.x + 8, this.y + 18);

        // Content
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.msg, this.x + this.w / 2, this.y + 60);

        // Button
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(bx, by, 80, 24);
        // Button bevel
        ctx.fillStyle = '#fff';
        ctx.fillRect(bx, by, 80, 2); ctx.fillRect(bx, by, 2, 24);
        ctx.fillStyle = '#000';
        ctx.fillRect(bx + 78, by, 2, 24); ctx.fillRect(bx, by + 22, 80, 2);

        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(this.btnText, bx + 40, by + 16);
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        const bx = this.x + this.w / 2 - 40;
        const by = this.y + 90;
        if (mx >= bx && mx <= bx + 80 && my >= by && my <= by + 24) {
            this.active = false;
            return this.type;
        }
        return null;
    }
}

// ОХОТНИК (Отдельный класс)
class GlitchHunter {
    constructor(w, h) {
        // Спавним за пределами экрана
        this.x = Math.random() < 0.5 ? -50 : w + 50;
        this.y = Math.random() * h;
        this.size = 30;
        this.speed = 1.5; // Скорость преследования
        this.hp = 5;      // Сколько кликов нужно, чтобы убить
        this.active = true;
        this.pulse = 0;
    }

    update(mx, my, dt) {
        if (!this.active) return;

        // 1. Движение к курсору
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.hypot(dx, dy);

        // Нормализация вектора движения
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // 2. Пульсация визуальная
        this.pulse += dt * 5;

        // 3. Атака (если догнал курсор)
        if (dist < this.size + 10) {
            return 'damage'; // Сигнал игре, что игрок получает урон
        }
        return null;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Эффект "Глючного глаза"
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);

        // Аура
        ctx.fillStyle = `rgba(255, 0, 0, 0.3)`;
        ctx.beginPath();
        ctx.arc(0, 0, this.size + 10, 0, Math.PI * 2);
        ctx.fill();

        // Ядро
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        // Рисуем не ровный круг, а искаженный
        for (let i = 0; i < Math.PI * 2; i += 0.5) {
            let r = this.size + Math.random() * 5;
            ctx.lineTo(Math.cos(i) * r, Math.sin(i) * r);
        }
        ctx.fill();

        // "Зрачок"
        ctx.fillStyle = '#000';
        ctx.fillRect(-5, -15, 10, 30); // Вертикальный зрачок

        ctx.restore();
    }

    checkClick(mx, my) {
        const dist = Math.hypot(mx - this.x, my - this.y);
        if (dist < this.size + 15) {
            this.hp--;
            // Отбрасываем назад при клике
            this.x += (this.x - mx) * 2;
            this.y += (this.y - my) * 2;

            if (this.hp <= 0) {
                this.active = false;
                return true; // Killed
            }
            return 'hit'; // Just hit
        }
        return false;
    }
}