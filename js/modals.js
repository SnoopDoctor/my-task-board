let currentCard = null;
let modalInitialized = false;
function initModalHandlers() {
    if (modalInitialized) return;
    modalInitialized = true;
    
    const addColumnBtn = document.getElementById('addColumnBtn');
    const helpBtn = document.getElementById('helpBtn');
    const modalClose = document.getElementById('modalClose');
    const deleteCardBtn = document.getElementById('deleteCardBtn');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const saveCardBtn = document.getElementById('saveCardBtn');
    
    const addColumnCancelBtn = document.getElementById('addColumnCancelBtn');
    const addColumnSaveBtn = document.getElementById('addColumnSaveBtn');
    const addColumnInput = document.getElementById('addColumnInput');
    
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    const confirmColumnCancelBtn = document.getElementById('confirmColumnCancelBtn');
    const confirmColumnDeleteBtn = document.getElementById('confirmColumnDeleteBtn');
    
    const helpModalClose = document.getElementById('helpModalClose');
    
    const colorCancelBtn = document.getElementById('colorCancelBtn');
    const colorApplyBtn = document.getElementById('colorApplyBtn');
    
    if (addColumnBtn) addColumnBtn.addEventListener('click', showAddColumnModal);
    if (helpBtn) helpBtn.addEventListener('click', showHelpModal);
    if (helpModalClose) helpModalClose.addEventListener('click', hideHelpModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (deleteCardBtn) deleteCardBtn.addEventListener('click', showDeleteConfirmation);
    if (addCommentBtn) addCommentBtn.addEventListener('click', addCommentHandler);
    if (saveCardBtn) saveCardBtn.addEventListener('click', saveCardData);
    
    if (addColumnCancelBtn) addColumnCancelBtn.addEventListener('click', hideAddColumnModal);
    if (addColumnSaveBtn) addColumnSaveBtn.addEventListener('click', createNewColumn);
    if (addColumnInput) addColumnInput.addEventListener('input', toggleAddColumnSaveButton);
    
    if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', hideDeleteConfirmation);
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', deleteCurrentCard);
    
    if (confirmColumnCancelBtn) confirmColumnCancelBtn.addEventListener('click', hideDeleteColumnConfirmation);
    if (confirmColumnDeleteBtn) confirmColumnDeleteBtn.addEventListener('click', deleteCurrentColumn);
    
    if (colorCancelBtn) colorCancelBtn.addEventListener('click', hideColorModal);
    if (colorApplyBtn) colorApplyBtn.addEventListener('click', applyColorToColumn);
    
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

function openCardModal(cardId, cardElement) {
    currentCard = cardId;
    const data = cardData[cardId];
    
    cleanupMobileModalStructure();
    
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
    
    if (modalStatus) {
        modalStatus.addEventListener('change', enableSaveButton);
    }
    
    const saveCardBtn = document.getElementById('saveCardBtn');
    if (saveCardBtn) saveCardBtn.disabled = true;
    
    if (isMobile) {
        const existingTabs = document.getElementById('modalTabs');
        const modalInfoContent = document.getElementById('modalInfoContent');
        const modalCommentsContent = document.getElementById('modalCommentsContent');
        const modalBody = document.querySelector('.modal-body');
        const modalLeft = document.querySelector('.modal-left');
        const modalRight = document.querySelector('.modal-right');
        
        if (existingTabs) {
            existingTabs.style.display = 'flex';
        }
        
        if (modalInfoContent) {
            modalInfoContent.style.display = 'block';
            modalInfoContent.innerHTML = '';
            
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
            modalCommentsContent.innerHTML = '';
            
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
        
        if (modalLeft) modalLeft.style.display = 'none';
        if (modalRight) modalRight.style.display = 'none';
        
        populateMobileStatusDropdown(data);
        
        setupMobileEventHandlers(cardId);
        
        if (existingTabs) {
            const tabs = existingTabs.querySelectorAll('.modal-tab');
            tabs.forEach(tab => tab.classList.remove('active'));
            tabs[0].classList.add('active');
        }
        
        if (modalInfoContent) {
            modalInfoContent.classList.add('active');
            if (modalCommentsContent) {
                modalCommentsContent.classList.remove('active');
            }
        }

        if (existingTabs) {
            const tabs = existingTabs.querySelectorAll('.modal-tab');
            tabs.forEach(tab => {
                const newTab = tab.cloneNode(true);
                tab.parentNode.replaceChild(newTab, tab);
                
                newTab.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const tabName = this.dataset.tab;
                    
                    existingTabs.querySelectorAll('.modal-tab').forEach(t => {
                        t.classList.remove('active');
                    });
                    
                    this.classList.add('active');
                    
                    if (modalInfoContent) modalInfoContent.classList.remove('active');
                    if (modalCommentsContent) modalCommentsContent.classList.remove('active');
                    
                    if (tabName === 'info' && modalInfoContent) {
                        modalInfoContent.classList.add('active');
                    } else if (tabName === 'comments' && modalCommentsContent) {
                        modalCommentsContent.classList.add('active');
                    }
                });
            });
        }
    } else {
        const existingTabs = document.getElementById('modalTabs');
        const modalInfoContent = document.getElementById('modalInfoContent');
        const modalCommentsContent = document.getElementById('modalCommentsContent');
        const modalLeft = document.querySelector('.modal-left');
        const modalRight = document.querySelector('.modal-right');
        
        if (existingTabs) existingTabs.style.display = 'none';
        if (modalInfoContent) modalInfoContent.style.display = 'none';
        if (modalCommentsContent) modalCommentsContent.style.display = 'none';
        
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
    const mobileStatus = document.querySelector('#modalInfoContent .field-select');
    if (mobileStatus) {
        const newMobileStatus = mobileStatus.cloneNode(true);
        mobileStatus.parentNode.replaceChild(newMobileStatus, mobileStatus);
        
        newMobileStatus.addEventListener('change', enableSaveButton);
        
        if (mobileStatus.id) {
            newMobileStatus.id = mobileStatus.id;
        }
    }
}

function cleanupMobileModalStructure() {
    const mobileModalStatus = document.getElementById('mobileModalStatus');
    if (mobileModalStatus) mobileModalStatus.remove();
    
    const modalLeft = document.querySelector('.modal-left');
    const modalRight = document.querySelector('.modal-right');
    const existingTabs = document.getElementById('modalTabs');
    const modalInfoContent = document.getElementById('modalInfoContent');
    const modalCommentsContent = document.getElementById('modalCommentsContent');
    
    if (!isMobile) {
        if (modalLeft) modalLeft.style.display = 'block';
        if (modalRight) modalRight.style.display = 'block';
        if (existingTabs) existingTabs.style.display = 'none';
        if (modalInfoContent) modalInfoContent.style.display = 'none';
        if (modalCommentsContent) modalCommentsContent.style.display = 'none';
    }
}

function setupMobileTabs() {
    const tabsContainer = document.getElementById('mobileModalTabs');
    if (!tabsContainer) return;
    
    tabsContainer.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const tabName = this.dataset.tab;
            
            tabsContainer.querySelectorAll('.modal-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
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

function populateMobileStatusDropdown(cardData) {
    const mobileStatus = document.getElementById('mobileModalStatus');
    if (!mobileStatus) return;
    
    mobileStatus.innerHTML = '';
    
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
        
        mobileStatus.appendChild(option);
    });
    
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
    
    setTimeout(() => {
        mobileCommentsList.scrollTop = mobileCommentsList.scrollHeight;
    }, 100);
}

function setupMobileEventHandlers(cardId) {
    const mobileAddCommentBtn = document.getElementById('mobileAddCommentBtn');
    const mobileNewComment = document.getElementById('mobileNewComment');
    
    if (mobileAddCommentBtn && mobileNewComment) {
        const newBtn = mobileAddCommentBtn.cloneNode(true);
        mobileAddCommentBtn.parentNode.replaceChild(newBtn, mobileAddCommentBtn);
        
        const newTextarea = mobileNewComment.cloneNode(true);
        mobileNewComment.parentNode.replaceChild(newTextarea, mobileNewComment);
        
        newBtn.addEventListener('click', function() {
            const commentText = newTextarea.value.trim();
            if (commentText && cardId) {
                addComment(cardId, commentText);
                newTextarea.value = '';
                
                const commentsContent = document.getElementById('modalCommentsContent');
                if (commentsContent) {
                    const updatedComments = cardData[cardId].comments || [];
                    loadMobileComments(updatedComments);
                    
                    setTimeout(() => {
                        const mobileCommentsList = document.getElementById('mobileCommentsList');
                        if (mobileCommentsList) {
                            mobileCommentsList.scrollTop = mobileCommentsList.scrollHeight;
                        }
                    }, 100);
                }
            }
        });
        
        newTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                newBtn.click();
            }
        });
    }
    
    function loadMobileComments(comments) {
        const mobileCommentsList = document.getElementById('mobileCommentsList');
        if (!mobileCommentsList) return;
        
        mobileCommentsList.innerHTML = '';
        
        if (!comments || comments.length === 0) {
            mobileCommentsList.innerHTML = '<p style="color: #5e6c84; text-align: center; padding: 40px 20px;">Пока нет комментариев</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="comment-text">${comment.text || ''}</div>
                <div class="comment-meta">
                    <span>${comment.author || 'Вы'}</span>
                    <span>${comment.date || new Date().toLocaleDateString('ru-RU')}</span>
                </div>
            `;
            mobileCommentsList.appendChild(commentElement);
        });
    }
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
    
    const useMobile = isMobile && document.getElementById('modalInfoContent');
    
    console.log('useMobile:', useMobile);
    console.log('Есть modalCardTitle?', !!document.getElementById('modalCardTitle'));
    console.log('Есть mobileModalCardTitle?', !!document.querySelector('#modalInfoContent .modal-card-title'));
    
    try {
        let title = '';
        let description = '';
        let startDate = '';
        let dueDate = '';
        let assignee = '';
        let newStatusId = '';
        
        if (useMobile) {
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
        
        if (!title || title.trim() === '') {
            showStatus('Заголовок не может быть пустым', 'error');
            return;
        }
        
        cardData[currentCard].title = title.trim();
        cardData[currentCard].description = description;
        cardData[currentCard].startDate = startDate;
        cardData[currentCard].dueDate = dueDate;
        cardData[currentCard].assignee = assignee;
        
        const oldColumn = findColumnByCardId(currentCard);
        const newColumn = boardData.columns.find(col => col.id === newStatusId);
        
        console.log('Старый столбец:', oldColumn?.title);
        console.log('Новый столбец:', newColumn?.title);
        
        if (oldColumn && newColumn && oldColumn.id !== newColumn.id) {
            console.log('Перемещение карточки между колонками');
            
            const cardIndex = oldColumn.cards.findIndex(card => card.id === currentCard);
            if (cardIndex !== -1) {
                oldColumn.cards.splice(cardIndex, 1);
            }
            
            newColumn.cards.push(cardData[currentCard]);
            
            updateStatusChangeDate(currentCard, newColumn.id);
            
            const cardElement = document.querySelector(`[data-card-id="${currentCard}"]`);
            if (cardElement) {
                cardElement.remove();
            }
            
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
