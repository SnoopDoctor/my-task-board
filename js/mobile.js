function initMobileSwipe() {
    if (!isMobile) return;
    
    mobileColumns = Array.from(board.querySelectorAll('.column'));
    createScrollIndicator();
    setupSwipeHandlers(board);
    updateActiveColumn();
    createNavigationButtons();
    initBackToTopButton();
}

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

function createNavigationButtons() {
    document.querySelectorAll('.nav-button').forEach(btn => btn.remove());
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nav-button prev';
    prevBtn.id = 'prevButton';
    prevBtn.innerHTML = '‹';
    prevBtn.addEventListener('click', () => scrollToColumn(currentScrollIndex - 1));
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

function scrollToColumn(index) {
    if (!mobileColumns[index]) return;
    currentScrollIndex = Math.max(0, Math.min(index, mobileColumns.length - 1));
    const column = mobileColumns[currentScrollIndex];
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
        
        mobileColumns.forEach((column, index) => {
            column.classList.toggle('active', index === currentScrollIndex);
        });
    }
}

function updateScrollIndicator() {
    const indicator = document.getElementById('scrollIndicator');
    if (!indicator) return;
    
    const dots = indicator.querySelectorAll('.scroll-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentScrollIndex);
    });
}

function setupSwipeHandlers(board) {
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;
    
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
    
    board.addEventListener('scroll', updateActiveColumn);
}

function cleanupMobile() {
    document.querySelectorAll('.nav-button, .scroll-indicator').forEach(el => el.remove());
    if (mobileColumns) {
        mobileColumns.forEach(column => column.classList.remove('active'));
    }
}

function initBackToTopButton() {
    if (!isMobile) return;
    
    const existingBtn = document.querySelector('.back-to-top-btn');
    if (existingBtn) existingBtn.remove();
    
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top-btn';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.title = 'Наверх';
    backToTopBtn.setAttribute('aria-label', 'Прокрутить наверх');
    
    function scrollToTop() {
        const windowScrollY = window.scrollY || document.documentElement.scrollTop;
        
        if (windowScrollY > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const activeElements = [
            { element: document.querySelector('.modal-body'), name: 'modal-body' },
            { element: document.querySelector('.modal-tab-content.active'), name: 'active-tab' },
            { element: document.querySelector('.cards-container'), name: 'cards-container' },
            { element: document.querySelector('#commentsList'), name: 'comments' },
            { element: document.querySelector('#mobileCommentsList'), name: 'mobile-comments' },
            { element: document.querySelector('.comments-section'), name: 'comments-section' }
        ];
        
        for (const item of activeElements) {
            if (item.element && item.element.scrollTop > 0) {
                item.element.scrollTo({ top: 0, behavior: 'smooth' });
                
                if (item.name === 'modal-body') {
                    const activeTabContent = document.querySelector('.modal-tab-content.active');
                    if (activeTabContent && activeTabContent.scrollTop > 0) {
                        activeTabContent.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }
                return;
            }
        }
    }
    
    backToTopBtn.addEventListener('click', scrollToTop);
    
    backToTopBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        this.style.transform = 'scale(0.95)';
    });
    
    backToTopBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.style.transform = '';
        scrollToTop();
    });
    
    document.body.appendChild(backToTopBtn);
    
    function checkScrollAndShowButton() {
        let shouldShowButton = false;
        
        const windowScrollY = window.scrollY || document.documentElement.scrollTop;
        const windowScrollThreshold = 300;
        
        if (windowScrollY > windowScrollThreshold) {
            shouldShowButton = true;
            backToTopBtn.style.bottom = '100px';
        }
        
        if (!shouldShowButton) {
            const scrollableElements = [
                { 
                    element: document.querySelector('.modal-body'), 
                    threshold: 200,
                    position: 'modal' 
                },
                { 
                    element: document.querySelector('.modal-tab-content.active'), 
                    threshold: 200,
                    position: 'modal' 
                },
                { 
                    element: document.querySelector('.cards-container'), 
                    threshold: 100,
                    position: 'column' 
                },
                { 
                    element: document.querySelector('#commentsList'), 
                    threshold: 100,
                    position: 'modal' 
                },
                { 
                    element: document.querySelector('#mobileCommentsList'), 
                    threshold: 100,
                    position: 'modal' 
                },
                { 
                    element: document.querySelector('.comments-section'), 
                    threshold: 100,
                    position: 'modal' 
                }
            ];
            
            for (const item of scrollableElements) {
                if (item.element && item.element.scrollTop > item.threshold) {
                    shouldShowButton = true;
                    
                    if (item.position === 'modal') {
                        backToTopBtn.style.bottom = '140px';
                    } else {
                        backToTopBtn.style.bottom = '100px';
                    }
                    break;
                }
            }
        }
        
        if (shouldShowButton) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
    
    let scrollTimeout;
    function handleScroll() {
        checkScrollAndShowButton();
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            backToTopBtn.classList.remove('show');
        }, 3000);
    }
    
    const scrollableSelectors = [
        '.modal-body',
        '.modal-tab-content',
        '.cards-container',
        '#commentsList',
        '#mobileCommentsList',
        '.comments-section',
        window
    ];
    
    function setupScrollListeners() {
        const oldHandler = window._scrollHandler;
        if (oldHandler) {
            window.removeEventListener('scroll', oldHandler);
            document.querySelectorAll('.cards-container, .modal-body, .modal-tab-content, #commentsList, #mobileCommentsList, .comments-section')
                .forEach(el => el.removeEventListener('scroll', oldHandler));
        }
        
        window._scrollHandler = handleScroll;
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        document.querySelectorAll('.cards-container, .modal-body, .modal-tab-content, #commentsList, #mobileCommentsList, .comments-section')
            .forEach(el => {
                el.addEventListener('scroll', handleScroll, { passive: true });
            });
    }
    
    setupScrollListeners();
    
    const observer = new MutationObserver(function() {
        setTimeout(setupScrollListeners, 100);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    const visibilityObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                setTimeout(checkScrollAndShowButton, 50);
            }
        });
    });
    
    const modal = document.getElementById('cardModal');
    if (modal) {
        visibilityObserver.observe(modal, { attributes: true });
    }
    
    setTimeout(checkScrollAndShowButton, 500);

    window.addEventListener('resize', checkScrollAndShowButton);

    document.addEventListener('touchstart', function() {
        setTimeout(checkScrollAndShowButton, 100);
    });

    document.addEventListener('click', function() {
        setTimeout(checkScrollAndShowButton, 100);
    });
}
