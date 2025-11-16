// --- Настройки и Константы ---
const CHAR_SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+[]{}|;:,.<>?'
};
const STORAGE_PREFIX = 'password_grid_';

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
// Массив cellPositions больше не нужен для рисования, но оставим его, 
// так как он может быть полезен для других целей, но очистим логику его заполнения.
let cellPositions = []; 
let selectedPoints = []; // Хранит {id, x, y, element} точек выбранных ячеек в порядке выбора

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
    if (confirm(`Вы уверены, что хотите удалить сетку для "${siteName}"?`)) {
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
        createMessage.textContent = '⛔ Пожалуйста, введите имя сайта.';
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
            createMessage.textContent = `⛔ Для сетки ${selectedSize}x${selectedSize} требуется ${totalRequired} символов. Введено: ${manualInput.length}.`;
            createMessage.style.color = 'red';
            return;
        }
        newCharacters = manualInput.split('').slice(0, totalRequired); 

    } else {
        // --- СЛУЧАЙНАЯ ГЕНЕРАЦИЯ ---
        const charSet = getCharacterSet();
        if (charSet.length === 0) {
            createMessage.textContent = '⛔ Пожалуйста, выберите хотя бы один тип символов.';
            createMessage.style.color = 'red';
            return;
        }
        newCharacters = generateCharacterArray(selectedSize, charSet);
    }


    if (loadGrid(siteName) && !confirm(`Сетка для "${siteName}" уже существует. Перезаписать?`)) {
        return;
    }

    const gridData = {
        size: selectedSize,
        characters: newCharacters
    };
    saveGrid(siteName, gridData);
    
    newSiteNameInput.value = '';
    manualCharsInput.value = ''; 
    createMessage.textContent = `✅ Сетка для "${siteName}" успешно создана и сохранена!`;
    createMessage.style.color = 'green';
    
    renderGrid(siteName, gridData);
}

function displayMyGrids() {
    showScreen('myGrids');
    const siteNames = getAllSavedSiteNames();
    
    gridsListContainer.innerHTML = '';

    if (siteNames.length === 0) {
        gridsListContainer.innerHTML = '<p>У вас пока нет сохраненных сеток.</p>';
        return;
    }

    siteNames.forEach(name => {
        const item = document.createElement('div');
        item.classList.add('grid-item');
        item.innerHTML = `<span>${name}</span>`;
        
        const viewButton = document.createElement('button');
        viewButton.textContent = 'Открыть сетку';
        viewButton.classList.add('view-btn');
        
        viewButton.addEventListener('click', () => {
            const gridData = loadGrid(name);
            if (gridData) {
                renderGrid(name, gridData);
            } else {
                alert('Ошибка: Не удалось загрузить сетку.');
            }
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
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

// --- Настройка сетки и Canvas ---

function setupCanvas(size) {
    const wrapper = document.querySelector('.grid-wrapper');
    const rect = wrapper.getBoundingClientRect();
    
    // Внимание: Логика Canvas удалена, но оставим установку размеров
    // на случай, если вы решите добавить другой визуальный элемент позже.
    drawingCanvas.width = rect.width;
    drawingCanvas.height = rect.height;

    cellPositions = [];
    const cellElements = gridContainer.querySelectorAll('.cell');
    
    cellElements.forEach(cell => {
        const cellRect = cell.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect(); 
        
        // Эти координаты больше не используются для рисования, но сохраняют элемент
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
    currentSiteTitle.textContent = `Сетка для: ${siteName} (${size}x${size})`;

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
    // ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height); // Удалена очистка канваса
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
            // lastPoint больше не нужен для drawTrace
            // const lastPoint = selectedPoints.length > 0 ? selectedPoints[selectedPoints.length - 1] : null; 
            
            selectedPoints.push(newCellPosition);
            
            // drawTrace(lastPoint, newCellPosition); // Вызов drawTrace удален
        }
        
        updatePasswordDisplay(); 
    }
}

// *** Функция drawTrace удалена ***

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
            alert('Пароль скопирован в буфер обмена!');
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            alert('Не удалось скопировать пароль. Попробуйте вручную.');
        });
    } else {
        alert('Сначала выберите символы!');
    }
}

/**
 * Копирует все символы из текущей активной сетки в буфер обмена.
 */
function copyAllSymbols() {
    const gridData = loadGrid(currentViewSiteName); 
    
    if (!gridData || !gridData.characters) {
        alert('Ошибка: Нет активной или сохраненной сетки для копирования.');
        return;
    }
    
    const allSymbols = gridData.characters.join('');

    navigator.clipboard.writeText(allSymbols).then(() => {
        alert(`Все ${allSymbols.length} символов сетки скопированы в буфер обмена!`);
    }).catch(err => {
        console.error('Ошибка копирования всей сетки: ', err);
        alert('Не удалось скопировать все символы. Попробуйте вручную.');
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

// Начальная загрузка: показываем главное меню и устанавливаем начальное состояние ввода
showScreen('menu');
document.addEventListener('DOMContentLoaded', toggleManualInput);