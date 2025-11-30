// equation-solver.js - исправленный решатель уравнений

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
    
    // ВЫЧИСЛЯЕМ ПРАВУЮ ЧАСТЬ
    let rightValue = eval(right.replace(new RegExp(variable, 'gi'), '0'));
    steps.push(`<strong>2. Вычисляем правую часть:</strong> ${right} = ${rightValue}`);
    
    // ВЫЧИСЛЯЕМ ЛЕВУЮ ЧАСТЬ БЕЗ ПЕРЕМЕННОЙ (константы)
    let leftWithoutVar = left.replace(new RegExp(variable, 'gi'), '0');
    let constantValue = eval(leftWithoutVar);
    steps.push(`<strong>3. Вычисляем постоянную часть слева:</strong> ${leftWithoutVar} = ${constantValue}`);
    
    // НАХОДИМ КОЭФФИЦИЕНТ ПРИ ПЕРЕМЕННОЙ
    let varCoefficient = 0;
    
    // Ищем все вхождения переменной
    let varTerms = left.match(new RegExp(`([-+]?[\\d.]*)${variable}`, 'gi')) || [];
    
    for (let term of varTerms) {
        let coeff = term.replace(new RegExp(variable, 'gi'), '');
        if (coeff === '' || coeff === '+') {
            varCoefficient += 1;
        } else if (coeff === '-') {
            varCoefficient -= 1;
        } else {
            varCoefficient += parseFloat(coeff);
        }
    }
    
    // Если переменная не найдена в левой части, ищем в правой
    if (varCoefficient === 0) {
        let rightVarTerms = right.match(new RegExp(`([-+]?[\\d.]*)${variable}`, 'gi')) || [];
        for (let term of rightVarTerms) {
            let coeff = term.replace(new RegExp(variable, 'gi'), '');
            if (coeff === '' || coeff === '+') {
                varCoefficient -= 1;
            } else if (coeff === '-') {
                varCoefficient += 1;
            } else {
                varCoefficient -= parseFloat(coeff);
            }
        }
    }
    
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
    steps.push(`&nbsp;&nbsp;${formatTerm(varCoefficient, variable)} + ${constantValue} = ${rightValue}`);
    steps.push(`&nbsp;&nbsp;${formatTerm(varCoefficient, variable)} = ${rightValue} - ${constantValue}`);
    steps.push(`&nbsp;&nbsp;${formatTerm(varCoefficient, variable)} = ${rightValue - constantValue}`);
    steps.push(`&nbsp;&nbsp;${variable} = ${rightValue - constantValue} / ${varCoefficient}`);
    steps.push(`<strong>6. Ответ:</strong> ${variable} = ${varValue}`);
    
    return { steps, solution: varValue };
}

// Вспомогательная функция для форматирования термина
function formatTerm(coefficient, variable) {
    if (coefficient === 1) return variable;
    if (coefficient === -1) return `-${variable}`;
    return `${coefficient}${variable}`;
}

// Проверяем, что функция определена для оффлайн работы
if (typeof solveMathEquation === 'undefined') {
    window.solveMathEquation = solveMathEquation;
}
