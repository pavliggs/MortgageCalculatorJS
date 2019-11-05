const CREDIT_MIN = 0;
const CREDIT_MAX = 15000000;

const FIRST_CONTRIBUTION_MIN = 0;
const FIRST_CONTRIBUTION_MAX = 7500000;

const RETURN_PERIOD_MIN = 1;
const RETURN_PERIOD_MAX = 30;

const creditText = document.querySelector('#creditText');
const creditRange = document.querySelector('#creditRange');

const firstContributionText = document.querySelector('#firstContributionText');
const firstContributionRange = document.querySelector('#firstContributionRange');

const returnPeriodText = document.querySelector('#returnPeriodText');
const returnPeriodRange = document.querySelector('#returnPeriodRange');

// эта переменная отвечает за формат ввода числа
const formatterNumber = new Intl.NumberFormat('ru');
// формат показа валюты (добавляется символ рубля)
const formatterCurrency = new Intl.NumberFormat('ru', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
});
// подставляет нужное окончание в зависимости от значения
const formatterYear = value => `${value} ${substituteTheEnding(value, ['лет', 'год', 'года'])}`;
function substituteTheEnding(value, ending) {
    let num1 = value % 100;
    let num2 = value % 10;

    if (num1 >= 5 && num1 <= 20) {
        return ending[0];
    }
    if (num2 == 1) {
        return ending[1];
    }
    if (num2 >= 2 && num2 <= 4) {
        return ending[2];
    }
    return ending[0];
}

/* 
    Стоимость недвижимости
*/

setAllDependencies(
    creditText,
    creditRange,
    CREDIT_MIN,
    CREDIT_MAX,
    formatterCurrency.format
);

/* 
    Первоначальный взнос (по аналогии)
*/

setAllDependencies(
    firstContributionText,
    firstContributionRange,
    FIRST_CONTRIBUTION_MIN,
    FIRST_CONTRIBUTION_MAX,
    formatterCurrency.format
);

/* 
    Срок кредита
*/

setAllDependencies(
    returnPeriodText,
    returnPeriodRange,
    RETURN_PERIOD_MIN,
    RETURN_PERIOD_MAX,
    formatterYear
);

setReaction(
    creditText,
    creditRange,
    firstContributionText,
    firstContributionRange,
    returnPeriodText,
    returnPeriodRange,
    mainProcess
);

mainProcess();

// универсальная функция, подходящая под все элементы
function setAllDependencies(textElement, rangeElement, min, max, formatter) {
    // вычисляем середину
    const middle = (min + max) / 2;

    // добавляет аттрибуты тегов через js
    rangeElement.setAttribute('min', min);
    rangeElement.setAttribute('max', max);

    // значения по умолчанию будут равны середине
    textElement.value = formatter(parseInt(middle));
    rangeElement.value = middle;

    textElement.addEventListener('input', function(e) {
        let number ='';
        
        /* при вводе в это поле будут считаться только только цифры,
        остальные символы будут игнорироваться */
        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
    
        number = parseInt(number);
    
        if (number < min) {
            number = min;
        }
    
        // это условие не даст ввести число больше CREDIT_MAX
        if (number > max) {
            number = max;
        }
    
        // при изменении числа в поле ввода ползунок принимает соответствующее положение
        rangeElement.value = number;
    
        // форматируем введённые цифры, чтобы на выходе получить красивую структуру числа
        number = formatterNumber.format(number);
        this.value = number;
    });
    
    // при убирании фокуса с поля ввода к введённому числу добавится символ рубля ₽
    textElement.addEventListener('blur', function(e) {
        let number ='';
        
        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
    
        number = parseInt(number);
        this.value = formatter(number);
    });
    
    // при фокусе убираем символ рубля ₽
    textElement.addEventListener('focus', function(e) {
        let number ='';
        
        for (const letter of this.value) {
            if ('0123456789'.includes(letter)) {
                number += letter;
            }
        }
    
        number = parseInt(number);
        this.value = formatterNumber.format(number);
    });
    
    // при изменении положения ползунка меняется число в поле ввода
    rangeElement.addEventListener('input', function(e) {
        textElement.value = formatter(parseInt(this.value));
    });
}

function setReaction(...args) {
    // присваиваем переменной последний элемент в массиве и удаляем его
    const handler = args.splice(-1)[0];
    
    /* перебор элементов массива уже без элемента handler и навешиваем 
    функцию handler на каждый элемент */
    for (const element of args) {
        element.addEventListener('input', handler);
    }
}

// при изменениях стоимости недвижимости и т.д. меняются значения выплат и т.д.
function mainProcess() {
    const credit = parseInt(creditRange.value);
    const firstContribution = parseInt(firstContributionRange.value);
    const returnPeriod = parseInt(returnPeriodRange.value);

    // при изменении срока кредита - меняется процентная ставка
    let percent = 10 + Math.log(returnPeriod) / Math.log(0.5);
    // уменьшаем количество цифр после запятой до двух максимум
    percent = parseInt(percent * 100 + 1) / 100;
    document.querySelector('#percentNumber').value = `${percent} %`;

    // высчитывается общая выплата (формула неверная)
    let commonDebit = (credit - firstContribution) * (1 + percent / 100)**returnPeriod;
    document.querySelector('#common').textContent = formatterCurrency.format(commonDebit);

    // переплата
    let subpayment = commonDebit - (credit - firstContribution);
    document.querySelector('#subpayment').textContent = formatterCurrency.format(subpayment);

    // выплата в месяц
    let payment = subpayment / (returnPeriod * 12);
    document.querySelector('#payment').textContent = formatterCurrency.format(payment);
}