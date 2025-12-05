let boardData = { columns: [] };
let cardData = {};
let isMobile = window.innerWidth <= 768;
let mobileColumns = [];
let currentScrollIndex = 0;

const board = document.getElementById('board');
const statusMessage = document.getElementById('statusMessage');

function initializeBoard() {
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    loadBoardFromJSON();
    if (boardData.columns.length === 0) {
        createDefaultBoard();
    } else {
        const hasArchiveColumn = boardData.columns.some(col => 
            col.title.toLowerCase() === 'архив'
        );
        
        if (!hasArchiveColumn) {
            const archiveColumn = {
                id: 'col_archive_' + Date.now(),
                title: 'Архив',
                cards: [],
                color: 'column-gray'
            };
            boardData.columns.push(archiveColumn);
        }
        
        renderBoard();
        
        setTimeout(() => {
            checkAndMoveToArchive();
        }, 500);
    }
    
    setInterval(checkAndMoveToArchive, 10 * 60 * 1000);

    setTimeout(() => {
        initModalHandlers();
        initColorPalette();
        
        if (isMobile) {
            initTouchDrag();
        }
    }, 100);
}

function loadBoardFromJSON() {
    try {
        const savedData = localStorage.getItem('kanbanBoard');
        if (savedData) {
            boardData = JSON.parse(savedData);
            boardData.columns.forEach(column => {
                if (!column.color) {
                    column.color = 'column-blue';
                }
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        createDefaultBoard();
    }
}

function saveBoardToJSON() {
    try {
        updateBoardData();
        localStorage.setItem('kanbanBoard', JSON.stringify(boardData));
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        showStatus('Ошибка сохранения', 'error');
    }
}

function autoSave() {
    clearTimeout(window.autoSaveTimeout);
    window.autoSaveTimeout = setTimeout(saveBoardToJSON, 100);
}

function createDefaultBoard() {
    boardData = {
        columns: [
            { 
                id: 'col_1',
                title: 'Сделать',
                color: 'column-blue',
                cards: [
                    { 
                        id: 'card_1',
                        title: 'Изучить JavaScript', 
                        description: 'Изучить основы языка программирования', 
                        assignee: 'Иван',
                        startDate: '2024-01-15',
                        dueDate: '2024-02-15',
                        statusChangeDate: {},
                        comments: []
                    },
                    { 
                        id: 'card_2',
                        title: 'Создать проект', 
                        description: 'Разработать новый веб-проект', 
                        assignee: 'Мария',
                        startDate: '2024-01-20',
                        dueDate: '2024-03-01',
                        statusChangeDate: {},
                        comments: []
                    }
                ] 
            },
            { 
                id: 'col_2',
                title: 'В процессе',
                color: 'column-yellow',
                cards: [
                    { 
                        id: 'card_3',
                        title: 'Разработать канбан-доску', 
                        description: 'Создать функциональную канбан-доску', 
                        assignee: 'Алексей',
                        startDate: '2024-01-10',
                        dueDate: '2024-01-25',
                        statusChangeDate: {},
                        comments: []
                    }
                ] 
            },
            { 
                id: 'col_3',
                title: 'Готово',
                color: 'column-green',
                cards: [
                    { 
                        id: 'card_4',
                        title: 'Изучить HTML и CSS', 
                        description: 'Освоить основы веб-разработки', 
                        assignee: 'Ольга',
                        startDate: '2024-01-01',
                        dueDate: '2024-01-10',
                        statusChangeDate: {},
                        comments: []
                    }
                ] 
            },
            { 
                id: 'col_4',
                title: 'Архив',
                color: 'column-gray',
                cards: []
            }
        ]
    };
}

function renderBoard() {
    board.innerHTML = '';
    cardData = {};
    
    boardData.columns.forEach(columnData => {
        const column = createColumnElement(columnData);
        board.appendChild(column);
        
        const cardsContainer = column.querySelector('.cards-container');
        columnData.cards.forEach(card => {
            createCardElement(cardsContainer, card, columnData.color);
            cardData[card.id] = card;
        });
    });
    
    setTimeout(() => {
        mobileColumns = Array.from(board.querySelectorAll('.column'));
        if (isMobile) {
            initMobileSwipe();
        } else {
            cleanupMobile();
        }
    }, 100);

    if (isMobile && window.updateCardTouchHandlers) {
        setTimeout(() => {
            window.updateCardTouchHandlers();
        }, 200);
    }
}

function checkAndMoveToArchive() {
    const readyColumn = boardData.columns.find(col => col.title.toLowerCase() === 'готово');
    const canceledColumn = boardData.columns.find(col => col.title.toLowerCase() === 'отменено');
    const archiveColumn = boardData.columns.find(col => col.title.toLowerCase() === 'архив');
    
    if (!archiveColumn) return;
    
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    function moveOldCards(column, targetColumnId) {
        if (!column) return;
        
        const cardsToMove = [...column.cards];
        
        cardsToMove.forEach(card => {
            const statusChangeDate = card.statusChangeDate && card.statusChangeDate[column.id] 
                ? new Date(card.statusChangeDate[column.id]) 
                : new Date();
            
            if (statusChangeDate <= sevenDaysAgo) {
                if (!card.statusChangeDate) card.statusChangeDate = {};
                card.statusChangeDate[targetColumnId] = new Date().toISOString().split('T')[0];
                
                moveCardToColumn(card.id, targetColumnId);
                
                const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
                if (cardElement) {
                    cardElement.remove();
                }
            }
        });
    }
    
    if (readyColumn) {
        moveOldCards(readyColumn, archiveColumn.id);
    }
    
    if (canceledColumn) {
        moveOldCards(canceledColumn, archiveColumn.id);
    }
    
    if (readyColumn || canceledColumn) {
        renderBoard();
        autoSave();
    }
}

function checkMobile() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        setTimeout(() => {
            renderBoard();
            if (isMobile) {
                initMobileSwipe();
                initTouchDrag();
            } else {
                cleanupMobile();
                cleanupTouchDragSystem();
            }
        }, 100);
    }
    
    return isMobile;
}

function updateBoardData() {
    boardData.columns = Array.from(board.querySelectorAll('.column')).map(column => {
        const columnId = column.dataset.columnId;
        const title = column.querySelector('.column-title').textContent;
        const cards = Array.from(column.querySelectorAll('.card')).map(card => {
            const cardId = card.dataset.cardId;
            return cardData[cardId];
        });
        
        let color = 'column-blue';
        for (const colorClass of columnColors) {
            if (column.classList.contains(colorClass.class)) {
                color = colorClass.class;
                break;
            }
        }
        
        return {
            id: columnId,
            title: title,
            color: color,
            cards: cards
        };
    });
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + (type || '');
    
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 3000);
}
