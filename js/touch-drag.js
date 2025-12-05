let touchDraggedCard = null;
let touchStartX = 0;
let touchStartY = 0;
let isTouchDragging = false;
let currentTouchColumn = null;
let dropPreview = null;
let dragElement = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let edgeThreshold = 100;
let lastCenteredEdge = 0;
let canCenterAgain = true;
let touchStartTime = 0;

function initTouchDrag() {
    if (!isMobile) return;
    
    cleanupTouchDragSystem();
    setupCardTouchHandlers();
}

function setupCardTouchHandlers() {
    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('touchstart', handleCardTouchStart);
        card.addEventListener('touchstart', handleCardTouchStart, { passive: false });
    });
    
    document.addEventListener('touchmove', handleDocumentTouchMove, { passive: false });
    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchcancel', handleDocumentTouchCancel);
}

function handleCardTouchStart(e) {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const card = e.currentTarget;
    
    e.preventDefault();
    e.stopPropagation();
    
    touchDraggedCard = card;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouchDragging = false;
    
    touchStartTime = Date.now();
    
    currentTouchColumn = card.closest('.column');
    
    const cardRect = card.getBoundingClientRect();
    dragOffsetX = touch.clientX - cardRect.left;
    dragOffsetY = touch.clientY - cardRect.top;
    
    card.classList.add('touch-active');
    
    lastCenteredEdge = 0;
    canCenterAgain = true;
}

function handleDocumentTouchMove(e) {
    if (!touchDraggedCard || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartX);
    const deltaY = Math.abs(touch.clientY - touchStartY);
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!isTouchDragging) {
        if (deltaX > 15 && deltaX > deltaY) {
            startTouchDrag(touch);
        }
        return;
    }
    
    updateDragPosition(touch);
    updateDropPreview(touch);
    checkAndCenterAtEdge(touch.clientX);
}

function startTouchDrag(touch) {
    if (!touchDraggedCard || isTouchDragging) return;
    
    isTouchDragging = true;
    
    board.style.pointerEvents = 'none';
    
    createDragElement(touch);
    
    touchDraggedCard.style.opacity = '0.3';
    touchDraggedCard.classList.remove('touch-active');
    touchDraggedCard.classList.add('touch-dragging');
    
    showDropZoneIndicators();
}

function createDragElement(touch) {
    if (!touchDraggedCard) return;
    
    const cardRect = touchDraggedCard.getBoundingClientRect();
    
    dragElement = document.createElement('div');
    dragElement.id = 'touch-drag-element';
    dragElement.className = 'card drag-visual';
    
    const cardContent = touchDraggedCard.querySelector('.card-content');
    if (cardContent) {
        dragElement.innerHTML = cardContent.outerHTML;
    }
    
    const computedStyle = window.getComputedStyle(touchDraggedCard);
    dragElement.style.borderLeftColor = computedStyle.borderLeftColor;
    dragElement.style.backgroundColor = computedStyle.backgroundColor;
    dragElement.style.borderRadius = computedStyle.borderRadius;
    dragElement.style.border = '2px solid var(--primary)';
    
    dragElement.style.position = 'fixed';
    dragElement.style.zIndex = '9999';
    dragElement.style.width = cardRect.width + 'px';
    dragElement.style.height = cardRect.height + 'px';
    dragElement.style.left = (touch.clientX - dragOffsetX) + 'px';
    dragElement.style.top = (touch.clientY - dragOffsetY) + 'px';
    dragElement.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
    dragElement.style.transform = 'scale(1.02) rotate(1deg)';
    dragElement.style.pointerEvents = 'none';
    dragElement.style.transition = 'none';
    dragElement.style.opacity = '1';
    dragElement.style.padding = computedStyle.padding;
    
    const editBtn = dragElement.querySelector('.card-edit-btn');
    if (editBtn) editBtn.style.display = 'none';
    
    document.body.appendChild(dragElement);
}

function updateDragPosition(touch) {
    if (!dragElement) return;
    
    dragElement.style.left = (touch.clientX - dragOffsetX) + 'px';
    dragElement.style.top = (touch.clientY - dragOffsetY) + 'px';
}

function showDropZoneIndicators() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        if (column !== currentTouchColumn) {
            column.classList.add('touch-drop-zone');
        }
    });
}

function checkAndCenterAtEdge(touchX) {
    if (!isTouchDragging || !canCenterAgain || !mobileColumns || mobileColumns.length === 0) return;
    
    const screenWidth = window.innerWidth;
    let targetEdge = 0;
    
    if (touchX > screenWidth - edgeThreshold) {
        targetEdge = 1;
    } else if (touchX < edgeThreshold) {
        targetEdge = -1;
    }
    
    if (targetEdge !== 0 && targetEdge !== lastCenteredEdge) {
        const currentIndex = currentScrollIndex;
        let targetIndex = currentIndex;
        
        if (targetEdge === 1) {
            targetIndex = Math.min(mobileColumns.length - 1, currentIndex + 1);
        } else if (targetEdge === -1) {
            targetIndex = Math.max(0, currentIndex - 1);
        }
        
        if (targetIndex !== currentIndex) {
            
            scrollToColumn(targetIndex);
            
            lastCenteredEdge = targetEdge;
            
            canCenterAgain = false;
            setTimeout(() => {
                canCenterAgain = true;
                lastCenteredEdge = 0;
            }, 800);
        }
    }
}

function checkAndCenterAtEdgeSimple(touchX) {
    if (!isTouchDragging || !canCenterAgain || !board) return;
    
    const screenWidth = window.innerWidth;
    let scrollDirection = 0;
    
    if (touchX > screenWidth - edgeThreshold) {
        scrollDirection = -1;
    } else if (touchX < edgeThreshold) {
        scrollDirection = 1;
    }
    
    if (scrollDirection !== 0 && scrollDirection !== lastCenteredEdge) {
        const currentScroll = board.scrollLeft;
        const columnWidth = mobileColumns[0]?.offsetWidth || 300;
        
        let targetScroll = currentScroll;
        const scrollStep = columnWidth;
        
        if (scrollDirection === -1) {
            targetScroll = currentScroll - scrollStep;
        } else if (scrollDirection === 1) {
            targetScroll = currentScroll + scrollStep;
        }
        
        const maxScroll = board.scrollWidth - board.clientWidth;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        if (targetScroll !== currentScroll) {
            
            board.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
            
            lastCenteredEdge = scrollDirection;
            
            canCenterAgain = false;
            setTimeout(() => {
                canCenterAgain = true;
                lastCenteredEdge = 0;
            }, 800);
        }
    }
}

function updateDropPreview(touch) {
    if (dropPreview && dropPreview.parentNode) {
        dropPreview.remove();
        dropPreview = null;
    }
    
    let checkX, checkY;
    
    if (dragElement) {
        const dragRect = dragElement.getBoundingClientRect();
        checkX = dragRect.left + dragRect.width / 2;
        checkY = dragRect.top + dragRect.height / 2;
    } else {
        checkX = touch.clientX;
        checkY = touch.clientY;
    }
    
    
    const elements = document.elementsFromPoint(checkX, checkY);
    
    let targetColumn = null;
    let targetCardsContainer = null;
    
    for (const element of elements) {
        
        if (element.classList.contains('column')) {
            targetColumn = element;
            targetCardsContainer = element.querySelector('.cards-container');
            break;
        }
        if (element.classList.contains('cards-container')) {
            targetCardsContainer = element;
            targetColumn = element.closest('.column');
            break;
        }
    }
    
    if (!targetColumn || !targetCardsContainer || targetColumn === currentTouchColumn) {
        return;
    }
    
    
    const cards = Array.from(targetCardsContainer.querySelectorAll('.card:not(.drop-preview)'));
    let insertPosition = null;
    
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const rect = card.getBoundingClientRect();
        const cardMiddle = rect.top + rect.height / 2;
        
        if (checkY < cardMiddle) {
            insertPosition = card;
            break;
        }
    }
    
    dropPreview = document.createElement('div');
    dropPreview.className = 'card drop-preview';
    dropPreview.style.height = '60px';
    dropPreview.style.margin = '8px 0';
    dropPreview.style.opacity = '0.7';
    dropPreview.style.border = '2px dashed var(--primary)';
    dropPreview.style.borderRadius = 'var(--radius)';
    dropPreview.style.background = 'linear-gradient(90deg, transparent, var(--primary-light), transparent)';
    
    if (insertPosition) {
        targetCardsContainer.insertBefore(dropPreview, insertPosition);
    } else {
        targetCardsContainer.appendChild(dropPreview);
    }
    
    targetColumn.classList.add('touch-drop-active');
}

function handleDocumentTouchEnd(e) {
    if (!touchDraggedCard) return;
    
    if (isTouchDragging) {
        finishTouchDrag();
    } else {
        const cardId = touchDraggedCard.dataset.cardId;
        if (cardId) {
            setTimeout(() => {
                openCardModal(cardId, touchDraggedCard);
            }, 150);
        }
    }
    
    cleanupTouchDrag();
}

function handleDocumentTouchCancel(e) {
    cleanupTouchDrag();
}

function finishTouchDrag() {
    if (!touchDraggedCard || !dragElement) return;
    
    
    const dragRect = dragElement.getBoundingClientRect();
    const checkX = dragRect.left + dragRect.width / 2;
    const checkY = dragRect.top + dragRect.height / 2;
    
    
    const elements = document.elementsFromPoint(checkX, checkY);
    
    let targetColumn = null;
    let targetCardsContainer = null;
    
    for (const element of elements) {
        
        if (element.classList.contains('column')) {
            targetColumn = element;
            targetCardsContainer = element.querySelector('.cards-container');
            break;
        }
        if (element.classList.contains('cards-container')) {
            targetCardsContainer = element;
            targetColumn = element.closest('.column');
            break;
        }
    }
    
    if (!targetColumn) {
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            const rect = column.getBoundingClientRect();
            
            if (checkX >= rect.left && checkX <= rect.right &&
                checkY >= rect.top && checkY <= rect.bottom) {
                targetColumn = column;
                targetCardsContainer = column.querySelector('.cards-container');
            }
        });
    }
        
    if (targetColumn && targetColumn !== currentTouchColumn) {
        const cardId = touchDraggedCard.dataset.cardId;
        const targetColumnId = targetColumn.dataset.columnId;
        
        
        if (cardId && targetColumnId) {
            const moved = moveCardToColumn(cardId, targetColumnId);
            
            if (touchDraggedCard.parentNode) {
                touchDraggedCard.remove();
            }
            
            const cardDataItem = cardData[cardId];
            
            if (cardDataItem) {
                const columnData = boardData.columns.find(col => col.id === targetColumnId);
                const columnColor = columnData ? columnData.color : 'column-blue';
                
                if (targetCardsContainer) {
                    createCardElement(targetCardsContainer, cardDataItem, columnColor);
                    
                    autoSave();
                } else {
                }
            } else {
                console.error('Не найдены данные карточки');
            }
        } else {
            console.error('Не найден ID карточки или колонки');
        }
    } else {
        if (!targetColumn) {
        } else if (targetColumn === currentTouchColumn) {
        }
    }
    
    cleanupTouchDrag();
}

function cleanupTouchDrag() {
    lastCenteredEdge = 0;
    canCenterAgain = true;
    
    if (board) {
        board.style.pointerEvents = 'auto';
    }
    
    if (dragElement && dragElement.parentNode) {
        dragElement.remove();
    }
    dragElement = null;
    
    if (dropPreview && dropPreview.parentNode) {
        dropPreview.remove();
    }
    dropPreview = null;
    
    document.querySelectorAll('.column').forEach(column => {
        column.classList.remove('touch-drop-zone', 'touch-drop-active');
    });
    
    if (touchDraggedCard) {
        touchDraggedCard.style.opacity = '1';
        touchDraggedCard.classList.remove('touch-active', 'touch-dragging');
    }
    
    touchDraggedCard = null;
    isTouchDragging = false;
    currentTouchColumn = null;
    dragOffsetX = 0;
    dragOffsetY = 0;
}

function cleanupTouchDragSystem() {
    document.querySelectorAll('.card').forEach(card => {
        card.removeEventListener('touchstart', handleCardTouchStart);
    });
    
    document.removeEventListener('touchmove', handleDocumentTouchMove);
    document.removeEventListener('touchend', handleDocumentTouchEnd);
    document.removeEventListener('touchcancel', handleDocumentTouchCancel);
    
    cleanupTouchDrag();
}

function updateCardTouchHandlers() {
    if (!isMobile) return;
    
    setTimeout(() => {
        setupCardTouchHandlers();
    }, 100);
}

window.initTouchDrag = initTouchDrag;
window.cleanupTouchDragSystem = cleanupTouchDragSystem;
window.updateCardTouchHandlers = updateCardTouchHandlers;
