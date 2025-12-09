/**
 * NARRATIVE SYSTEM DATA
 * @module data/chatScripts
 */

export const SCRIPT = [
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
