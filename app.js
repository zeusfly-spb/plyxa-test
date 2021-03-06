const ArgumentValidator = require('argument-validator')
const fs = require('fs')
const fetch = require('node-fetch')

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

regions.forEach(region => {
    console.log(region)
})
fetch('https://store.steampowered.com/api/packagedetails?packageids=307391&cc=UK')
    .then(res => res.json())
    .then(json => result = json)