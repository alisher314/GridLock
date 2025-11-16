// --- Настройки и Константы ---
const CHAR_SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?'
};
const STORAGE_PREFIX = 'password_grid_';

// --- Функции Интернационализации (i18n) ---

/**
 * Обновляет текст всех элементов, имеющих атрибут data-i18n.
 */
function updateInterfaceText() {
    // Обновление обычного текста
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Обновление плейсхолдеров
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Обновление префиксов (для H2 с именем сайта)
    document.querySelectorAll('[data-i18n-prefix]').forEach(el => {
        const key = el.getAttribute('data-i18n-prefix');
        const siteName = el.textContent.split(':').pop().trim(); 
        el.textContent = t(key) + ': ' + siteName;
    });

    // Обновление кнопки языка
    const langBtn = document.getElementById('lang-toggle-btn');
    langBtn.textContent = (currentLanguage === 'ru' ? 'EN' : 'RU');

    // Обновление title страницы
    document.title = t('app_title');
    
    // Перезагрузка списка сеток для перевода кнопок
    if (!screens.myGrids.classList.contains('hidden')) {
         displayMyGrids();
    }
}


// --- Элементы DOM (Экраны) ---
const screens = {
    menu: document.getElementById('main-menu'),
    create: document.getElementById('create-grid-screen'),
    myGrids: document.getElementById('my-grids-screen'),
    viewer: document.getElementById('grid-viewer-screen')
};

// --- Элементы DOM (Интерактивные) ---
const gridContainer = document.getElementById('grid-container');
const selectedPasswordDisplay = document.getElementById('selected-password');
const currentSiteTitle = document.getElementById('current-site-title');
const newSiteNameInput = document.getElementById('new-site-name');
const gridSizeSelect = document.getElementById('grid-size-select');
const gridsListContainer = document.getElementById('grids-list');
const createMessage = document.getElementById('create-message');
const copyAllButton = document.getElementById('copy-all-button');

const sourceRandom = document.getElementById('source-random');
const sourceManual = document.getElementById('source-manual');
const manualCharsInput = document.getElementById('manual-chars-input'); 

const charOptions = {
    lower: document.getElementById('char-lower'),
    upper: document.getElementById('char-upper'),
    numbers: document.getElementById('char-numbers'),
    symbols: document.getElementById('char-symbols')
};

// --- Настройка Canvas (Удалены переменные drawingCanvas и ctx) ---
const drawingCanvas = document.getElementById('drawing-canvas');

// --- Состояние ---
let isDrawing = false;
let selectedCells = new Set(); 
let currentViewSiteName = null; 
let cellPositions = []; 
let selectedPoints = []; 

// --- Управление экранами ---

function showScreen(screenId) {
    Object.keys(screens).forEach(key => {
        if (key === screenId) {
            screens[key].classList.remove('hidden');
        } else {
            screens[key].classList.add('hidden');
        }
    });
}

// --- Логика Local Storage ---

function getAllSavedSiteNames() {
    const siteNames = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            siteNames.push(key.substring(STORAGE_PREFIX.length));
        }
    }
    return siteNames;
}

function saveGrid(siteName, gridData) {
    const key = STORAGE_PREFIX + siteName.toLowerCase();
    try {
        localStorage.setItem(key, JSON.stringify(gridData));
    } catch (e) {
        console.error('Ошибка сохранения сетки:', e);
    }
}

function loadGrid(siteName) {
    const key = STORAGE_PREFIX + siteName.toLowerCase();
    try {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
        console.error('Ошибка загрузки сетки:', e);
        return null;
    }
}

function deleteGrid(siteName) {
    if (confirm(t('alert_delete_confirm', siteName))) {
        const key = STORAGE_PREFIX + siteName.toLowerCase();
        localStorage.removeItem(key);
        displayMyGrids(); 
    }
}

// --- Логика генерации ---

function getCharacterSet() {
    let finalChars = '';
    if (charOptions.lower.checked) finalChars += CHAR_SETS.lower;
    if (charOptions.upper.checked) finalChars += CHAR_SETS.upper;
    if (charOptions.numbers.checked) finalChars += CHAR_SETS.numbers;
    if (charOptions.symbols.checked) finalChars += CHAR_SETS.symbols;
    
    return finalChars;
}

function generateCharacterArray(size, charSet) {
    const totalCells = size * size;
    const characters = [];
    for (let i = 0; i < totalCells; i++) {
        const randomIndex = Math.floor(Math.random() * charSet.length);
        characters.push(charSet[randomIndex]);
    }
    return characters;
}

/**
 * Переключает видимость поля ручного ввода и опций случайной генерации.
 */
function toggleManualInput() {
    const charOptionsDiv = document.getElementById('char-options');
    if (sourceManual.checked) {
        manualCharsInput.classList.remove('hidden');
        charOptionsDiv.style.opacity = '0.5'; 
        charOptionsDiv.style.pointerEvents = 'none';
    } else {
        manualCharsInput.classList.add('hidden');
        charOptionsDiv.style.opacity = '1';
        charOptionsDiv.style.pointerEvents = 'auto';
    }
}

// --- Основные обработчики ---

function handleGenerateAndSave() {
    const siteName = newSiteNameInput.value.trim();
    if (!siteName) {
        createMessage.textContent = t('alert_enter_site_name');
        createMessage.style.color = 'red';
        return;
    }

    const selectedSize = parseInt(gridSizeSelect.value, 10);
    const totalRequired = selectedSize * selectedSize;
    let newCharacters = null;

    if (sourceManual.checked) {
        // --- РУЧНОЙ ВВОД ---
        let manualInput = manualCharsInput.value.trim().replace(/\s/g, ''); 
        if (manualInput.length < totalRequired) {
            createMessage.textContent = t('alert_chars_required', manualInput.length, totalRequired);
            createMessage.style.color = 'red';
            return;
        }
        newCharacters = manualInput.split('').slice(0, totalRequired); 

    } else {
        // --- СЛУЧАЙНАЯ ГЕНЕРАЦИЯ ---
        const charSet = getCharacterSet();
        if (charSet.length === 0) {
            createMessage.textContent = t('alert_select_char_type');
            createMessage.style.color = 'red';
            return;
        }
        newCharacters = generateCharacterArray(selectedSize, charSet);
    }


    if (loadGrid(siteName) && !confirm(t('alert_overwrite_confirm', siteName))) {
        return;
    }

    const gridData = {
        size: selectedSize,
        characters: newCharacters
    };
    saveGrid(siteName, gridData);
    
    newSiteNameInput.value = '';
    manualCharsInput.value = ''; 
    createMessage.textContent = t('alert_success_saved', siteName);
    createMessage.style.color = 'green';
    
    renderGrid(siteName, gridData);
}

function displayMyGrids() {
    showScreen('myGrids');
    const siteNames = getAllSavedSiteNames();
    
    gridsListContainer.innerHTML = '';

    if (siteNames.length === 0) {
        gridsListContainer.innerHTML = `<p>${t('msg_no_grids')}</p>`;
        return;
    }

    siteNames.forEach(name => {
        const item = document.createElement('div');
        item.classList.add('grid-item');
        item.innerHTML = `<span>${name}</span>`;
        
        const viewButton = document.createElement('button');
        viewButton.textContent = t('btn_view_grid'); // <-- ИСПРАВЛЕНО
        viewButton.classList.add('view-btn');
        
        viewButton.addEventListener('click', () => {
            const gridData = loadGrid(name);
            if (gridData) {
                renderGrid(name, gridData);
            } else {
                alert(t('alert_load_error'));
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = t('btn_delete'); // <-- ИСПРАВЛЕНО
        deleteButton.classList.add('delete-btn');
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
            deleteGrid(name);
        });

        const buttonGroup = document.createElement('div');
        buttonGroup.appendChild(viewButton);
        buttonGroup.appendChild(deleteButton);
        
        item.appendChild(buttonGroup);
        gridsListContainer.appendChild(item);
    });
}

// --- Настройка сетки ---

function setupCanvas(size) {
    const wrapper = document.querySelector('.grid-wrapper');
    const rect = wrapper.getBoundingClientRect();
    
    cellPositions = [];
    const cellElements = gridContainer.querySelectorAll('.cell');
    
    cellElements.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect(); 
        
        const x = cellRect.left + cellRect.width / 2 - wrapperRect.left;
        const y = cellRect.top + cellRect.height / 2 - wrapperRect.top;
        
        cellPositions.push({
            id: cell.dataset.id,
            x: x,
            y: y,
            element: cell 
        });
    });
}


function renderGrid(siteName, gridData) {
    const size = gridData.size;
    const characters = gridData.characters;

    currentViewSiteName = siteName;
    
    // Обновление заголовка с учетом текущего языка
    currentSiteTitle.textContent = t('viewer_title_prefix') + `: ${siteName} (${size}x${size})`;

    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    gridContainer.style.aspectRatio = '1 / 1'; 

    selectedCells.clear();
    selectedPasswordDisplay.textContent = '';
    selectedPoints = []; 

    characters.forEach((char, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = char;
        cell.dataset.id = i; 
        
        cell.addEventListener('mousedown', startDraw);
        cell.addEventListener('mouseover', draw);
        cell.addEventListener('mouseup', stopDraw);
        cell.addEventListener('touchstart', startDraw, { passive: true });
        cell.addEventListener('touchmove', handleTouchMove, { passive: true });
        cell.addEventListener('touchend', stopDraw, { passive: true });
        
        gridContainer.appendChild(cell);
    });
    
    showScreen('viewer');
    
    requestAnimationFrame(() => setupCanvas(size)); 
}


// --- Логика выделения (Canvas логика рисования удалена) ---

function clearSelectionAndCanvas() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('selected');
    });
    selectedCells.clear();
    selectedPasswordDisplay.textContent = '';
    selectedPoints = [];
}

function startDraw(e) {
    e.preventDefault(); 
    isDrawing = true;
    clearSelectionAndCanvas(); 
    
    const cell = e.currentTarget;
    if (cell) {
        selectCell(cell);
    }
}

function selectCell(cell) {
    const cellId = cell.dataset.id;
    if (!selectedCells.has(cellId)) {
        selectedCells.add(cellId);
        cell.classList.add('selected');

        const newCellPosition = cellPositions.find(p => p.id === cellId);
        
        if (newCellPosition) {
            selectedPoints.push(newCellPosition);
        }
        
        updatePasswordDisplay(); 
    }
}

function draw(e) {
    if (!isDrawing) return;
    selectCell(e.currentTarget);
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (targetElement && targetElement.classList.contains('cell')) {
        selectCell(targetElement);
    }
}

function stopDraw() {
    isDrawing = false;
}

function updatePasswordDisplay() {
    let password = '';
    selectedPoints.forEach(point => {
        const cell = point.element; 
        if(cell) { 
             password += cell.textContent;
        }
    });
    selectedPasswordDisplay.textContent = password;
}

function copyPassword() {
    const password = selectedPasswordDisplay.textContent;
    if (password) {
        navigator.clipboard.writeText(password).then(() => {
            alert(t('alert_copied'));
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            alert(t('alert_copy_error'));
        });
    } else {
        alert(t('alert_select_first'));
    }
}

/**
 * Копирует все символы из текущей активной сетки в буфер обмена.
 */
function copyAllSymbols() {
    const gridData = loadGrid(currentViewSiteName); 
    
    if (!gridData || !gridData.characters) {
        alert(t('alert_no_active_grid'));
        return;
    }
    
    const allSymbols = gridData.characters.join('');

    navigator.clipboard.writeText(allSymbols).then(() => {
        alert(t('alert_all_copied', allSymbols.length));
    }).catch(err => {
        console.error('Ошибка копирования всей сетки: ', err);
        alert(t('alert_copy_all_error'));
    });
}


// --- Обработка изменения размера окна ---
window.addEventListener('resize', () => {
    if (screens.viewer.classList.contains('active') && currentViewSiteName) {
        const gridData = loadGrid(currentViewSiteName);
        if (gridData) {
            setupCanvas(gridData.size); 
            clearSelectionAndCanvas(); 
        }
    }
});

// --- Инициализация и обработка событий ---

document.addEventListener('mouseup', stopDraw);
document.addEventListener('touchend', stopDraw);

// Кнопки просмотра
document.getElementById('copy-button').addEventListener('click', copyPassword);
copyAllButton.addEventListener('click', copyAllSymbols); 

// Навигационные кнопки
document.getElementById('nav-create').addEventListener('click', () => showScreen('create'));
document.getElementById('nav-my-grids').addEventListener('click', displayMyGrids);

// Переключатель источника символов
sourceRandom.addEventListener('change', toggleManualInput);
sourceManual.addEventListener('change', toggleManualInput);

// Кнопки "Назад"
document.getElementById('back-from-create').addEventListener('click', () => {
    newSiteNameInput.value = ''; 
    createMessage.textContent = ''; 
    showScreen('menu');
});
document.getElementById('back-from-my-grids').addEventListener('click', () => showScreen('menu'));
document.getElementById('back-from-viewer').addEventListener('click', displayMyGrids); 

// Кнопка сохранения новой сетки
document.getElementById('generate-and-save-button').addEventListener('click', handleGenerateAndSave);

// Кнопка переключения языка
document.getElementById('lang-toggle-btn').addEventListener('click', () => {
    currentLanguage = (currentLanguage === 'ru' ? 'en' : 'ru');
    updateInterfaceText();
});


// Начальная загрузка: показываем главное меню и устанавливаем начальное состояние ввода
showScreen('menu');
document.addEventListener('DOMContentLoaded', () => {
    updateInterfaceText(); // Вызываем перевод при загрузке
    toggleManualInput();
});
