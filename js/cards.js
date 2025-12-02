let draggedCard = null;
let editingCardElement = null;

// Функция создания элемента карточки
function createCardElement(container, card, columnColor) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.draggable = !isMobile; // На мобильных отключаем стандартный drag and drop
    cardElement.dataset.cardId = card.id;
    
    // Устанавливаем цвет границы в соответствии с цветом колонки
    const colorValue = getColorValue(columnColor || 'column-blue');
    cardElement.style.borderLeftColor = colorValue;
    
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // Заголовок карточки
    const cardTitle = document.createElement('div');
    cardTitle.className = 'card-title';
    cardTitle.textContent = card.title;
    cardContent.appendChild(cardTitle);
    
    // Дополнительная информация
    const cardDetails = document.createElement('div');
    cardDetails.className = 'card-details';
    
    // Дата начала
    if (card.startDate) {
        const startDateElement = document.createElement('div');
        startDateElement.className = 'card-detail';
        startDateElement.innerHTML = `
            <span class="card-detail-icon">📅</span>
            <span>Начало: ${formatDate(card.startDate)}</span>
        `;
        cardDetails.appendChild(startDateElement);
    }
    
    // Дата завершения
    if (card.dueDate) {
        const dueDateElement = document.createElement('div');
        dueDateElement.className = 'card-detail';
        dueDateElement.innerHTML = `
            <span class="card-detail-icon">⏰</span>
            <span>Завершение: ${formatDate(card.dueDate)}</span>
        `;
        cardDetails.appendChild(dueDateElement);
    }
    
    // Ответственный
    if (card.assignee) {
        const assigneeElement = document.createElement('div');
        assigneeElement.className = 'card-detail';
        assigneeElement.innerHTML = `
            <span class="card-detail-icon">👤</span>
            <span>Ответственный: ${card.assignee}</span>
        `;
        cardDetails.appendChild(assigneeElement);
    }
    
    // Дата последнего изменения статуса (только для архива)
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
    /*
    // Кнопка редактирования
    const editButton = document.createElement('button');
    editButton.className = 'card-edit-btn';
    editButton.innerHTML = '✏️';
    editButton.title = 'Редактировать карточку';
    cardElement.appendChild(editButton);
    */
    cardData[card.id] = card;
    
    // Обработчик клика для открытия модального окна (только для десктопа)
    if (!isMobile) {
        cardElement.addEventListener('click', function(e) {
            if (!draggedCard && e.target) {
                openCardModal(card.id, this);
            }
        });
    }
    
    /*
    // Обработчик для кнопки редактирования
    editButton.addEventListener('click', function(e) {
        e.stopPropagation();
        startCardEdit(cardElement, card);
    });
    */
    // Настройка drag and drop только для десктопа
    if (!isMobile) {
        setupCardDragAndDrop(cardElement);
    }
    
    container.appendChild(cardElement);

    if (isMobile && window.updateCardTouchHandlers) {
        // Добавляем небольшую задержку для гарантированной инициализации карточки
        setTimeout(() => {
            window.updateCardTouchHandlers();
        }, 50);
    }
}

// Настройка drag and drop для карточки (только для десктопа)
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

// Функция для определения позиции вставки при перетаскивании
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

// Функция обновления порядка карточек в колонке
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

// Функция перемещения карточки между колонками
function moveCardToColumn(cardId, targetColumnId) {
    
    let sourceColumn = null;
    let cardDataItem = null;
    
    // Ищем карточку в данных
    for (const column of boardData.columns) {
        const cardIndex = column.cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
            sourceColumn = column;
            cardDataItem = column.cards[cardIndex];
            
            // Удаляем из исходной колонки
            column.cards.splice(cardIndex, 1);
            break;
        }
    }
    
    if (cardDataItem) {
        // Обновляем дату изменения статуса
        updateStatusChangeDate(cardId, targetColumnId);
        
        // Находим целевую колонку
        const targetColumn = boardData.columns.find(col => col.id === targetColumnId);
        if (targetColumn) {
            // Добавляем в целевую колонку
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

// Функция обновления даты изменения статуса
function updateStatusChangeDate(cardId, targetColumnId) {
    if (cardData[cardId]) {
        if (!cardData[cardId].statusChangeDate) {
            cardData[cardId].statusChangeDate = {};
        }
        cardData[cardId].statusChangeDate[targetColumnId] = new Date().toISOString().split('T')[0];
    }
}

// Функция для поиска колонки по ID карточки
function findColumnByCardId(cardId) {
    for (const column of boardData.columns) {
        if (column.cards.some(card => card.id === cardId)) {
            return column;
        }
    }
    return null;
}

// Функция для обновления отображения карточки
function updateCardDisplay(cardId) {
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardElement) return;
    
    const card = cardData[cardId];
    
    // Находим колонку карточки
    const column = cardElement.closest('.column');
    if (column) {
        // Получаем цвет колонки
        let columnColor = 'column-blue';
        for (const color of columnColors) {
            if (column.classList.contains(color.class)) {
                columnColor = color.class;
                break;
            }
        }
        
        // Обновляем цвет границы
        const colorValue = getColorValue(columnColor);
        cardElement.style.borderLeftColor = colorValue;
    }
    
    // Обновляем заголовок
    const cardTitle = cardElement.querySelector('.card-title');
    if (cardTitle) {
        cardTitle.textContent = card.title;
    }
    
    // Обновляем дополнительные детали
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
        
        // Дата последнего изменения статуса (только для архива)
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
