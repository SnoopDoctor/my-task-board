// Основной файл приложения - точка входа
document.addEventListener('DOMContentLoaded', function() {
    
    // Инициализируем приложение с задержкой для гарантии загрузки DOM
    setTimeout(() => {
        initializeBoard();
    }, 100);
});