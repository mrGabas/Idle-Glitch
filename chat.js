/**
 * NARRATIVE SYSTEM (CONSOLE CHAT)
 */

const SCRIPT = [
    // --- Phase 1: Tutorial / Cute ---
    { trigger: 0, author: 'Admin_Alex', text: 'Добро пожаловать в Rainbow Paradise! 🌈' },
    { trigger: 5, author: 'Admin_Alex', text: 'Жми на радугу, собирай Искры!' },
    { trigger: 15, author: 'Admin_Alex', text: 'Магазин открыт. Покупай апгрейды!' },

    // --- Phase 2: Confusion (20-40%) ---
    { trigger: 25, author: 'Admin_Alex', text: 'Хм, сервер фиксирует лаги...' },
    { trigger: 30, author: 'Admin_Alex', text: 'Ты видишь эти пиксели? Странно.' },
    { trigger: 35, author: 'Admin_Alex', text: 'Не кликай по левой панели, там баг.' },

    // --- Phase 3: Concern (40-70%) ---
    { trigger: 50, author: 'Admin_Alex', text: 'Пожалуйста, прекрати. Система падает.' },
    { trigger: 60, author: 'Admin_Alex', text: 'Зачем ты купил Глитч-майнер?!' },
    { trigger: 70, author: 'Admin_Alex', text: 'Я теряю контроль над консолью...' },

    // --- Phase 4: Horror / Glitch (80%+) ---
    { trigger: 80, author: 'SYSTEM', text: 'CRITICAL ERROR: INTEGRITY FAILURE.' },
    { trigger: 90, author: 'Admin_Alex', text: 'ОНО ЗДЕСЬ. ОНО СМОТРИТ.' },
    { trigger: 95, author: 'UNKNOWN', text: '01000110 01010010 01000101 01000101' },
    { trigger: 100, author: '???', text: 'ТВОЯ ДУША ТЕПЕРЬ НАША.' }
];

class ChatSystem {
    constructor() {
        this.messages = [];
        // Копируем скрипт, чтобы помечать показанные
        this.script = SCRIPT.map(s => ({ ...s, shown: false }));

        // Добавим приветственное сообщение сразу
        this.addMessage('SYSTEM', 'Connecting to secure server...');
    }

    update(dt, corruption) {
        // 1. Проверка триггеров сюжета
        this.script.forEach(msg => {
            if (!msg.shown && corruption >= msg.trigger) {
                this.addMessage(msg.author, msg.text);
                msg.shown = true;
            }
        });

        // 2. Обновление таймеров
        this.messages.forEach((msg) => {
            msg.life -= dt;
        });

        // Удаляем совсем старые сообщения, чтобы не засорять память,
        // но оставляем их подольше, чтобы в консоли была история
        if (this.messages.length > 8) {
            this.messages.shift();
        }
    }

    addMessage(author, text) {
        this.messages.push({
            author: author,
            text: text,
            life: 15.0, // Живут долго
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" })
        });
    }

    draw(ctx, h) {
        // Сохраняем контекст, чтобы стили не ломали остальную игру
        ctx.save();

        // --- НАСТРОЙКИ КОНСОЛИ ---
        const boxH = 260;   // Высота консоли
        const boxW = 580;   // Ширина консоли
        const x = 10;       // Отступ слева
        const y = h - boxH - 10; // Отступ снизу (10px от края)

        // 1. Рисуем окно терминала
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'; // Темный фон
        ctx.fillRect(x, y, boxW, boxH);

        // Рамка терминала
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, boxW, boxH);

        // Заголовок терминала
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, boxW, 20);
        ctx.fillStyle = '#0f0';
        ctx.font = "12px 'Courier New', monospace";
        ctx.textAlign = 'left'; // ВАЖНО: Принудительно ставим выравнивание влево
        ctx.fillText("> DEBUG_CONSOLE_V.0.9", x + 5, y + 14);

        // 2. Рисуем сообщения
        // Используем clip(), чтобы текст не вылезал за рамки
        ctx.beginPath();
        ctx.rect(x, y + 20, boxW, boxH - 20);
        ctx.clip();

        ctx.font = "20px 'VT323', monospace"; // Моноширинный шрифт

        // Рисуем последние 6 сообщений
        const visibleMsgs = this.messages.slice(-6);

        visibleMsgs.forEach((msg, i) => {
            const msgY = y + 40 + (i * 20); // Сдвигаем каждую строку вниз

            // Цвет текста зависит от автора
            let color = '#ccc'; // Обычный текст
            if (msg.author === 'Admin_Alex') color = '#55ff55'; // Зеленый для админа
            if (msg.author === 'SYSTEM') color = '#ffff55';     // Желтый для системы
            if (msg.author === 'UNKNOWN' || msg.author === '???') color = '#ff3333'; // Красный для врага

            ctx.fillStyle = color;

            // Форматируем строку: [TIME] [AUTHOR]: Message
            const line = `[${msg.timestamp}] [${msg.author}]: ${msg.text}`;

            ctx.fillText(line, x + 8, msgY);
        });

        ctx.restore();
    }
}