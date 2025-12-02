// Инициализация мобильного свайпа
function initMobileSwipe() {
    if (!isMobile) return;
    
    mobileColumns = Array.from(board.querySelectorAll('.column'));
    
    // Создаем индикатор
    createScrollIndicator();
    
    // Добавляем обработчики свайпа
    setupSwipeHandlers(board);
    
    // Обновляем активную колонку
    updateActiveColumn();
    
    // Добавляем кнопки навигации
    createNavigationButtons();
}

// Создание индикатора прокрутки
function createScrollIndicator() {
    let indicator = document.getElementById('scrollIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.id = 'scrollIndicator';
        document.querySelector('.test-container').appendChild(indicator);
    }
    
    indicator.innerHTML = '';
    mobileColumns.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `scroll-dot ${index === currentScrollIndex ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.addEventListener('click', () => scrollToColumn(index));
        indicator.appendChild(dot);
    });
}

// Создание кнопок навигации
function createNavigationButtons() {
    // Удаляем старые кнопки если есть
    document.querySelectorAll('.nav-button').forEach(btn => btn.remove());
    
    // Создаем кнопку "назад"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-button prev';
    prevBtn.id = 'prevButton';
    prevBtn.innerHTML = '‹';
    prevBtn.addEventListener('click', () => scrollToColumn(currentScrollIndex - 1));
    
    // Создаем кнопку "вперед"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-button next';
    nextBtn.id = 'nextButton';
    nextBtn.innerHTML = '›';
    nextBtn.addEventListener('click', () => scrollToColumn(currentScrollIndex + 1));
    
    const testContainer = document.querySelector('.test-container');
    if (testContainer) {
        testContainer.appendChild(prevBtn);
        testContainer.appendChild(nextBtn);
    }
}

// Прокрутка к колонке
function scrollToColumn(index) {
    if (!mobileColumns[index]) return;
    
    currentScrollIndex = Math.max(0, Math.min(index, mobileColumns.length - 1));
    const column = mobileColumns[currentScrollIndex];
    
    // Центрируем колонку
    const columnLeft = column.offsetLeft;
    const columnWidth = column.offsetWidth;
    const boardWidth = board.offsetWidth;
    const scrollTo = columnLeft - (boardWidth / 2) + (columnWidth / 2);
    
    board.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
    });
    
    updateActiveColumn();
    updateScrollIndicator();
}

// Обновление активной колонки
function updateActiveColumn() {
    if (!isMobile || mobileColumns.length === 0) return;
    
    const scrollLeft = board.scrollLeft;
    const boardWidth = board.offsetWidth;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    mobileColumns.forEach((column, index) => {
        const columnLeft = column.offsetLeft;
        const columnWidth = column.offsetWidth;
        const columnCenter = columnLeft + columnWidth / 2;
        const boardCenter = scrollLeft + boardWidth / 2;
        const distance = Math.abs(columnCenter - boardCenter);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
        }
    });
    
    if (closestIndex !== currentScrollIndex) {
        currentScrollIndex = closestIndex;
        updateScrollIndicator();
        
        // Обновляем класс active
        mobileColumns.forEach((column, index) => {
            column.classList.toggle('active', index === currentScrollIndex);
        });
    }
}

// Обновление индикатора
function updateScrollIndicator() {
    const indicator = document.getElementById('scrollIndicator');
    if (!indicator) return;
    
    const dots = indicator.querySelectorAll('.scroll-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentScrollIndex);
    });
}

// Настройка обработчиков свайпа
function setupSwipeHandlers(board) {
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;
    
    // Touch события
    board.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - board.offsetLeft;
        scrollLeft = board.scrollLeft;
        isDragging = true;
    }, { passive: true });
    
    board.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].pageX - board.offsetLeft;
        const walk = (x - startX) * 2;
        board.scrollLeft = scrollLeft - walk;
    }, { passive: false });
    
    board.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(updateActiveColumn, 150);
    });
    
    // Следим за скроллом
    board.addEventListener('scroll', updateActiveColumn);
}

// Очистка мобильных элементов
function cleanupMobile() {
    document.querySelectorAll('.nav-button, .scroll-indicator').forEach(el => el.remove());
    if (mobileColumns) {
        mobileColumns.forEach(column => column.classList.remove('active'));
    }
}