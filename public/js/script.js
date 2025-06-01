document.addEventListener('DOMContentLoaded', () => {
    const maxDepth = 50000;
    let lastScroll = 0;
    let ticking = false;
    
    const layers = [
        { element: document.getElementById('layer1'), speed: 0.3, height: 600 },
        { element: document.getElementById('layer2'), speed: 1, height: 800 },
        { element: document.getElementById('layer3'), speed: 1.6, height: 1000 }
    ];

    const stones = Array.from({length: 15}, (_, i) => ({
        element: document.querySelector(`.stone-${i+1}`),
        minDepth: document.querySelector(`.stone-${i+1}`).offsetTop-1000,
        maxDepth: document.querySelector(`.stone-${i+1}`).offsetTop + document.documentElement.clientHeight*3
        
    }));

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
        document.getElementById('depthText').textContent = `Глубина: ${Math.floor((scrollPos+document.documentElement.clientHeight)/10)}м`;

        // Камни с оптимизированными проверками
        stones.forEach(stone => {
            const isVisible = scrollPos > stone.minDepth && scrollPos < stone.maxDepth;
            stone.element.style.opacity = isVisible ? '1' : '0';
        });
        const finalImage = document.getElementById('deepFinalImage');
        const finalImageStartDepth = 45000; // Когда начинать показ
        const finalImageFullDepth = 48000; // Когда полностью видна
        
        if (scrollPos >= finalImageStartDepth) {
            const progress = Math.min(1, (scrollPos - finalImageStartDepth) / 
                                    (finalImageFullDepth - finalImageStartDepth));
            finalImage.style.opacity = 1;
            
            // Дополнительные эффекты (опционально)
            finalImage.style.transform = `translateX(-50%) scale(${1 + progress * 0.1})`;
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