// ocr-scanner.js - распознавание текста с фотографий

let ocrWorker = null;

// Инициализация Tesseract
async function initOCR() {
    try {
        // Динамически загружаем Tesseract.js
        const { createWorker } = await import('https://cdn.jsdelivr.net/npm/tesseract.js@v4.0.2/dist/tesseract.min.js');
        ocrWorker = await createWorker('rus+eng'); // Русский и английский языки
        console.log('Tesseract.js загружен');
    } catch (error) {
        console.error('Ошибка загрузки Tesseract.js:', error);
    }
}

// Обработка изображения
async function processImage() {
    const imageInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('ocrResult');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!imageInput.files || imageInput.files.length === 0) {
        resultDiv.innerHTML = '<div class="error">❌ Выберите изображение</div>';
        return;
    }
    
    const file = imageInput.files[0];
    
    // Показываем превью
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    resultDiv.innerHTML = '<div class="loading">⏳ Распознавание текста...</div>';
    
    try {
        // Инициализируем OCR если еще не инициализирован
        if (!ocrWorker) {
            await initOCR();
        }
        
        // Распознаем текст
        const { data: { text } } = await ocrWorker.recognize(file);
        
        // Очищаем результат
        const cleanText = text.trim();
        
        if (!cleanText) {
            resultDiv.innerHTML = '<div class="error">❌ Не удалось распознать текст</div>';
            return;
        }
        
        // Показываем результат
        resultDiv.innerHTML = `
            <div class="success">
                <h4>✅ Текст распознан!</h4>
                <div class="ocr-result-text">
                    <p><strong>Распознанный текст:</strong></p>
                    <textarea id="recognizedText" rows="4">${cleanText}</textarea>
                    <div class="ocr-buttons">
                        <button onclick="useAsEquation()" class="ocr-action-btn">Использовать как уравнение</button>
                        <button onclick="copyText()" class="ocr-action-btn">Копировать текст</button>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Ошибка распознавания:', error);
        resultDiv.innerHTML = '<div class="error">❌ Ошибка распознавания: ' + error.message + '</div>';
    }
}

// Использовать распознанный текст как уравнение
function useAsEquation() {
    const recognizedText = document.getElementById('recognizedText').value;
    const equationInput = document.getElementById('equationInput');
    
    // Автоматически вставляем в поле уравнения
    equationInput.value = recognizedText;
    
    // Переключаемся на вкладку решателя
    showSection('solver');
    
    // Автоматически решаем если это похоже на уравнение
    if (recognizedText.includes('=')) {
        setTimeout(() => {
            solveEquation();
        }, 500);
    }
}

// Копировать текст
function copyText() {
    const recognizedText = document.getElementById('recognizedText').value;
    navigator.clipboard.writeText(recognizedText)
        .then(() => {
            alert('Текст скопирован в буфер обмена!');
        })
        .catch(err => {
            console.error('Ошибка копирования:', err);
        });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем Tesseract.js фоном
    initOCR();
});
