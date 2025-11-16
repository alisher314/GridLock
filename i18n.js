const translations = {
    'ru': {
        'app_title': 'GridLock: Генератор Паролей-Схем',
        'menu_main': 'Главное меню',
        'btn_create_new': '➕ Создать новую сетку паролей',
        'btn_my_grids': '📂 Мои сетки паролей',
        'btn_view_grid': 'Открыть сетку', // <-- ИСПРАВЛЕНО
        'btn_delete': 'Удалить', // <-- ИСПРАВЛЕНО
        'btn_back_menu': '← Назад в меню',
        'create_title': 'Создание новой сетки',
        'step1_name': '1. Имя сайта (ключ):',
        'placeholder_site': 'Имя сайта (напр., Instagram)',
        'step2_options': '2. Опции и символы:',
        'label_size': 'Размер сетки (NxN):',
        'source_random': 'Случайная генерация',
        'source_manual': 'Ввести свои символы',
        'placeholder_manual': 'Введите символы для сетки (минимум N*N символов)',
        'step4_set': '4. Набор символов (для случайной генерации):',
        'btn_generate_save': 'Создать сетку и сохранить',
        'msg_no_grids': 'Здесь будут отображаться ваши сохраненные сетки.',
        'mygrids_title': 'Мои сохраненные сетки',
        'btn_back_list': '← Назад к списку',
        'viewer_title_prefix': 'Сетка для:',
        'selected_chars': 'Выбранные символы:',
        'btn_copy_selected': 'Копировать выбранный пароль',
        'btn_copy_all': 'Копировать всю сетку',
        'inst_title': 'Инструкция по использованию:',
        'inst_1': '1. Проведение: Для генерации пароля **проведите мышью** (или пальцем) по ячейкам в определенном вами порядке (схеме).',
        'inst_2': '2. Секрет: Пароль определяется **сеткой** (которая хранится здесь) и вашей **схемой движения** (которая хранится только в вашей памяти).',
        'inst_3': '3. Безопасность: Чтобы восстановить пароль, вам достаточно помнить имя сайта и схему. Не записывайте схему рядом с сеткой!',
        'footer': 'GridLock | Glassmorphism Dark v1.0',
        
        // JS Alert messages
        'alert_enter_site_name': '⛔ Пожалуйста, введите имя сайта.',
        'alert_chars_required': (length, required) => `⛔ Для сетки требуется ${required} символов. Введено: ${length}.`,
        'alert_select_char_type': '⛔ Пожалуйста, выберите хотя бы один тип символов.',
        'alert_overwrite_confirm': (name) => `Сетка для "${name}" уже существует. Перезаписать?`,
        'alert_success_saved': (name) => `✅ Сетка для "${name}" успешно создана и сохранена!`,
        'alert_delete_confirm': (name) => `Вы уверены, что хотите удалить сетку для "${name}"?`,
        'alert_load_error': 'Ошибка: Не удалось загрузить сетку.',
        'alert_copied': 'Пароль скопирован в буфер обмена!',
        'alert_copy_error': 'Ошибка копирования: Не удалось скопировать пароль. Попробуйте вручную.',
        'alert_select_first': 'Сначала выберите символы!',
        'alert_no_active_grid': 'Ошибка: Нет активной или сохраненной сетки для копирования.',
        'alert_all_copied': (length) => `Все ${length} символов сетки скопированы в буфер обмена!`,
        'alert_copy_all_error': 'Ошибка копирования всей сетки: Не удалось скопировать все символы. Попробуйте вручную.'
    },
    'en': {
        'app_title': 'GridLock: Scheme Password Generator',
        'menu_main': 'Main Menu',
        'btn_create_new': '➕ Create New Password Grid',
        'btn_my_grids': '📂 My Password Grids',
        'btn_view_grid': 'View Grid', // <-- ИСПРАВЛЕНО
        'btn_delete': 'Delete', // <-- ИСПРАВЛЕНО
        'btn_back_menu': '← Back to Menu',
        'create_title': 'Create New Grid',
        'step1_name': '1. Site Name (Key):',
        'placeholder_site': 'Site name (e.g., Instagram)',
        'step2_options': '2. Options and Characters:',
        'label_size': 'Grid Size (NxN):',
        'source_random': 'Random Generation',
        'source_manual': 'Enter Custom Characters',
        'placeholder_manual': 'Enter characters for the grid (minimum N*N characters)',
        'step4_set': '4. Character Set (for random generation only):',
        'btn_generate_save': 'Create Grid and Save',
        'msg_no_grids': 'Your saved grids will appear here.',
        'mygrids_title': 'My Saved Grids',
        'btn_back_list': '← Back to List',
        'viewer_title_prefix': 'Grid for:',
        'selected_chars': 'Selected Characters:',
        'btn_copy_selected': 'Copy Selected Password',
        'btn_copy_all': 'Copy Entire Grid',
        'inst_title': 'Usage Instructions:',
        'inst_1': '1. Drawing: To generate the password, **swipe/drag the mouse** (or finger) across the cells in your predetermined pattern (scheme).',
        'inst_2': '2. Secret: The password is defined by the **grid** (stored here) and your **movement scheme** (stored only in your memory).',
        'inst_3': '3. Security: To retrieve the password, you only need to remember the site name and the scheme. Do not write the scheme next to the grid!',
        'footer': 'GridLock | Glassmorphism Dark v1.0',
        
        // JS Alert messages
        'alert_enter_site_name': '⛔ Please enter a site name.',
        'alert_chars_required': (length, required) => `⛔ A ${required} character grid is required. Entered: ${length}.`,
        'alert_select_char_type': '⛔ Please select at least one character type.',
        'alert_overwrite_confirm': (name) => `The grid for "${name}" already exists. Overwrite?`,
        'alert_success_saved': (name) => `✅ Grid for "${name}" successfully created and saved!`,
        'alert_delete_confirm': (name) => `Are you sure you want to delete the grid for "${name}"?`,
        'alert_load_error': 'Error: Failed to load grid.',
        'alert_copied': 'Password copied to clipboard!',
        'alert_copy_error': 'Copy error: Failed to copy password. Try manually.',
        'alert_select_first': 'Select characters first!',
        'alert_no_active_grid': 'Error: No active or saved grid to copy.',
        'alert_all_copied': (length) => `All ${length} grid characters copied to clipboard!`,
        'alert_copy_all_error': 'Copy error for entire grid: Failed to copy all characters. Try manually.'
    }
};

let currentLanguage = 'ru'; 

function t(key, ...args) {
    const text = translations[currentLanguage][key];
    if (typeof text === 'function') {
        return text(...args);
    }
    return text || `[MISSING TRANSLATION: ${key}]`;
}
