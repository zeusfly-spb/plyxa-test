const ArgumentValidator = require('argument-validator')
const fs = require('fs')

let regions
try {
    regions = JSON.parse(fs.readFileSync('./regions.json'))
} catch (e) {
    throw new Error(`Ошибка чтения списка регионов: ${e}`)
}

const sub = +process.argv[2]
if (!ArgumentValidator.isNumber(sub)) {
    throw new Error('Ошибка! Не указан иди неверный тип SubId')
}

console.log(`Sub is: ${sub}`)