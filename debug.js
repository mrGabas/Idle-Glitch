/**
 * DEBUG TOOLS (DELETE BEFORE RELEASE)
 */

(function () {
    // Ждем загрузки игры
    window.addEventListener('load', () => {

        // Создаем кнопку
        const btn = document.createElement('div');
        btn.innerText = "DEV: +10% CORRUPTION";

        // Стили (чтобы висела поверх всего)
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

        // ЛОГИКА
        btn.addEventListener('click', () => {
            if (window.game) {
                // Добавляем 10% прогресса
                window.game.state.corruption += 10;

                // Визуальный фидбек
                btn.style.background = '#0f0';
                btn.innerText = `CORRUPTION: ${window.game.state.corruption.toFixed(1)}%`;
                setTimeout(() => {
                    btn.style.background = 'red';
                    btn.innerText = "DEV: +10% CORRUPTION";
                }, 200);

                console.log('DEV: Corruption increased');
            } else {
                alert('Game instance not found! Check window.game');
            }
        });

        // Правый клик - ДЕНЬГИ
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Чтобы меню браузера не вылезало
            if (window.game) {
                window.game.state.score += 1000000;
                btn.innerText = "+1M CASH!";
                setTimeout(() => btn.innerText = "DEV: +10% CORRUPTION", 500);
            }
        });
    });
})();