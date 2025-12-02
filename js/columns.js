// Палитра цветов для колонок
const columnColors = [
    { name: 'Синий Jira', value: '#4A6FA5', class: 'column-blue' },
    { name: 'Зеленый Jira', value: '#57A55A', class: 'column-green' },
    { name: 'Фиолетовый Jira', value: '#6C5FC7', class: 'column-purple' },
    { name: 'Желтый Jira', value: '#F5CA4B', class: 'column-yellow' },
    { name: 'Розовый Jira', value: '#E569AC', class: 'column-pink' },
    { name: 'Красный Jira', value: '#E77471', class: 'column-red' },
    { name: 'Бирюзовый Jira', value: '#0A7F8F', class: 'column-teal' },
    { name: 'Оранжевый Jira', value: '#E57A3C', class: 'column-orange' },
    { name: 'Серый Jira', value: '#8993A4', class: 'column-gray' },
    { name: 'Лаймовый', value: '#8CBD18', class: 'column-lime' },
    { name: 'Индиго', value: '#5E6C84', class: 'column-indigo' },
    { name: 'Мятный', value: '#00C7E6', class: 'column-mint' }
];

let currentColumnForColor = null;

// Функция создания элемента колонки
function createColumnElement(columnData) {
    const column = document.createElement('div');
    column.className = 'column';
    column.dataset.columnId = columnData.id;
    
    // Добавляем класс цвета
    column.classList.add(columnData.color || 'column-blue');
    
    column.innerHTML = `
        <div class="column-header">
            <div class="column-title-wrapper">
                <div class="column-color-preview" style="background-color: ${getColorValue(columnData.color || 'column-blue')}"></div>
                <div class="column-title" contenteditable="true">${columnData.title}</div>
            </div>
            <div class="column-actions">
                <button class="column-color-btn" title="Изменить цвет">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/>
                    </svg>
                </button>
                <button class="delete-column" title="Удалить колонку">×</button>
            </div>
        </div>
        <div class="cards-container"></div>
        <button class="add-card-btn" id="add-card-btn">Добавить задачу</button>
        <div class="add-card-form">
            <textarea class="card-textarea" placeholder="Введите описание задачи..."></textarea>
            <div class="form-buttons">
                <button class="add-card-submit">Добавить</button>
                <button class="cancel-card-btn">×</button>
            </div>
        </div>
    `;
    
    setupColumnEventListeners(column, columnData);
    return column;
}

// Функция настройки обработчиков событий для колонки
function setupColumnEventListeners(column, columnData) {
    const deleteBtn = column.querySelector('.delete-column');
    const addCardBtn = column.querySelector('.add-card-btn');
    const addCardForm = column.querySelector('.add-card-form');
    const cardTextarea = column.querySelector('.card-textarea');
    const addCardSubmit = column.querySelector('.add-card-submit');
    const cancelCardBtn = column.querySelector('.cancel-card-btn');
    const columnTitle = column.querySelector('.column-title');
    const cardsContainer = column.querySelector('.cards-container');
    const colorBtn = column.querySelector('.column-color-btn');
    const colorPreview = column.querySelector('.column-color-preview');
    
    // Обработчик для кнопки изменения цвета
    colorBtn.addEventListener('click', function() {
        showColorModal(column, columnData);
    });
    
    // Обработчик для превью цвета
    colorPreview.addEventListener('click', function() {
        showColorModal(column, columnData);
    });
    
    columnTitle.addEventListener('blur', function() {
        columnData.title = this.textContent;
        autoSave();
    });
    
    columnTitle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        }
    });
    
    deleteBtn.addEventListener('click', function() {
        showDeleteColumnConfirmation(columnData.title, columnData.id);
    });
    
    addCardBtn.addEventListener('click', function() {
        addCardForm.style.display = 'flex';
        addCardBtn.style.display = 'none';
        setTimeout(() => {
            cardTextarea.focus();
        }, 10);
    });
    
    addCardSubmit.addEventListener('click', function() {
        const cardText = cardTextarea.value.trim();
        if (cardText) {
            const newCard = {
                id: 'card_' + Date.now(),
                title: cardText,
                description: '',
                assignee: '',
                startDate: '',
                dueDate: '',
                statusChangeDate: {},
                comments: []
            };
            
            columnData.cards.push(newCard);
            createCardElement(cardsContainer, newCard, columnData.color);
            
            cardTextarea.value = '';
            addCardForm.style.display = 'none';
            // Кнопка появится снова при наведении благодаря CSS
            autoSave();
        }
    });
    
    cancelCardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        cardTextarea.value = '';
        addCardForm.style.display = 'none';
        // Кнопка появится снова при наведении благодаря CSS
    });
    
    // Также добавим обработчик для отправки формы по Enter
    cardTextarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            addCardSubmit.click();
        }
        
        if (e.key === 'Escape') {
            cancelCardBtn.click();
        }
    });
    
    // Закрытие формы при клике вне её, если она открыта
    document.addEventListener('click', function(e) {
        if (addCardForm.style.display === 'flex' && 
            !addCardForm.contains(e.target) && 
            e.target !== addCardBtn) {
            cardTextarea.value = '';
            addCardForm.style.display = 'none';
        }
    });
    
    // Плавное появление/скрытие кнопки при перетаскивании
    column.addEventListener('dragenter', function() {
        if (!isMobile) {
            addCardBtn.style.opacity = '0.5';
        }
    });
    
    column.addEventListener('dragleave', function() {
        if (!isMobile) {
            addCardBtn.style.opacity = '1';
        }
    });
    
    // Сохраняем видимость кнопки при фокусе внутри колонки (для доступности)
    column.addEventListener('focusin', function() {
        if (!isMobile) {
            addCardBtn.style.display = 'flex';
            setTimeout(() => {
                addCardBtn.style.opacity = '1';
            }, 10);
        }
    });
    
    column.addEventListener('focusout', function(e) {
        if (!isMobile) {
            // Проверяем, не перешел ли фокус на другой элемент внутри колонки
            if (!column.contains(e.relatedTarget)) {
                setTimeout(() => {
                    if (!column.matches(':hover') && !column.matches(':focus-within')) {
                        addCardBtn.style.display = 'none';
                    }
                }, 100);
            }
        }
    });
    
    setupColumnDragAndDrop(column, cardsContainer);
}

// Настройка drag and drop для колонки
function setupColumnDragAndDrop(column, cardsContainer) {
    column.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (draggedCard && !column.contains(draggedCard)) {
            column.classList.add('drop-zone');
        }
    });
    
    column.addEventListener('dragleave', function(e) {
        const rect = column.getBoundingClientRect();
        if (e.clientX <= rect.left || e.clientX >= rect.right || 
            e.clientY <= rect.top || e.clientY >= rect.bottom) {
            column.classList.remove('drop-zone');
        }
    });
    
    column.addEventListener('drop', function(e) {
        e.preventDefault();
        column.classList.remove('drop-zone');
        
        if (draggedCard && !column.contains(draggedCard)) {
            const cardId = draggedCard.dataset.cardId;
            const targetColumnId = column.dataset.columnId;
            
            moveCardToColumn(cardId, targetColumnId);
            cardsContainer.appendChild(draggedCard);
            
            // Обновляем цвет границы карточки при перемещении
            const targetColumn = boardData.columns.find(col => col.id === targetColumnId);
            if (targetColumn) {
                draggedCard.style.borderLeftColor = getColorValue(targetColumn.color);
            }
            
            autoSave();
            draggedCard = null;
        }
    });
    
    // Перетаскивание внутри колонки
    cardsContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (!draggedCard) return;
        
        const afterElement = getDragAfterElement(cardsContainer, e.clientY);
        const draggable = draggedCard;
        
        if (afterElement) {
            cardsContainer.insertBefore(draggable, afterElement);
        } else {
            cardsContainer.appendChild(draggable);
        }
        
        const columnId = column.dataset.columnId;
        
        // ВАЖНО: Обновляем цвет даже при перемещении внутри колонки
        const targetColumn = boardData.columns.find(col => col.id === columnId);
        if (targetColumn) {
            const colorValue = getColorValue(targetColumn.color);
            draggable.style.borderLeftColor = colorValue;
        }
        
        updateCardOrderInColumn(columnId);
    });
    
    // Обработчик drop для cardsContainer (когда карточка перетаскивается из другой колонки прямо в cardsContainer)
    cardsContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        
        // Если карточка из другой колонки
        if (draggedCard && !cardsContainer.contains(draggedCard)) {
            const cardId = draggedCard.dataset.cardId;
            const columnId = column.dataset.columnId;
            
            // Перемещаем между колонками
            moveCardToColumn(cardId, columnId);
            
            // Добавляем в DOM
            cardsContainer.appendChild(draggedCard);
            
            // Обновляем цвет
            const targetColumn = boardData.columns.find(col => col.id === columnId);
            if (targetColumn) {
                const colorValue = getColorValue(targetColumn.color);
                draggedCard.style.borderLeftColor = colorValue;
            }
            
            autoSave();
            draggedCard = null;
            
            // Убираем класс drop-zone
            column.classList.remove('drop-zone');
        }
    });
    
    // При завершении перетаскивания убираем класс drop-zone
    cardsContainer.addEventListener('dragend', function() {
        column.classList.remove('drop-zone');
    });
}

// Функция для получения значения цвета по классу
function getColorValue(colorClass) {
    const color = columnColors.find(c => c.class === colorClass);
    return color ? color.value : '#4A6FA5';
}

// Функция инициализации палитры цветов
function initColorPalette() {
    const colorPalette = document.getElementById('colorPalette');
    if (!colorPalette) return;
    
    colorPalette.innerHTML = '';
    columnColors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = color.value;
        colorOption.dataset.colorClass = color.class;
        colorOption.title = color.name;
        
        colorOption.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
        
        colorPalette.appendChild(colorOption);
    });
}

// Функция создания новой колонки
function createNewColumn() {
    const addColumnInput = document.getElementById('addColumnInput');
    const columnTitle = addColumnInput.value.trim();
    if (columnTitle) {
        const newColumn = {
            id: 'col_' + Date.now(),
            title: columnTitle,
            cards: [],
            color: 'column-blue'
        };
        
        boardData.columns.push(newColumn);
        const column = createColumnElement(newColumn);
        board.appendChild(column);
        hideAddColumnModal();
        
        // Инициализируем палитру цветов
        initColorPalette();
        
        // Обновляем мобильный свайп
        setTimeout(() => {
            mobileColumns = Array.from(board.querySelectorAll('.column'));
            if (isMobile) {
                createScrollIndicator();
                createNavigationButtons();
            }
        }, 100);
        
        autoSave();
    }
}

// Показать модальное окно выбора цвета
function showColorModal(columnElement, columnData) {
    currentColumnForColor = {
        element: columnElement,
        data: columnData
    };
    
    const colorPalette = document.getElementById('colorPalette');
    if (!colorPalette) return;
    
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
        
        if (columnData.color && opt.dataset.colorClass === columnData.color) {
            opt.classList.add('selected');
        }
    });
    
    const colorModalOverlay = document.getElementById('colorModalOverlay');
    if (colorModalOverlay) {
        colorModalOverlay.style.display = 'flex';
    }
}

// Применить выбранный цвет к колонке
function applyColorToColumn() {
    if (!currentColumnForColor) return;
    
    const selectedColor = document.querySelector('.color-option.selected');
    if (!selectedColor) {
        return;
    }
    
    const colorClass = selectedColor.dataset.colorClass;
    const columnElement = currentColumnForColor.element;
    const columnData = currentColumnForColor.data;
    
    // Удаляем все цветовые классы
    columnColors.forEach(color => {
        columnElement.classList.remove(color.class);
    });
    
    // Добавляем новый цветовой класс
    columnElement.classList.add(colorClass);
    
    // Сохраняем цвет в данных
    columnData.color = colorClass;
    
    // Обновляем превью цвета в заголовке колонки
    const colorPreview = columnElement.querySelector('.column-color-preview');
    if (colorPreview) {
        const selectedColorElement = document.querySelector('.color-option.selected');
        colorPreview.style.backgroundColor = selectedColorElement.style.backgroundColor;
    }
    
    // Обновляем цвет границ всех карточек в колонке
    const cards = columnElement.querySelectorAll('.card');
    const colorValue = getColorValue(colorClass);
    cards.forEach(card => {
        card.style.borderLeftColor = colorValue;
    });
    
    hideColorModal();
    autoSave();
}

// Функция форматирования даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}
