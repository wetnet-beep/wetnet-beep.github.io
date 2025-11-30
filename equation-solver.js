// equation-solver.js - улучшенный решатель уравнений с поддержкой нескольких переменных

function solveMathEquation(equation) {
    let steps = [];
    let eq = equation.replace(/\s/g, '').replace(/,/g, '.');
    
    steps.push(`<strong>1. Исходное уравнение:</strong> ${equation}`);
    
    // Находим все переменные (буквы) в уравнении
    const variables = [...new Set(eq.match(/[a-z]/gi))] || [];
    
    if (variables.length === 0) {
        throw new Error('Уравнение не содержит переменных');
    }
    
    if (variables.length > 1) {
        return solveMultiVariableEquation(eq, variables, steps);
    } else {
        return solveSingleVariableEquation(eq, variables[0], steps);
    }
}

function solveSingleVariableEquation(eq, variable, steps) {
    let [left, right] = eq.split('=');
    
    // ВЫЧИСЛЯЕМ ПРАВУЮ ЧАСТЬ
    let rightValue = eval(right.replace(new RegExp(variable, 'gi'), '0'));
    steps.push(`<strong>2. Вычисляем правую часть:</strong> ${right} = ${rightValue}`);
    
    // ВЫЧИСЛЯЕМ ЛЕВУЮ ЧАСТЬ БЕЗ ПЕРЕМЕННОЙ (константы)
    let leftWithoutVar = left.replace(new RegExp(variable, 'gi'), '0');
    let constantValue = eval(leftWithoutVar);
    steps.push(`<strong>3. Вычисляем постоянную часть слева:</strong> ${leftWithoutVar} = ${constantValue}`);
    
    // НАХОДИМ КОЭФФИЦИЕНТ ПРИ ПЕРЕМЕННОЙ
    let varCoefficient = getVariableCoefficient(left, variable);
    
    steps.push(`<strong>4. Находим коэффициент при ${variable}:</strong> ${varCoefficient}`);
    
    // РЕШАЕМ УРАВНЕНИЕ
    if (varCoefficient === 0) {
        if (constantValue === rightValue) {
            steps.push(`<strong>5. Решение:</strong> Уравнение верно для любого значения ${variable}`);
            return { steps, solution: `${variable} ∈ ℝ` };
        } else {
            steps.push(`<strong>5. Решение:</strong> Уравнение не имеет решений`);
            return { steps, solution: 'Нет решения' };
        }
    }
    
    let varValue = (rightValue - constantValue) / varCoefficient;
    
    steps.push(`<strong>5. Решаем уравнение:</strong>`);
    steps.push(`&nbsp;&nbsp;${varCoefficient}${variable} + ${constantValue} = ${rightValue}`);
    steps.push(`&nbsp;&nbsp;${varCoefficient}${variable} = ${rightValue} - ${constantValue}`);
    steps.push(`&nbsp;&nbsp;${varCoefficient}${variable} = ${rightValue - constantValue}`);
    steps.push(`&nbsp;&nbsp;${variable} = ${rightValue - constantValue} / ${varCoefficient}`);
    steps.push(`<strong>6. Ответ:</strong> ${variable} = ${varValue}`);
    
    return { steps, solution: varValue };
}

function solveMultiVariableEquation(eq, variables, steps) {
    steps.push(`<strong>2. Обнаружено несколько переменных:</strong> ${variables.join(', ')}`);
    steps.push(`<strong>3. Система уравнений с несколькими переменными:</strong>`);
    
    // Для нескольких переменных предлагаем упростить уравнение
    let [left, right] = eq.split('=');
    
    // Пытаемся выразить одну переменную через другие
    const mainVariable = variables[0];
    steps.push(`&nbsp;&nbsp;Пытаемся выразить ${mainVariable} через другие переменные`);
    
    // Переносим все в одну сторону
    let expression = `(${left}) - (${right})`;
    let simplified = eval(expression.replace(new RegExp(mainVariable, 'gi'), '0'));
    
    // Находим коэффициент при главной переменной
    let mainCoeff = getVariableCoefficient(left, mainVariable) - getVariableCoefficient(right, mainVariable);
    
    if (mainCoeff === 0) {
        steps.push(`<strong>4. Результат:</strong> Уравнение не содержит ${mainVariable}`);
        steps.push(`<strong>5. Упрощенное уравнение:</strong> ${expression} = 0`);
        steps.push(`<strong>6. Ответ:</strong> ${mainVariable} может быть любым, если другие переменные удовлетворяют уравнению`);
        return { steps, solution: `${mainVariable} ∈ ℝ` };
    }
    
    // Выражаем главную переменную
    let otherVars = variables.filter(v => v !== mainVariable);
    let constantPart = simplified;
    
    steps.push(`<strong>4. Выражаем ${mainVariable}:</strong>`);
    steps.push(`&nbsp;&nbsp;${mainCoeff}${mainVariable} + ${constantPart} = 0`);
    steps.push(`&nbsp;&nbsp;${mainCoeff}${mainVariable} = ${-constantPart}`);
    steps.push(`&nbsp;&nbsp;${mainVariable} = ${-constantPart} / ${mainCoeff}`);
    
    let solution = `${mainVariable} = ${-constantPart / mainCoeff}`;
    if (otherVars.length > 0) {
        solution += ` (где ${otherVars.join(', ')} - свободные переменные)`;
    }
    
    steps.push(`<strong>5. Ответ:</strong> ${solution}`);
    
    return { steps, solution: solution };
}

function getVariableCoefficient(expression, variable) {
    let coefficient = 0;
    let varTerms = expression.match(new RegExp(`([-+]?[\\d.]*)${variable}`, 'gi')) || [];
    
    for (let term of varTerms) {
        let coeff = term.replace(new RegExp(variable, 'gi'), '');
        if (coeff === '' || coeff === '+') {
            coefficient += 1;
        } else if (coeff === '-') {
            coefficient -= 1;
        } else {
            coefficient += parseFloat(coeff);
        }
    }
    
    return coefficient;
}

// Проверяем, что функция определена для оффлайн работы
if (typeof solveMathEquation === 'undefined') {
    window.solveMathEquation = solveMathEquation;
}
