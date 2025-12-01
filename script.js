// script.js - с системой отслеживания ключей

// Функция инициализации приложения
async function initApp() {
    console.log('Приложение инициализировано');
    
    const savedKey = localStorage.getItem('userKey');
    const deviceId = getStableDeviceId();
    
    if (savedKey) {
        // Загружаем данные ключей
        const keysData = await loadKeysData();
        
        if (keysData[savedKey]) {
            const keyInfo = keysData[savedKey];
            
            // Проверяем, истек ли срок
            if (keyInfo.activationTime) {
                const activationTime = keyInfo.activationTime;
                const currentTime = new Date().getTime();
                const daysPassed = (currentTime - activationTime) / (1000 * 60 * 60 * 24);
                
                if (daysPassed > 10) {
                    logoutWithMessage('❌ Срок действия ключа истек (10 дней). Приобретите новый ключ.');
                    return;
                }
            }
            
            // Проверяем, тот ли это deviceId
            if (keyInfo.deviceId === deviceId) {
                showMainMenu();
            } else {
                logoutWithMessage('❌ Ключ активирован на другом устройстве.');
            }
        }
    }
}

// Стабильный DeviceId
function getStableDeviceId() {
    let deviceId = localStorage.getItem('stableDeviceId');
    if (!deviceId) {
        deviceId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('stableDeviceId', deviceId);
    }
    return deviceId;
}

// Загрузка данных ключей
async function loadKeysData() {
    try {
        const response = await fetch('keys.json');
        return await response.json();
    } catch (error) {
        console.log('Не удалось загрузить keys.json, используем локальные данные');
        return getDefaultKeysData();
    }
}

// Данные ключей по умолчанию
function getDefaultKeysData() {
    const defaultData = {};
    validKeys.forEach(key => {
        defaultData[key] = { used: false, deviceId: null, activationTime: null };
    });
    return defaultData;
}

// Список валидных ключей
const validKeys = [
    "SHK-A3B9-C2D8", "SHK-E5F7-G6H4", "SHK-J8K3-L9M2", "SHK-N4P6-Q7R5",
    "SHK-S9T2-U8V4", "SHK-W3X7-Y5Z6", "SHK-2A8B-4C9D", "SHK-6E3F-7G5H",
    "SHK-8J2K-9L3M", "SHK-5N7P-6Q4R", "SHK-3S8T-4U6V", "SHK-7W9X-2Y8Z",
    "SHK-B4C6-D8E2", "SHK-F9G3-H5J7", "SHK-K2L4-M6N8", "SHK-P7Q9-R3S5",
    "SHK-T8V2-W4X6", "SHK-Y7Z3-A5B9", "SHK-C8D4-E6F2", "SHK-G7H9-J3K5",
    "SHK-L6M8-N4P2", "SHK-Q5R7-S9T3", "SHK-V4W6-X8Y2", "SHK-Z5A7-B9C3",
    "SHK-D6E8-F4G2", "SHK-H7J9-K5L3", "SHK-M8N2-P6Q4", "SHK-R9S3-T5U7",
    "SHK-W4X6-Y8Z2", "SHK-A9B3-C5D7"
];

// Проверка при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function checkKey() {
    const keyInput = document.getElementById('keyInput');
    const keyMessage = document.getElementById('keyMessage');
    const key = keyInput.value.trim().toUpperCase();
    const deviceId = getStableDeviceId();

    console.log('Проверка ключа:', key, 'DeviceId:', deviceId);

    // Загружаем данные ключей
    const keysData = await loadKeysData();
    
    if (validKeys.includes(key)) {
        const keyInfo = keysData[key];
        
        // Если ключ уже использован другим deviceId
        if (keyInfo.used && keyInfo.deviceId !== deviceId) {
            keyMessage.textContent = "❌ Этот ключ уже активирован на другом устройстве.";
            keyMessage.style.color = "red";
            return;
        }
        
        // Если ключ уже использован этим deviceId - просто входим
        if (keyInfo.used && keyInfo.deviceId === deviceId) {
            localStorage.setItem('userKey', key);
            keyMessage.textContent = "✅ Вход выполнен!";
            keyMessage.style.color = "green";
            setTimeout(showMainMenu, 1000);
            return;
        }
        
        // Активируем новый ключ
        keysData[key] = {
            used: true,
            deviceId: deviceId,
            activationTime: new Date().getTime()
        };
        
        // Сохраняем обновленные данные (в реальном проекте это бы сохранялось на сервере)
        localStorage.setItem('userKey', key);
        localStorage.setItem('keysData', JSON.stringify(keysData));
        
        keyMessage.textContent = "✅ Ключ активирован! Добро пожаловать!";
        keyMessage.style.color = "green";
        
        setTimeout(() => {
            const activationTime = new Date(keysData[key].activationTime);
            const expiryTime = new Date(activationTime.getTime() + (10 * 24 * 60 * 60 * 1000));
            keyMessage.innerHTML = `✅ Ключ активирован!<br><small>Действителен до: ${expiryTime.toLocaleDateString()}</small>`;
        }, 1000);
        
        setTimeout(showMainMenu, 2000);
    } else {
        keyMessage.textContent = "❌ Неверный ключ. Попробуйте другой или свяжитесь с нами.";
        keyMessage.style.color = "red";
    }
}

function showMainMenu() {
    document.getElementById('keyScreen').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
    showSection('solver');
    loadDiary();
    loadNotes();
    showKeyInfo();
}

function showKeyInfo() {
    const userKey = localStorage.getItem('userKey');
    
    if (userKey) {
        const keysData = JSON.parse(localStorage.getItem('keysData') || '{}');
        const keyInfo = keysData[userKey];
        
        if (keyInfo && keyInfo.activationTime) {
            const activationTime = new Date(keyInfo.activationTime);
            const expiryTime = new Date(activationTime.getTime() + (10 * 24 * 60 * 60 * 1000));
            const daysLeft = Math.ceil((expiryTime - new Date()) / (1000 * 60 * 60 * 24));
            
            let keyInfoElement = document.querySelector('.key-info');
            if (!keyInfoElement) {
                keyInfoElement = document.createElement('div');
                keyInfoElement.className = 'key-info';
                keyInfoElement.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.9);
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    z-index: 1000;
                    max-width: 200px;
                `;
                document.getElementById('mainMenu').appendChild(keyInfoElement);
            }
            
            keyInfoElement.innerHTML = `
                <strong>🔑 Ключ активен</strong><br>
                Осталось дней: <strong style="color: ${daysLeft > 3 ? '#38a169' : daysLeft > 1 ? '#ed8936' : '#e53e3e'}">${daysLeft}</strong><br>
                <small>Истекает: ${expiryTime.toLocaleDateString()}</small>
            `;
        }
    }
}

function logoutWithMessage(message) {
    const keyMessage = document.getElementById('keyMessage');
    keyMessage.textContent = message;
    keyMessage.style.color = "red";
    logout();
}

function logout() {
    localStorage.removeItem('userKey');
    localStorage.removeItem('grades');
    localStorage.removeItem('notes');
    
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('keyScreen').classList.add('active');
    document.getElementById('keyInput').value = '';
    
    const keyInfo = document.querySelector('.key-info');
    if (keyInfo) {
        keyInfo.remove();
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    if (sectionName === 'keyInfo') {
        showKeyInfoSection();
    }
}

async function showKeyInfoSection() {
    const userKey = localStorage.getItem('userKey');
    const keysData = JSON.parse(localStorage.getItem('keysData') || '{}');
    const keyInfo = keysData[userKey];
    
    if (!userKey || !keyInfo) {
        return;
    }
    
    const activationTime = new Date(keyInfo.activationTime);
    const expiryTime = new Date(activationTime.getTime() + (10 * 24 * 60 * 60 * 1000));
    const daysLeft = Math.ceil((expiryTime - new Date()) / (1000 * 60 * 60 * 24));
    const totalDays = 10;
    const progress = (daysLeft / totalDays) * 100;
    
    document.getElementById('currentKey').textContent = userKey;
    document.getElementById('activationDate').textContent = activationTime.toLocaleDateString();
    document.getElementById('expiryDate').textContent = expiryTime.toLocaleDateString();
    document.getElementById('daysLeft').textContent = daysLeft;
    document.getElementById('deviceId').textContent = keyInfo.deviceId || 'Неизвестно';
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    progressFill.style.width = `${progress}%`;
    progressFill.style.backgroundColor = 
        daysLeft > 7 ? '#38a169' : 
        daysLeft > 3 ? '#ed8936' : '#e53e3e';
    
    progressText.textContent = `${daysLeft} из ${totalDays} дней`;
}

// Все остальные функции остаются БЕЗ ИЗМЕНЕНИЙ
function solveEquation() {
    const equation = document.getElementById('equationInput').value;
    const resultDiv = document.getElementById('solutionResult');
    
    if (!equation) {
        resultDiv.innerHTML = '<div class="error">❌ Введите уравнение</div>';
        return;
    }
    
    if (!equation.includes('=')) {
        resultDiv.innerHTML = '<div class="error">❌ Уравнение должно содержать знак "="</div>';
        return;
    }

    if (!equation.match(/[a-z]/i)) {
        resultDiv.innerHTML = '<div class="error">❌ Введите уравнение с переменной (x, y, t, a, b, c, и т.д.)</div>';
        return;
    }

    try {
        const solution = solveMathEquation(equation);
        
        resultDiv.innerHTML = `
            <div class="success">
                <h4>✅ Уравнение решено!</h4>
                <div class="solution-steps">
                    ${solution.steps.map(step => `<p>${step}</p>`).join('')}
                </div>
            </div>
        `;
        
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">❌ Ошибка: ' + error.message + '</div>';
    }
}

function solveMathOperation() {
    const operationType = document.getElementById('operationType').value;
    const number1 = parseInt(document.getElementById('number1').value);
    const number2 = parseInt(document.getElementById('number2').value);
    const resultDiv = document.getElementById('mathResult');
    
    if (!number1 || !number2) {
        resultDiv.innerHTML = '<div class="error">❌ Введите оба числа</div>';
        return;
    }
    
    if (number2 === 0 && (operationType === 'division' || operationType === 'divisionWithRemainder')) {
        resultDiv.innerHTML = '<div class="error">❌ Деление на ноль невозможно</div>';
        return;
    }
    
    try {
        let result;
        switch(operationType) {
            case 'multiplication':
                result = solveMultiplication(number1, number2);
                break;
            case 'division':
                result = solveDivision(number1, number2);
                break;
            case 'divisionWithRemainder':
                result = solveDivisionWithRemainder(number1, number2);
                break;
        }
        
        resultDiv.innerHTML = `
            <div class="success">
                <h4>✅ Решение ${getOperationName(operationType)}</h4>
                <div class="math-steps">
                    ${result.steps.map(step => `<p>${step}</p>`).join('')}
                </div>
                ${result.column ? `<div class="column-solution">${result.column}</div>` : ''}
            </div>
        `;
        
    } catch (error) {
        resultDiv.innerHTML = '<div class="error">❌ Ошибка: ' + error.message + '</div>';
    }
}

function getOperationName(operationType) {
    const names = {
        'multiplication': 'умножения',
        'division': 'деления',
        'divisionWithRemainder': 'деления с остатком'
    };
    return names[operationType] || 'операции';
}

let currentGradingSystem = '5';

function changeGradingSystem() {
    currentGradingSystem = document.getElementById('gradingSystem').value;
    const gradeInput = document.getElementById('gradeInput');
    
    if (currentGradingSystem === '5') {
        gradeInput.max = 5;
        gradeInput.placeholder = "Оценка (1-5)";
    } else {
        gradeInput.max = 10;
        gradeInput.placeholder = "Оценка (1-10)";
    }
    
    loadDiary();
}

function addGrade() {
    const subject = document.getElementById('subjectName').value.trim();
    const grade = document.getElementById('gradeInput').value;
    
    if (!subject || !grade) {
        alert('Введите название предмета и оценку');
        return;
    }
    
    const maxGrade = currentGradingSystem === '5' ? 5 : 10;
    if (grade < 1 || grade > maxGrade) {
        alert(`Оценка должна быть от 1 до ${maxGrade}`);
        return;
    }
    
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');
    grades.push({
        subject,
        grade: parseInt(grade),
        system: currentGradingSystem,
        date: new Date().toLocaleDateString()
    });
    
    localStorage.setItem('grades', JSON.stringify(grades));
    
    document.getElementById('subjectName').value = '';
    document.getElementById('gradeInput').value = '';
    
    loadDiary();
}

function loadDiary() {
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');
    const gradesList = document.getElementById('gradesList');
    const averageGrade = document.getElementById('averageGrade');
    
    gradesList.innerHTML = '';
    
    if (grades.length === 0) {
        gradesList.innerHTML = '<p>Оценок пока нет</p>';
        averageGrade.innerHTML = '';
        return;
    }
    
    const currentSystemGrades = grades.filter(g => g.system === currentGradingSystem);
    
    if (currentSystemGrades.length === 0) {
        gradesList.innerHTML = '<p>Нет оценок для текущей системы</p>';
        averageGrade.innerHTML = '';
        return;
    }
    
    let total = 0;
    
    currentSystemGrades.forEach((gradeObj, index) => {
        total += gradeObj.grade;
        
        const gradeItem = document.createElement('div');
        gradeItem.className = 'grade-item';
        gradeItem.innerHTML = `
            <span>${gradeObj.subject}</span>
            <span>
                <strong>${gradeObj.grade}</strong>
                <button onclick="deleteGrade(${index})" style="margin-left: 10px; color: red; border: none; background: none; cursor: pointer;">🗑️</button>
            </span>
        `;
        gradesList.appendChild(gradeItem);
    });
    
    const average = (total / currentSystemGrades.length).toFixed(2);
    averageGrade.innerHTML = `Средний балл: <strong>${average}</strong>`;
}

function deleteGrade(index) {
    const grades = JSON.parse(localStorage.getItem('grades') || '[]');
    grades.splice(index, 1);
    localStorage.setItem('grades', JSON.stringify(grades));
    loadDiary();
}

function addNote() {
    const noteText = document.getElementById('noteText').value.trim();
    
    if (!noteText) {
        alert('Введите текст памятки');
        return;
    }
    
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.push({
        text: noteText,
        date: new Date().toLocaleString()
    });
    
    localStorage.setItem('notes', JSON.stringify(notes));
    
    document.getElementById('noteText').value = '';
    loadNotes();
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    const notesList = document.getElementById('notesList');
    
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p>Памяток пока нет</p>';
        return;
    }
    
    notes.forEach((note, index) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerHTML = `
            <p>${note.text}</p>
            <small>${note.date}</small>
            <button onclick="deleteNote(${index})" style="float: right; color: red; border: none; background: none; cursor: pointer;">🗑️</button>
        `;
        notesList.appendChild(noteItem);
    });
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

document.getElementById('keyInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkKey();
});

document.getElementById('equationInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') solveEquation();
});

if (typeof checkKey === 'undefined') window.checkKey = checkKey;
if (typeof showMainMenu === 'undefined') window.showMainMenu = showMainMenu;
if (typeof logout === 'undefined') window.logout = logout;
if (typeof showSection === 'undefined') window.showSection = showSection;
if (typeof solveEquation === 'undefined') window.solveEquation = solveEquation;
if (typeof solveMathOperation === 'undefined') window.solveMathOperation = solveMathOperation;
