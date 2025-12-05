let draggedCard = null;
let editingCardElement = null;

function createCardElement(container, card, columnColor) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.draggable = !isMobile;
    cardElement.dataset.cardId = card.id;
    
    const colorValue = getColorValue(columnColor || 'column-blue');
    cardElement.style.borderLeftColor = colorValue;
    
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';
    cardTitle.textContent = card.title;
    cardContent.appendChild(cardTitle);
    
    const cardDetails = document.createElement('div');
    cardDetails.className = 'card-details';
    
    if (card.startDate) {
        const startDateElement = document.createElement('div');
        startDateElement.className = 'card-detail';
        startDateElement.innerHTML = `
            <span class="card-detail-icon">📅</span>
            <span>Начало: ${formatDate(card.startDate)}</span>
        `;
        cardDetails.appendChild(startDateElement);
    }
    
    if (card.dueDate) {
        const dueDateElement = document.createElement('div');
        dueDateElement.className = 'card-detail';
        dueDateElement.innerHTML = `
            <span class="card-detail-icon">⏰</span>
            <span>Завершение: ${formatDate(card.dueDate)}</span>
        `;
        cardDetails.appendChild(dueDateElement);
    }
    
    if (card.assignee) {
        const assigneeElement = document.createElement('div');
        assigneeElement.className = 'card-detail';
        assigneeElement.innerHTML = `
            <span class="card-detail-icon">👤</span>
            <span>Ответственный: ${card.assignee}</span>
        `;
        cardDetails.appendChild(assigneeElement);
    }
    
    const column = container.closest('.column');
    if (column) {
        const columnTitle = column.querySelector('.column-title').textContent;
        if (columnTitle.toLowerCase() === 'архив' && card.statusChangeDate) {
            const lastColumnId = Object.keys(card.statusChangeDate).pop();
            if (lastColumnId) {
                const lastStatusDate = card.statusChangeDate[lastColumnId];
                if (lastStatusDate) {
                    const statusChangeElement = document.createElement('div');
                    statusChangeElement.className = 'card-detail';
                    statusChangeElement.innerHTML = `
                        <span class="card-detail-icon">📌</span>
                        <span>В архиве с: ${formatDate(lastStatusDate)}</span>
                    `;
                    cardDetails.appendChild(statusChangeElement);
                }
            }
        }
    }
    
    cardContent.appendChild(cardDetails);
    cardElement.appendChild(cardContent);
    cardData[card.id] = card;
    
    if (!isMobile) {
        cardElement.addEventListener('click', function(e) {
            if (!draggedCard && e.target) {
                openCardModal(card.id, this);
            }
        });
    }
    
    if (!isMobile) {
        setupCardDragAndDrop(cardElement);
    }
    
    container.appendChild(cardElement);

    if (isMobile && window.updateCardTouchHandlers) {
        setTimeout(() => {
            window.updateCardTouchHandlers();
        }, 50);
    }
}

function setupCardDragAndDrop(cardElement) {
    if (isMobile) return;
    
    cardElement.addEventListener('dragstart', function(e) {
        draggedCard = this;
        
        document.querySelectorAll('.cards-container').forEach(container => {
            container.style.overflowY = 'hidden';
        });
        
        board.style.overflowX = 'hidden';
        
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('drag-in-progress');
        });
        
        setTimeout(() => {
            this.classList.add('dragging');
        }, 0);
    });
    
    cardElement.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        
        document.querySelectorAll('.cards-container').forEach(container => {
            container.style.overflowY = 'auto';
        });
        
        board.style.overflowX = 'auto';
        
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('drag-in-progress');
        });
        
        document.querySelectorAll('.column').forEach(col => {
            col.classList.remove('drop-zone');
        });
        
        draggedCard = null;
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateCardOrderInColumn(columnId) {
    const column = document.querySelector(`[data-column-id="${columnId}"]`);
    const cardsContainer = column.querySelector('.cards-container');
    const cards = Array.from(cardsContainer.querySelectorAll('.card'));
    
    const columnData = boardData.columns.find(col => col.id === columnId);
    if (columnData) {
        columnData.cards = cards.map(card => cardData[card.dataset.cardId]);
        autoSave();
    }
}

function moveCardToColumn(cardId, targetColumnId) {
    
    let sourceColumn = null;
    let cardDataItem = null;
    
    for (const column of boardData.columns) {
        const cardIndex = column.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            sourceColumn = column;
            cardDataItem = column.cards[cardIndex];
            
            column.cards.splice(cardIndex, 1);
            break;
        }
    }
    
    if (cardDataItem) {
        updateStatusChangeDate(cardId, targetColumnId);
        
        const targetColumn = boardData.columns.find(col => col.id === targetColumnId);
        if (targetColumn) {
            targetColumn.cards.push(cardDataItem);
            return true;
        } else {
            console.error('Целевая колонка не найдена в boardData:', targetColumnId);
        }
    } else {
        console.error('Данные карточки не найдены:', cardId);
    }
    
    return false;
}

function updateStatusChangeDate(cardId, targetColumnId) {
    if (cardData[cardId]) {
        if (!cardData[cardId].statusChangeDate) {
            cardData[cardId].statusChangeDate = {};
        }
        cardData[cardId].statusChangeDate[targetColumnId] = new Date().toISOString().split('T')[0];
    }
}

function findColumnByCardId(cardId) {
    for (const column of boardData.columns) {
        if (column.cards.some(card => card.id === cardId)) {
            return column;
        }
    }
    return null;
}

function updateCardDisplay(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardElement) return;
    
    const card = cardData[cardId];
    
    const column = cardElement.closest('.column');
    if (column) {
        let columnColor = 'column-blue';
        for (const color of columnColors) {
            if (column.classList.contains(color.class)) {
                columnColor = color.class;
                break;
            }
        }
        
        const colorValue = getColorValue(columnColor);
        cardElement.style.borderLeftColor = colorValue;
    }
    
    const cardTitle = cardElement.querySelector('.card-title');
    if (cardTitle) {
        cardTitle.textContent = card.title;
    }
    
    const cardDetails = cardElement.querySelector('.card-details');
    if (cardDetails) {
        cardDetails.innerHTML = '';
        
        if (card.startDate) {
            const startDateElement = document.createElement('div');
            startDateElement.className = 'card-detail';
            startDateElement.innerHTML = `
                <span class="card-detail-icon">📅</span>
                <span>Начало: ${formatDate(card.startDate)}</span>
            `;
            cardDetails.appendChild(startDateElement);
        }
        
        if (card.dueDate) {
            const dueDateElement = document.createElement('div');
            dueDateElement.className = 'card-detail';
            dueDateElement.innerHTML = `
                <span class="card-detail-icon">⏰</span>
                <span>Завершение: ${formatDate(card.dueDate)}</span>
            `;
            cardDetails.appendChild(dueDateElement);
        }
        
        if (card.assignee) {
            const assigneeElement = document.createElement('div');
            assigneeElement.className = 'card-detail';
            assigneeElement.innerHTML = `
                <span class="card-detail-icon">👤</span>
                <span>Ответственный: ${card.assignee}</span>
            `;
            cardDetails.appendChild(assigneeElement);
        }
        
        const column = cardElement.closest('.column');
        if (column) {
            const columnTitle = column.querySelector('.column-title').textContent;
            if (columnTitle.toLowerCase() === 'архив' && card.statusChangeDate) {
                const lastColumnId = Object.keys(card.statusChangeDate).pop();
                if (lastColumnId) {
                    const lastStatusDate = card.statusChangeDate[lastColumnId];
                    if (lastStatusDate) {
                        const statusChangeElement = document.createElement('div');
                        statusChangeElement.className = 'card-detail';
                        statusChangeElement.innerHTML = `
                            <span class="card-detail-icon">📌</span>
                            <span>В архиве с: ${formatDate(lastStatusDate)}</span>
                        `;
                        cardDetails.appendChild(statusChangeElement);
                    }
                }
            }
        }
    }
}
