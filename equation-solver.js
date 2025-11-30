// equation-solver.js - полностью переписанный решатель

function solveMathEquation(equation) {
    let steps = [];
    let eq = equation.replace(/\s/g, '').replace(/,/g, '.');
    
    steps.push(`<strong>1. Исходное уравнение:</strong> ${equation}`);
    
    // Находим все переменные (буквы) в уравнении
    const variables = [...new Set(eq.match(/[a-z]/gi))] || [];
    
    if (variables.length === 0) {
        throw new Error('Уравнение не содержит переменных');
    }
    
    const variable = variables[0];
    let [left, right] = eq.split('=');
    
    // ПРОСТАЯ ЛОГИКА ДЛЯ БАЗОВЫХ УРАВНЕНИЙ
    if (isSimpleEquation(left, right, variable)) {
        return solveSimpleEquation(left, right, variable, steps);
    }
    
    // СЛОЖНАЯ ЛОГИКА ДЛЯ ОСТАЛЬНЫХ СЛУЧАЕВ
    return solveComplexEquation(left, right, variable, steps);
}

function isSimpleEquation(left, right, variable) {
    // Проверяем, что уравнение простое: ax + b = c
    const simplePattern = new RegExp(`^([-+]?[\\d.]*)${variable}([-+][\\d.]+)?$`, 'i');
    return simplePattern.test(left) && !isNaN(parseFloat(right));
}

function solveSimpleEquation(left, right, variable, steps) {
    let rightValue = parseFloat(right);
    steps.push(`<strong>2. Правая часть:</strong> ${right}`);
    
    // Разбираем левую часть: ax + b
    let a = 0; // коэффициент при переменной
    let b = 0; // константа
    
    // Ищем переменную в левой части
    const varMatch = left.match(new RegExp(`([-+]?[\\d.]*)${variable}`, 'i'));
    if (varMatch) {
        let coeff = varMatch[1];
        if (coeff === '' || coeff === '+') a = 1;
        else if (coeff === '-') a = -1;
        else a = parseFloat(coeff);
    }
    
    // Ищем константу в левой части
    const constMatch = left.replace(new RegExp(variable, 'gi'), '').match(/([-+]?[\d.]+)$/);
    if (constMatch) {
        b = parseFloat(constMatch[0]);
    }
    
    steps.push(`<strong>3. Анализ левой части:</strong>`);
    steps.push(`&nbsp;&nbsp;Коэффициент при ${variable}: ${a}`);
    steps.push(`&nbsp;&nbsp;Константа: ${b}`);
    
    if (a === 0) {
        if (b === rightValue) {
            steps.push(`<strong>4. Решение:</strong> Уравнение верно для любого ${variable}`);
            return { steps, solution: `${variable} ∈ ℝ` };
        } else {
            steps.push(`<strong>4. Решение:</strong> Уравнение не имеет решений`);
            return { steps, solution: 'Нет решения' };
        }
    }
    
    let solution = (rightValue - b) / a;
    
    steps.push(`<strong>4. Решаем уравнение:</strong>`);
    steps.push(`&nbsp;&nbsp;${formatEquation(a, b, variable)} = ${rightValue}`);
    steps.push(`&nbsp;&nbsp;${formatTerm(a, variable)} = ${rightValue} - ${b}`);
    steps.push(`&nbsp;&nbsp;${formatTerm(a, variable)} = ${rightValue - b}`);
    steps.push(`&nbsp;&nbsp;${variable} = ${rightValue - b} / ${a}`);
    steps.push(`<strong>5. Ответ:</strong> ${variable} = ${solution}`);
    
    return { steps, solution: solution };
}

function solveComplexEquation(left, right, variable, steps) {
    steps.push(`<strong>2. Сложное уравнение - используем численный метод</strong>`);
    
    // Простой численный метод: подставляем значения и находим корень
    let solution = findRoot(left, right, variable);
    
    steps.push(`<strong>3. Найденное решение:</strong> ${variable} = ${solution}`);
    steps.push(`<strong>4. Проверка:</strong> Подставляем ${solution} в уравнение`);
    
    // Проверяем решение
    let leftValue = calculateExpression(left.replace(new RegExp(variable, 'gi'), solution));
    let rightValue = calculateExpression(right.replace(new RegExp(variable, 'gi'), solution));
    
    steps.push(`&nbsp;&nbsp;Левая часть: ${leftValue}`);
    steps.push(`&nbsp;&nbsp;Правая часть: ${rightValue}`);
    steps.push(`&nbsp;&nbsp;Разность: ${Math.abs(leftValue - rightValue)}`);
    
    steps.push(`<strong>5. Ответ:</strong> ${variable} ≈ ${solution.toFixed(4)}`);
    
    return { steps, solution: solution.toFixed(4) };
}

function findRoot(left, right, variable) {
    // Простой метод половинного деления
    let x = 0;
    let step = 10;
    let maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
        let leftValue = calculateExpression(left.replace(new RegExp(variable, 'gi'), x));
        let rightValue = calculateExpression(right.replace(new RegExp(variable, 'gi'), x));
        let diff = leftValue - rightValue;
        
        if (Math.abs(diff) < 0.001) {
            return x;
        }
        
        if (diff > 0) {
            x -= step;
        } else {
            x += step;
        }
        
        step /= 2;
    }
    
    return x;
}

function calculateExpression(expr) {
    // Безопасное вычисление выражения
    try {
        // Убираем лишние операторы в начале
        expr = expr.replace(/^[+]/, '');
        
        // Заменяем последовательности операторов
        expr = expr.replace(/--/g, '+');
        expr = expr.replace(/\+-/g, '-');
        expr = expr.replace(/-\+/g, '-');
        
        // Вычисляем простое выражение
        return eval(expr);
    } catch (error) {
        // Если eval не работает, используем простой парсер
        return parseSimpleExpression(expr);
    }
}

function parseSimpleExpression(expr) {
    let result = 0;
    let currentNumber = '';
    let currentSign = 1;
    
    for (let i = 0; i < expr.length; i++) {
        let char = expr[i];
        
        if (char === '+' || char === '-') {
            if (currentNumber !== '') {
                result += currentSign * parseFloat(currentNumber);
                currentNumber = '';
            }
            currentSign = char === '+' ? 1 : -1;
        } else if (!isNaN(char) || char === '.') {
            currentNumber += char;
        }
    }
    
    if (currentNumber !== '') {
        result += currentSign * parseFloat(currentNumber);
    }
    
    return result;
}

function formatEquation(a, b, variable) {
    let equation = '';
    
    if (a !== 0) {
        equation += formatTerm(a, variable);
    }
    
    if (b !== 0) {
        if (b > 0 && equation !== '') equation += ' + ';
        else if (b < 0) equation += ' - ';
        equation += Math.abs(b);
    }
    
    return equation || '0';
}

function formatTerm(coefficient, variable) {
    if (coefficient === 1) return variable;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient}${variable}`;
}

// Проверяем, что функция определена для оффлайн работы
if (typeof solveMathEquation === 'undefined') {
    window.solveMathEquation = solveMathEquation;
            }
