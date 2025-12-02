let currentCard = null;
let modalInitialized = false;
// Инициализация обработчиков модальных окон
function initModalHandlers() {
    if (modalInitialized) return;
    modalInitialized = true;
    
    // Основные элементы
    const addColumnBtn = document.getElementById('addColumnBtn');
    const helpBtn = document.getElementById('helpBtn');
    const modalClose = document.getElementById('modalClose');
    const deleteCardBtn = document.getElementById('deleteCardBtn');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');
    
    // Добавление колонки
    const addColumnCancelBtn = document.getElementById('addColumnCancelBtn');
    const addColumnSaveBtn = document.getElementById('addColumnSaveBtn');
    const addColumnInput = document.getElementById('addColumnInput');
    
    // Редактирование карточки
    const cardEditSaveBtn = document.getElementById('cardSaveBtn');
    const cardEditCancelBtn = document.getElementById('cardCancelBtn');
    
    // Подтверждение удаления карточки
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Подтверждение удаления колонки
    const confirmColumnCancelBtn = document.getElementById('confirmColumnCancelBtn');
    const confirmColumnDeleteBtn = document.getElementById('confirmColumnDeleteBtn');
    
    // Помощь
    const helpModalClose = document.getElementById('helpModalClose');
    
    // Цвета колонок
    const colorCancelBtn = document.getElementById('colorCancelBtn');
    const colorApplyBtn = document.getElementById('colorApplyBtn');
    
    // Обработчики событий
    if (addColumnBtn) addColumnBtn.addEventListener('click', showAddColumnModal);
    if (helpBtn) helpBtn.addEventListener('click', showHelpModal);
    if (helpModalClose) helpModalClose.addEventListener('click', hideHelpModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (deleteCardBtn) deleteCardBtn.addEventListener('click', showDeleteConfirmation);
    if (addCommentBtn) addCommentBtn.addEventListener('click', addCommentHandler);
    if (saveCardBtn) saveCardBtn.addEventListener('click', saveCardData);
    
    // Добавление колонки
    if (addColumnCancelBtn) addColumnCancelBtn.addEventListener('click', hideAddColumnModal);
    if (addColumnSaveBtn) addColumnSaveBtn.addEventListener('click', createNewColumn);
    if (addColumnInput) addColumnInput.addEventListener('input', toggleAddColumnSaveButton);
    
    // Редактирование карточки
    if (cardEditSaveBtn) cardEditSaveBtn.addEventListener('click', saveCardEdit);
    if (cardEditCancelBtn) cardEditCancelBtn.addEventListener('click', cancelCardEdit);
    
    // Подтверждение удаления карточки
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', hideDeleteConfirmation);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteCurrentCard);
    
    // Подтверждение удаления колонки
    if (confirmColumnCancelBtn) confirmColumnCancelBtn.addEventListener('click', hideDeleteColumnConfirmation);
    if (confirmColumnDeleteBtn) confirmColumnDeleteBtn.addEventListener('click', deleteCurrentColumn);
    
    // Цвета колонок
    if (colorCancelBtn) colorCancelBtn.addEventListener('click', hideColorModal);
    if (colorApplyBtn) colorApplyBtn.addEventListener('click', applyColorToColumn);
    
    // Отслеживание изменений в форме
    const modalFields = [
        document.getElementById('modalCardTitle'),
        document.getElementById('modalDescription'),
        document.getElementById('modalStartDate'),
        document.getElementById('modalDueDate'),
        document.getElementById('modalAssignee')
    ];
    
    modalFields.forEach(element => {
        if (element) {
            element.addEventListener('input', enableSaveButton);
        }
    });
    
    // Статус
    const modalStatus = document.getElementById('modalStatus');
    const mobileModalStatus = document.getElementById('mobileModalStatus');

    if (modalStatus) {
            modalStatus.addEventListener('change', function() {
                enableSaveButton();
            });
    }

    if (mobileModalStatus) {
        mobileModalStatus.addEventListener('change', function() {
            enableSaveButton();
        });
    }
    
    // Закрытие по клику на оверлей
    const overlays = [
        document.getElementById('addColumnModalOverlay'),
        document.getElementById('helpModalOverlay'),
        document.getElementById('confirmModalOverlay'),
        document.getElementById('confirmColumnModalOverlay'),
        document.getElementById('colorModalOverlay'),
        document.getElementById('cardModal')
    ];
    
    overlays.forEach(overlay => {
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (this.id === 'addColumnModalOverlay') hideAddColumnModal();
                    if (this.id === 'helpModalOverlay') hideHelpModal();
                    if (this.id === 'confirmModalOverlay') hideDeleteConfirmation();
                    if (this.id === 'confirmColumnModalOverlay') hideDeleteColumnConfirmation();
                    if (this.id === 'colorModalOverlay') hideColorModal();
                    if (this.id === 'cardModal') closeModal();
                }
            });
        }
    });
}

// Функции модальных окон
function showAddColumnModal() {
    const addColumnInput = document.getElementById('addColumnInput');
    const addColumnSaveBtn = document.getElementById('addColumnSaveBtn');
    
    if (addColumnInput && addColumnSaveBtn) {
        addColumnInput.value = '';
        addColumnSaveBtn.disabled = true;
        
        const addColumnModalOverlay = document.getElementById('addColumnModalOverlay');
        if (addColumnModalOverlay) {
            addColumnModalOverlay.style.display = 'flex';
            addColumnInput.focus();
        }
    }
}

function hideAddColumnModal() {
    const addColumnModalOverlay = document.getElementById('addColumnModalOverlay');
    if (addColumnModalOverlay) {
        addColumnModalOverlay.style.display = 'none';
    }
}

function toggleAddColumnSaveButton() {
    const addColumnInput = document.getElementById('addColumnInput');
    const addColumnSaveBtn = document.getElementById('addColumnSaveBtn');
    
    if (addColumnInput && addColumnSaveBtn) {
        addColumnSaveBtn.disabled = addColumnInput.value.trim() === '';
    }
}

function showHelpModal() {
    const helpModalOverlay = document.getElementById('helpModalOverlay');
    if (helpModalOverlay) {
        helpModalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideHelpModal() {
    const helpModalOverlay = document.getElementById('helpModalOverlay');
    if (helpModalOverlay) {
        helpModalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function startCardEdit(cardElement, card) {
    editingCardElement = cardElement;
    const currentText = card.title;
    
    const cardEditTextarea = document.getElementById('cardEditTextarea');
    const cardEditingOverlay = document.getElementById('cardEditingOverlay');
    
    if (cardEditTextarea && cardEditingOverlay) {
        cardEditTextarea.value = currentText;
        cardEditingOverlay.style.display = 'flex';
        
        setTimeout(() => {
            cardEditTextarea.select();
            cardEditTextarea.focus();
        }, 100);
    }
}

function saveCardEdit() {
    if (editingCardElement) {
        const cardEditTextarea = document.getElementById('cardEditTextarea');
        if (!cardEditTextarea) return;
        
        const newText = cardEditTextarea.value.trim();
        const cardId = editingCardElement.dataset.cardId;
        
        if (newText && newText !== cardData[cardId].title) {
            cardData[cardId].title = newText;
            const cardTitle = editingCardElement.querySelector('.card-title');
            cardTitle.textContent = newText;
            autoSave();
        }
        
        cancelCardEdit();
    }
}

function cancelCardEdit() {
    const cardEditingOverlay = document.getElementById('cardEditingOverlay');
    if (cardEditingOverlay) {
        cardEditingOverlay.style.display = 'none';
    }
    editingCardElement = null;
    
    const cardEditTextarea = document.getElementById('cardEditTextarea');
    if (cardEditTextarea) {
        cardEditTextarea.value = '';
    }
}

function openCardModal(cardId, cardElement) {
    currentCard = cardId;
    const data = cardData[cardId];
    
    // Очищаем предыдущие мобильные элементы если они есть
    cleanupMobileModalStructure();
    
    // Наполняем данные в оригинальную структуру
    const modalCardTitle = document.getElementById('modalCardTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalStartDate = document.getElementById('modalStartDate');
    const modalDueDate = document.getElementById('modalDueDate');
    const modalAssignee = document.getElementById('modalAssignee');
    const modalStatus = document.getElementById('modalStatus');
    
    if (modalCardTitle) modalCardTitle.textContent = data.title;
    if (modalDescription) modalDescription.value = data.description || '';
    if (modalStartDate) modalStartDate.value = data.startDate || '';
    if (modalDueDate) modalDueDate.value = data.dueDate || '';
    if (modalAssignee) modalAssignee.value = data.assignee || '';
    
    populateStatusDropdown(data);
    loadComments(data.comments || []);
    
    // Настраиваем обработчики для статуса
    if (modalStatus) {
        modalStatus.addEventListener('change', enableSaveButton);
    }
    
    const saveCardBtn = document.getElementById('saveCardBtn');
    if (saveCardBtn) saveCardBtn.disabled = true;
    
    // Если на мобильном, используем табы
    if (isMobile) {
        // 1. Находим существующие элементы табов и контента
        const existingTabs = document.getElementById('modalTabs');
        const modalInfoContent = document.getElementById('modalInfoContent');
        const modalCommentsContent = document.getElementById('modalCommentsContent');
        const modalBody = document.querySelector('.modal-body');
        const modalLeft = document.querySelector('.modal-left');
        const modalRight = document.querySelector('.modal-right');
        
        // 2. Показываем табы (если они скрыты в десктопной версии)
        if (existingTabs) {
            existingTabs.style.display = 'flex';
        }
        
        // 3. Показываем контейнеры для мобильных табов
        if (modalInfoContent) {
            modalInfoContent.style.display = 'block';
            modalInfoContent.innerHTML = ''; // Очищаем
            
            // Заполняем информационный таб
            modalInfoContent.innerHTML = `
                <div class="modal-header">
                    <div class="modal-card-title" contenteditable="true">${data.title}</div>
                </div>
                
                <div class="field-group">
                    <label class="field-label">Статус</label>
                    <select class="field-select" id="mobileModalStatus"></select>
                </div>
                
                <div class="field-group">
                    <label class="field-label">Описание</label>
                    <textarea class="field-textarea" id="mobileModalDescription" placeholder="Добавьте более подробное описание...">${data.description || ''}</textarea>
                </div>
                
                <div class="field-group">
                    <label class="field-label">Дата начала</label>
                    <input type="date" class="field-input" id="mobileModalStartDate" value="${data.startDate || ''}">
                </div>
                
                <div class="field-group">
                    <label class="field-label">Дата завершения</label>
                    <input type="date" class="field-input" id="mobileModalDueDate" value="${data.dueDate || ''}">
                </div>
                
                <div class="field-group">
                    <label class="field-label">Ответственный</label>
                    <input type="text" class="field-input" id="mobileModalAssignee" placeholder="Введите имя ответственного" value="${data.assignee || ''}">
                </div>
            `;
        }
        
        if (modalCommentsContent) {
            modalCommentsContent.style.display = 'block';
            modalCommentsContent.innerHTML = ''; // Очищаем
            
            // Создаем HTML для комментариев
            let commentsHTML = `
                <div class="comments-section">
                    <h3 class="comments-title">Комментарии</h3>
                    <div id="mobileCommentsList">
            `;
            
            if (data.comments && data.comments.length > 0) {
                data.comments.forEach(comment => {
                    commentsHTML += `
                        <div class="comment">
                            <div class="comment-text">${comment.text || ''}</div>
                            <div class="comment-meta">
                                <span>${comment.author || 'Вы'}</span>
                                <span>${comment.date || new Date().toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                commentsHTML += '<p style="color: #5e6c84; text-align: center; padding: 40px 20px;">Пока нет комментариев</p>';
            }
            
            commentsHTML += `
                    </div>
                    <div class="add-comment">
                        <textarea class="comment-textarea" id="mobileNewComment" placeholder="Напишите комментарий..."></textarea>
                        <button class="add-comment-btn" id="mobileAddCommentBtn">Добавить комментарий</button>
                    </div>
                </div>
            `;
            
            modalCommentsContent.innerHTML = commentsHTML;
        }
        
        // 4. Скрываем оригинальные левую и правую части (десктопный вид)
        if (modalLeft) modalLeft.style.display = 'none';
        if (modalRight) modalRight.style.display = 'none';
        
        // 5. Настраиваем статус для мобильной версии
        populateMobileStatusDropdown(data);
        
        // 6. Настраиваем обработчики для мобильной версии
        setupMobileEventHandlers(cardId);
        
        // 7. Убеждаемся, что активен правильный таб
        if (existingTabs) {
            const tabs = existingTabs.querySelectorAll('.modal-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            tabs[0].classList.add('active'); // Активируем первый таб (Информация)
        }
        
        if (modalInfoContent) {
            modalInfoContent.classList.add('active');
            if (modalCommentsContent) {
                modalCommentsContent.classList.remove('active');
            }
        }

        // 8. Настраиваем обработчики кликов на табы
        if (existingTabs) {
            const tabs = existingTabs.querySelectorAll('.modal-tab');
            tabs.forEach(tab => {
                // Удаляем старые обработчики
                const newTab = tab.cloneNode(true);
                tab.parentNode.replaceChild(newTab, tab);
                
                // Добавляем новый обработчик
                newTab.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const tabName = this.dataset.tab;
                    
                    // Убираем активный класс у всех табов
                    existingTabs.querySelectorAll('.modal-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    // Добавляем активный класс текущему табу
                    this.classList.add('active');
                    
                    // Скрываем все контенты табов
                    if (modalInfoContent) modalInfoContent.classList.remove('active');
                    if (modalCommentsContent) modalCommentsContent.classList.remove('active');
                    
                    // Показываем нужный контент
                    if (tabName === 'info' && modalInfoContent) {
                        modalInfoContent.classList.add('active');
                    } else if (tabName === 'comments' && modalCommentsContent) {
                        modalCommentsContent.classList.add('active');
                    }
                });
            });
        }
    } else {
        // Десктопная версия - показываем обычную структуру
        const existingTabs = document.getElementById('modalTabs');
        const modalInfoContent = document.getElementById('modalInfoContent');
        const modalCommentsContent = document.getElementById('modalCommentsContent');
        const modalLeft = document.querySelector('.modal-left');
        const modalRight = document.querySelector('.modal-right');
        
        // Скрываем табы на десктопе
        if (existingTabs) existingTabs.style.display = 'none';
        if (modalInfoContent) modalInfoContent.style.display = 'none';
        if (modalCommentsContent) modalCommentsContent.style.display = 'none';
        
        // Показываем левую и правую части
        if (modalLeft) modalLeft.style.display = 'block';
        if (modalRight) modalRight.style.display = 'block';
    }
    
    const cardModal = document.getElementById('cardModal');
    if (cardModal) {
        cardModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function setupMobileStatusHandlers(cardId) {
    // Находим статус в мобильной версии
    const mobileStatus = document.querySelector('#modalInfoContent .field-select');
    if (mobileStatus) {
        // Удаляем старые обработчики
        const newMobileStatus = mobileStatus.cloneNode(true);
        mobileStatus.parentNode.replaceChild(newMobileStatus, mobileStatus);
        
        // Добавляем обработчик
        newMobileStatus.addEventListener('change', enableSaveButton);
        
        // Сохраняем ID если он есть
        if (mobileStatus.id) {
            newMobileStatus.id = mobileStatus.id;
        }
    }
}
// Новая функция для очистки мобильной структуры
function cleanupMobileModalStructure() {
    // Убираем только мобильные элементы, не трогаем основные табы
    const mobileModalStatus = document.getElementById('mobileModalStatus');
    if (mobileModalStatus) mobileModalStatus.remove();
    
    // Восстанавливаем десктопный вид при закрытии
    const modalLeft = document.querySelector('.modal-left');
    const modalRight = document.querySelector('.modal-right');
    const existingTabs = document.getElementById('modalTabs');
    const modalInfoContent = document.getElementById('modalInfoContent');
    const modalCommentsContent = document.getElementById('modalCommentsContent');
    
    if (!isMobile) {
        // На десктопе показываем обычную структуру
        if (modalLeft) modalLeft.style.display = 'block';
        if (modalRight) modalRight.style.display = 'block';
        if (existingTabs) existingTabs.style.display = 'none';
        if (modalInfoContent) modalInfoContent.style.display = 'none';
        if (modalCommentsContent) modalCommentsContent.style.display = 'none';
    }
}

// Функция для настройки мобильных табов
function setupMobileTabs() {
    const tabsContainer = document.getElementById('mobileModalTabs');
    if (!tabsContainer) return;
    
    tabsContainer.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.dataset.tab;
            
            // Обновляем активный таб
            tabsContainer.querySelectorAll('.modal-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Показываем/скрываем контент
            document.querySelectorAll('.modal-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const activeContent = document.querySelector(`.modal-tab-content[data-tab="${tabName}"]`);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });
}

// Вспомогательные функции для мобильной версии
function populateMobileStatusDropdown(cardData) {
    const mobileStatus = document.getElementById('mobileModalStatus');
    if (!mobileStatus) return;
    
    mobileStatus.innerHTML = '';
    
    boardData.columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.id;
        option.textContent = column.title;
        
        // Проверяем, в какой колонке находится текущая карточка
        let isCurrentStatus = false;
        for (const col of boardData.columns) {
            if (col.cards.some(card => card.id === currentCard)) {
                isCurrentStatus = (col.id === column.id);
                if (isCurrentStatus) break;
            }
        }
        
        if (isCurrentStatus) {
            option.selected = true;
        }
        
        mobileStatus.appendChild(option);
    });
    
    // Добавляем обработчик изменения статуса
    mobileStatus.addEventListener('change', enableSaveButton);
}

function loadMobileComments(comments) {
    const mobileCommentsList = document.getElementById('mobileCommentsList');
    if (!mobileCommentsList) {
        console.log('Элемент mobileCommentsList не найден');
        return;
    }
    
    mobileCommentsList.innerHTML = '';
    
    if (!comments || comments.length === 0) {
        mobileCommentsList.innerHTML = '<p style="color: #5e6c84; text-align: center; padding: 40px 20px;">Пока нет комментариев</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'mobile-comment';
        commentElement.innerHTML = `
            <div class="mobile-comment-text">${comment.text || ''}</div>
            <div class="mobile-comment-meta">
                <span>${comment.author || 'Вы'}</span>
                <span>${comment.date || new Date().toLocaleDateString('ru-RU')}</span>
            </div>
        `;
        mobileCommentsList.appendChild(commentElement);
    });
    
    // Автоскролл к последнему комментарию
    setTimeout(() => {
        mobileCommentsList.scrollTop = mobileCommentsList.scrollHeight;
    }, 100);
}

function setupMobileEventHandlers(cardId) {
    // Обработчик для добавления комментария
    const mobileAddCommentBtn = document.getElementById('mobileAddCommentBtn');
    const mobileNewComment = document.getElementById('mobileNewComment');
    
    if (mobileAddCommentBtn && mobileNewComment) {
        mobileAddCommentBtn.addEventListener('click', function() {
            const commentText = mobileNewComment.value.trim();
            if (commentText && cardId) {
                addComment(cardId, commentText);
                mobileNewComment.value = '';
                
                // Обновляем комментарии в мобильной версии
                const commentsContent = document.querySelector('#modalCommentsContent .comments-section');
                if (commentsContent) {
                    // Здесь нужно обновить список комментариев
                    // Можно перезагрузить весь таб или обновить только список
                }
            }
        });
        
        mobileNewComment.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                mobileAddCommentBtn.click();
            }
        });
    }
    
    // Обработчики изменений полей формы
    const mobileFields = [
        document.querySelector('#modalInfoContent .modal-card-title'),
        document.getElementById('mobileModalDescription'),
        document.getElementById('mobileModalStartDate'),
        document.getElementById('mobileModalDueDate'),
        document.getElementById('mobileModalAssignee'),
        document.getElementById('mobileModalStatus')
    ];
    
    mobileFields.forEach(field => {
        if (field) {
            field.addEventListener('input', enableSaveButton);
            field.addEventListener('change', enableSaveButton);
        }
    });
}

function populateStatusDropdown(cardData) {
    const modalStatus = document.getElementById('modalStatus');
    if (!modalStatus) return;
    
    modalStatus.innerHTML = '';
    
    boardData.columns.forEach(column => {
        const option = document.createElement('option');
        option.value = column.id;
        option.textContent = column.title;
        
        let isCurrentStatus = false;
        for (const col of boardData.columns) {
            if (col.cards.some(card => card.id === currentCard)) {
                isCurrentStatus = (col.id === column.id);
                if (isCurrentStatus) break;
            }
        }
        
        if (isCurrentStatus) {
            option.selected = true;
        }
        
        modalStatus.appendChild(option);
    });
    
    // Добавляем обработчик изменения статуса
    if (modalStatus) {
        modalStatus.addEventListener('change', enableSaveButton);
    }
}

function closeModal() {
    const cardModal = document.getElementById('cardModal');
    if (cardModal) {
        cardModal.style.display = 'none';
    }
    document.body.style.overflow = '';
    currentCard = null;
    
    // Очищаем мобильную структуру
    cleanupMobileModalStructure();
}

function enableSaveButton() {
    const saveCardBtn = document.getElementById('saveCardBtn');
    if (saveCardBtn) {
        saveCardBtn.disabled = false;
        saveCardBtn.style.opacity = '1';
    }
}

function saveCardData() {
    if (!currentCard) return;
    
    console.log('Сохранение данных карточки:', currentCard);
    
    // Определяем, используем ли мы мобильные поля или десктопные
    const useMobile = isMobile && document.getElementById('modalInfoContent');
    
    console.log('useMobile:', useMobile);
    console.log('Есть modalCardTitle?', !!document.getElementById('modalCardTitle'));
    console.log('Есть mobileModalCardTitle?', !!document.querySelector('#modalInfoContent .modal-card-title'));
    
    try {
        // Получаем данные из соответствующих полей
        let title = '';
        let description = '';
        let startDate = '';
        let dueDate = '';
        let assignee = '';
        let newStatusId = '';
        
        if (useMobile) {
            // Мобильная версия
            const titleElement = document.querySelector('#modalInfoContent .modal-card-title');
            if (titleElement) {
                title = titleElement.textContent || titleElement.innerText;
            }
            
            const descriptionElement = document.getElementById('mobileModalDescription');
            const startDateElement = document.getElementById('mobileModalStartDate');
            const dueDateElement = document.getElementById('mobileModalDueDate');
            const assigneeElement = document.getElementById('mobileModalAssignee');
            const statusElement = document.getElementById('mobileModalStatus');
            
            description = descriptionElement ? descriptionElement.value : '';
            startDate = startDateElement ? startDateElement.value : '';
            dueDate = dueDateElement ? dueDateElement.value : '';
            assignee = assigneeElement ? assigneeElement.value : '';
            newStatusId = statusElement ? statusElement.value : '';
        } else {
            // Десктопная версия
            const titleElement = document.getElementById('modalCardTitle');
            if (titleElement) {
                title = titleElement.textContent || titleElement.innerText;
            }
            
            const descriptionElement = document.getElementById('modalDescription');
            const startDateElement = document.getElementById('modalStartDate');
            const dueDateElement = document.getElementById('modalDueDate');
            const assigneeElement = document.getElementById('modalAssignee');
            const statusElement = document.getElementById('modalStatus');
            
            description = descriptionElement ? descriptionElement.value : '';
            startDate = startDateElement ? startDateElement.value : '';
            dueDate = dueDateElement ? dueDateElement.value : '';
            assignee = assigneeElement ? assigneeElement.value : '';
            newStatusId = statusElement ? statusElement.value : '';
        }
        
        console.log('Полученные данные:', { title, description, startDate, dueDate, assignee, newStatusId });
        
        // Проверяем наличие заголовка
        if (!title || title.trim() === '') {
            showStatus('Заголовок не может быть пустым', 'error');
            return;
        }
        
        // Сохраняем данные
        cardData[currentCard].title = title.trim();
        cardData[currentCard].description = description;
        cardData[currentCard].startDate = startDate;
        cardData[currentCard].dueDate = dueDate;
        cardData[currentCard].assignee = assignee;
        
        // Проверяем, изменился ли статус
        const oldColumn = findColumnByCardId(currentCard);
        const newColumn = boardData.columns.find(col => col.id === newStatusId);
        
        console.log('Старый столбец:', oldColumn?.title);
        console.log('Новый столбец:', newColumn?.title);
        
        if (oldColumn && newColumn && oldColumn.id !== newColumn.id) {
            console.log('Перемещение карточки между колонками');
            
            // Удаляем карточку из старой колонки
            const cardIndex = oldColumn.cards.findIndex(card => card.id === currentCard);
            if (cardIndex !== -1) {
                oldColumn.cards.splice(cardIndex, 1);
            }
            
            // Добавляем карточку в новую колонку
            newColumn.cards.push(cardData[currentCard]);
            
            // Обновляем дату изменения статуса
            updateStatusChangeDate(currentCard, newColumn.id);
            
            // Удаляем карточку из DOM
            const cardElement = document.querySelector(`[data-card-id="${currentCard}"]`);
            if (cardElement) {
                cardElement.remove();
            }
            
            // Находим новую колонку и добавляем туда карточку
            const newColumnElement = document.querySelector(`[data-column-id="${newColumn.id}"]`);
            if (newColumnElement) {
                const cardsContainer = newColumnElement.querySelector('.cards-container');
                if (cardsContainer) {
                    createCardElement(cardsContainer, cardData[currentCard], newColumn.color);
                }
            }
        } else {
            console.log('Статус не изменился или колонка не найдена');
        }
        
        // Обновляем отображение карточки если она осталась в той же колонке
        const cardElement = document.querySelector(`[data-card-id="${currentCard}"]`);
        if (cardElement) {
            updateCardDisplay(currentCard);
        }
        
        const saveCardBtn = document.getElementById('saveCardBtn');
        if (saveCardBtn) {
            saveCardBtn.disabled = true;
        }
        
        autoSave();
        showStatus('Изменения сохранены', 'success');
        
        // Закрываем модальное окно после сохранения
        setTimeout(() => {
            closeModal();
        }, 1000);
        
    } catch (error) {
        console.error('Ошибка при сохранении карточки:', error);
        showStatus('Ошибка сохранения: ' + error.message, 'error');
    }
}

function showDeleteConfirmation() {
    if (currentCard) {
        const cardTitle = cardData[currentCard].title;
        const confirmCardTitle = document.getElementById('confirmCardTitle');
        if (confirmCardTitle) {
            confirmCardTitle.textContent = cardTitle;
        }
        
        const confirmModalOverlay = document.getElementById('confirmModalOverlay');
        if (confirmModalOverlay) {
            confirmModalOverlay.style.display = 'flex';
        }
    }
}

function hideDeleteConfirmation() {
    const confirmModalOverlay = document.getElementById('confirmModalOverlay');
    if (confirmModalOverlay) {
        confirmModalOverlay.style.display = 'none';
    }
}

function deleteCurrentCard() {
    if (currentCard) {
        for (const column of boardData.columns) {
            const cardIndex = column.cards.findIndex(card => card.id === currentCard);
            if (cardIndex !== -1) {
                column.cards.splice(cardIndex, 1);
                break;
            }
        }
        
        const cardElement = document.querySelector(`[data-card-id="${currentCard}"]`);
        if (cardElement) {
            cardElement.remove();
        }
        
        delete cardData[currentCard];
        
        hideDeleteConfirmation();
        closeModal();
        autoSave();
    }
}

function showDeleteColumnConfirmation(columnTitle, columnId) {
    const confirmColumnTitle = document.getElementById('confirmColumnTitle');
    if (confirmColumnTitle) {
        confirmColumnTitle.textContent = columnTitle;
    }
    
    const confirmColumnModalOverlay = document.getElementById('confirmColumnModalOverlay');
    if (confirmColumnModalOverlay) {
        confirmColumnModalOverlay.style.display = 'flex';
    }
    
    const confirmColumnDeleteBtn = document.getElementById('confirmColumnDeleteBtn');
    if (confirmColumnDeleteBtn) {
        confirmColumnDeleteBtn.dataset.columnId = columnId;
    }
}

function hideDeleteColumnConfirmation() {
    const confirmColumnModalOverlay = document.getElementById('confirmColumnModalOverlay');
    if (confirmColumnModalOverlay) {
        confirmColumnModalOverlay.style.display = 'none';
    }
    
    const confirmColumnDeleteBtn = document.getElementById('confirmColumnDeleteBtn');
    if (confirmColumnDeleteBtn) {
        confirmColumnDeleteBtn.removeAttribute('data-column-id');
    }
}

function deleteCurrentColumn() {
    const confirmColumnDeleteBtn = document.getElementById('confirmColumnDeleteBtn');
    if (!confirmColumnDeleteBtn) return;
    
    const columnId = confirmColumnDeleteBtn.dataset.columnId;
    
    if (columnId) {
        const column = document.querySelector(`.column[data-column-id="${columnId}"]`);
        
        if (column) {
            const columnData = boardData.columns.find(col => col.id === columnId);
            
            if (columnData && columnData.cards) {
                columnData.cards.forEach(card => {
                    delete cardData[card.id];
                });
            }
            
            boardData.columns = boardData.columns.filter(col => col.id !== columnId);
            column.remove();
            
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
        hideDeleteColumnConfirmation();
    }
}

function loadComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #5e6c84; text-align: center;">Пока нет комментариев</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-text">${comment.text}</div>
            <div class="comment-meta">${comment.date} • ${comment.author}</div>
        `;
        commentsList.appendChild(commentElement);
    });
}

function addCommentHandler() {
    const newComment = document.getElementById('newComment');
    if (!newComment) return;
    
    const commentText = newComment.value.trim();
    if (commentText && currentCard) {
        addComment(currentCard, commentText);
        newComment.value = '';
    }
}

function addComment(cardId, text) {
    if (!cardData[cardId].comments) {
        cardData[cardId].comments = [];
    }
    
    const newCommentData = {
        text: text,
        date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU'),
        author: 'Вы'
    };
    
    cardData[cardId].comments.push(newCommentData);
    loadComments(cardData[cardId].comments);
    autoSave();
}

function hideColorModal() {
    const colorModalOverlay = document.getElementById('colorModalOverlay');
    if (colorModalOverlay) {
        colorModalOverlay.style.display = 'none';
    }
    currentColumnForColor = null;
}

function setupStatusHandlers() {
    const modalStatus = document.getElementById('modalStatus');
    const mobileModalStatus = document.getElementById('mobileModalStatus');
    
    if (modalStatus) {
        modalStatus.addEventListener('change', enableSaveButton);
    }
    
    if (mobileModalStatus) {
        mobileModalStatus.addEventListener('change', enableSaveButton);
    }
}