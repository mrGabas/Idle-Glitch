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

class CursedCaptcha {
    constructor(w, h) {
        this.w = 300; this.h = 100;
        this.x = UTILS.rand(50, w - 350);
        this.y = UTILS.rand(50, h - 150);
        this.life = 10.0; // 10 секунд чтобы подтвердить
        this.active = true;
        this.isEye = false;

        // Позиция чекбокса внутри окна
        this.cbX = 20;
        this.cbY = 30;
        this.cbSize = 24;
    }

    update(dt, mx, my, w, h) {
        if (!this.active) return;
        this.life -= dt;
        if (this.life <= 0) return 'timeout';

        // Check distance to checkbox center (absolute coords)
        const absCbX = this.x + this.cbX + this.cbSize / 2;
        const absCbY = this.y + this.cbY + this.cbSize / 2;

        const dist = Math.hypot(mx - absCbX, my - absCbY);

        // 1. Превращение в глаз
        if (dist < 100) {
            this.isEye = true;
        } else {
            this.isEye = false;
        }

        // 2. Убегание
        if (dist < 80) {
            // Вектор от мыши
            const dx = absCbX - mx;
            const dy = absCbY - my;

            // Двигаем само окно
            this.x += dx * 0.1;
            this.y += dy * 0.1;

            // Borders
            if (this.x < 0) this.x = 0;
            if (this.x > w - this.w) this.x = w - this.w;
            if (this.y < 0) this.y = 0;
            if (this.y > h - this.h) this.y = h - this.h;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // BG like reCAPTCHA
        ctx.fillStyle = '#f9f9f9';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Border
        ctx.strokeStyle = '#d3d3d3';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Checkbox area
        if (this.isEye) {
            // Глаз вместо чекбокса
            const cx = this.x + this.cbX + this.cbSize / 2;
            const cy = this.y + this.cbY + this.cbSize / 2;

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(cx, cy, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Зрачок (бегает)
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(cx + (Math.random() - 0.5) * 5, cy + (Math.random() - 0.5) * 5, 5, 0, Math.PI * 2);
            ctx.fill();

        } else {
            // Обычный чекбокс
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.x + this.cbX, this.y + this.cbY, this.cbSize, this.cbSize);
            ctx.strokeStyle = '#c1c1c1';
            ctx.strokeRect(this.x + this.cbX, this.y + this.cbY, this.cbSize, this.cbSize);
        }

        // Text
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText("I'm not a robot", this.x + 60, this.y + 48);

        // Recaptcha logo fake
        ctx.fillStyle = '#555';
        ctx.font = '10px Arial';
        ctx.fillText("reCAPTCHA", this.x + 230, this.y + 80);
        ctx.fillText("Privacy - Terms", this.x + 220, this.y + 92);

        // Timer bar
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y + this.h - 4, this.w * (this.life / 10), 4);
    }

    checkClick(mx, my) {
        const valMargin = 10; // Погрешность для клика, так как оно убегает
        const absCbX = this.x + this.cbX;
        const absCbY = this.y + this.cbY;

        // Клик должен быть именно по чекбоксу
        if (mx >= absCbX - valMargin && mx <= absCbX + this.cbSize + valMargin &&
            my >= absCbY - valMargin && my <= absCbY + this.cbSize + valMargin) {
            this.active = false;
            return true; // Success
        }
        return false;
    }
}

// --- LORE ENTITIES ---

class LoreFile {
    constructor(w, h) {
        this.w = 50;
        this.h = 60;
        // Spawn randomly but avoid center (gameplay area)
        let safe = false;
        while (!safe) {
            this.x = UTILS.rand(50, w - 100);
            this.y = UTILS.rand(50, h - 100);
            const cx = w / 2;
            const cy = h / 2;
            if (Math.hypot(this.x - cx, this.y - cy) > 300) safe = true;
        }

        this.label = UTILS.randArr(['PRIVATE', 'DONT_OPEN', 'secrets.txt', 'diary.log', 'passwords.txt']);
        this.active = true;
        this.life = 30.0; // Exist for 30 seconds
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Icon (Folder)
        ctx.fillStyle = '#ebb434'; // Folder yellow
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(20, 5);
        ctx.lineTo(25, 0);
        ctx.lineTo(50, 0);
        ctx.lineTo(50, 40);
        ctx.lineTo(0, 40);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c59218';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(this.label, 25, 55);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    checkClick(mx, my) {
        if (!this.active) return false;
        if (mx >= this.x && mx <= this.x + 50 && my >= this.y && my <= this.y + 60) {
            this.active = false; // Disappear after opening
            return true;
        }
        return false;
    }
}

class NotepadWindow {
    constructor(w, h, content) {
        this.w = 400;
        this.h = 300;
        this.x = (w - this.w) / 2;
        this.y = (h - this.h) / 2;
        this.content = content || "Error: Corrupted File";
        this.active = true;
        this.title = "Notepad.exe";
    }

    draw(ctx) {
        if (!this.active) return;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x + 5, this.y + 5, this.w, this.h);

        // Main Window
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Title Bar
        ctx.fillStyle = '#000080'; // Navy blue
        ctx.fillRect(this.x + 2, this.y + 2, this.w - 4, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(this.title, this.x + 6, this.y + 16);

        // Close Button [X]
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(bx, by, 14, 14);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bx, by + 14); ctx.lineTo(bx, by); ctx.lineTo(bx + 14, by); ctx.stroke();
        ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(bx + 14, by); ctx.lineTo(bx + 14, by + 14); ctx.lineTo(bx, by + 14); ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.fillText('X', bx + 3, by + 11);

        // Menu Bar
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText("File   Edit   Format   View   Help", this.x + 6, this.y + 35);
        ctx.strokeStyle = '#ccc';
        ctx.beginPath(); ctx.moveTo(this.x, this.y + 40); ctx.lineTo(this.x + this.w, this.y + 40); ctx.stroke();

        // Content Area
        ctx.fillStyle = '#000';
        ctx.font = "16px 'Courier New', monospace";
        const lines = this.getLines(ctx, this.content, this.w - 20);
        let ly = this.y + 60;
        lines.forEach(line => {
            ctx.fillText(line, this.x + 10, ly);
            ly += 20;
        });
    }

    getLines(ctx, text, maxWidth) {
        var words = text.split(" ");
        var lines = [];
        var currentLine = words[0];

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    checkClick(mx, my) {
        if (!this.active) return false;

        // Check Close Button
        const bx = this.x + this.w - 18;
        const by = this.y + 4;
        if (mx >= bx && mx <= bx + 14 && my >= by && my <= by + 14) {
            this.active = false;
            return true;
        }

        // Consume click inside window (prevent clicking game behind it)
        if (mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h) {
            return true;
        }

        return false;
    }
}