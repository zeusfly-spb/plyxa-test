const fs = require('fs')
const fetch = require('node-fetch')

const maxAttempts = 3

let regions
try {
    regions = JSON.parse(fs.readFileSync('./regions.json'))
} catch (e) {
    throw new Error(`Ошибка чтения списка регионов: ${e}`)
}
regions = regions.map(item => ({value: item, attempts: 0}))

let currency
try {
    currency = JSON.parse(fs.readFileSync('./regions.json'))
} catch (e) {
    throw new Error(`Ошибка чтения списка валют: ${e}`)
}

const sub = +process.argv[2]
if (!sub) {
    throw new Error('Ошибка! Не указан или неверный тип SubId')
}

const getData = region => {
    if (region.attempts >= maxAttempts) {
        return
    }
    fetch(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=${region.value}`)
        .then(res => res.json())
        .then(json => storeData(json[sub]))
        .catch(() => {
            region.attempts++
            getData(region)
        })
}

const storeData = (data) => {
    console.log(data)
}

regions.forEach(region => {
    getData(region)
})

