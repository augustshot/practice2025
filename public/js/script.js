document.addEventListener('DOMContentLoaded', () => {
    const maxDepth = 50000;
    let lastScroll = 0;
    let ticking = false;
    
    const layers = [
        { element: document.getElementById('layer1'), speed: 0.3, height: 600 },
        { element: document.getElementById('layer2'), speed: 1, height: 800 },
        { element: document.getElementById('layer3'), speed: 1.6, height: 1000 }
    ];

    const stones = Array.from({length: 24}, (_, i) => ({
        element: document.querySelector(`.stone-${i+1}`),
        minDepth: document.querySelector(`.stone-${i+1}`).offsetTop-2000,
        maxDepth: document.querySelector(`.stone-${i+1}`).offsetTop + document.documentElement.clientHeight*3
        
    }));
    const stonesData = [
    { name: "Алмаз", depth: "50-1200" },
    { name: "Аквамарин", depth: "50-500" },
    { name: "Яшма", depth: "10-200" },
    { name: "Бирюза", depth: "10-100"},
    { name: "Горный хрусталь", depth:  "10-500"},

    { name: "Авантюрин", depth:  "10-300" },
    { name: "Циркон", depth:  "10-300" },
    { name: "Диоптаз", depth: "50-300" },
    { name: "Азурит", depth:  "50-500" },
    { name: "Малахит", depth:  "50-500" },

    { name: "Цитрин", depth:  "50-500" },
    { name: "Гелиодор", depth: "50-500" },
    { name: "Изумруд", depth: "50-500" },
    { name: "Рубин", depth:  "50-500" },
    { name: "Сапфир" , depth:  "50-500" },

    { name: "Александрит" , depth: "50-500" },
    { name: "Шпинель" , depth:  "50-500" },
    { name: "Хризолит" , depth:  "50-500"},
    { name: "Топаз", depth:  "50-800" },
    { name: "Гранат", depth:  "50-800" },

    { name: "Золото", depth:  "50-3000" },
    { name: "Эритрин", depth:  "100-500" },
    { name: "Серебро", depth:  "100-1000" },
    { name: "Висмут", depth:  "100-1000" }];

    const tooltip = document.getElementById('tooltip');
    let activeTooltip = null;

    // Обработчики для камней
    stones.forEach((stone, index) => {
        stone.element.addEventListener('click', (e) => {
            // Закрываем предыдущее окно
            if (activeTooltip) {
                activeTooltip.classList.remove('visible');
            }

            // Позиционируем новое окно
            const rect = stone.element.getBoundingClientRect();
            const x = stone.element.offsetLeft;
            const y = stone.element.offsetTop-stone.element.offsetHeight;
            
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            
            // Заполняем данными
            tooltip.innerHTML = `
                <h3>${stonesData[index].name}</h3>
                <p><strong>Глубина:</strong> ${stonesData[index].depth} </p>
            `;
            
            tooltip.classList.add('visible');
            activeTooltip = tooltip;
            
            // Закрытие при клике вне окна
            e.stopPropagation();
        });
    });

    // Закрытие при клике в любом есте
    document.addEventListener('click', () => {
        if (activeTooltip) {
            activeTooltip.classList.remove('visible');
            activeTooltip = null;
        }
    });
    // Оптимизация: предварительный расчет
    layers.forEach(layer => {
        layer.element.style.height = `${layer.height * 3}px`;
        layer.element.style.willChange = 'transform';
    });

    stones.forEach(stone => {
        stone.element.style.height = `${stone.height * 3}px`;
        stone.element.style.willChange = 'transform, opacity';
    });

    function updateParallax(scrollPos) {
        const depthPercent = (scrollPos+document.documentElement.clientHeight) / maxDepth * 100;
        
        // Оптимизированный параллакс
        layers.forEach(layer => {
            const yPos = scrollPos * layer.speed;
            layer.element.style.backgroundPosition = `0 ${-yPos}px`;
        });

        // Индикатор глубины
        document.getElementById('depthFill').style.height = `${100-depthPercent}%`;
        document.getElementById('depthText').textContent = `Глубина: ${Math.floor((scrollPos+document.documentElement.clientHeight)/50)}м`;

        // Камни с оптимизированными проверками
        stones.forEach(stone => {
            const isVisible = scrollPos > stone.minDepth && scrollPos < stone.maxDepth;
            stone.element.style.opacity = isVisible ? '1' : '0';
        });
        const finalImage = document.getElementById('deepFinalImage');
        const finalImageStartDepth = 45000; // Когда начинать показ
        
        if (scrollPos >= finalImageStartDepth) {
            finalImage.style.opacity = 1;
            
        } else {
            finalImage.style.opacity = 0;
        }
    }
    window.addEventListener('scroll', () => {
        lastScroll = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax(lastScroll);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Инициализация
    updateParallax(0);
});