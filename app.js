const fs = require('fs')
const fetch = require('node-fetch')
const axios = require('axios')
const models = require('./models')
const SteamGiftsPrice = models.SteamGiftsPrice

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
    currency = JSON.parse(fs.readFileSync('./currency.json'))
} catch (e) {
    throw new Error(`Ошибка чтения списка валют: ${e}`)
}
const currencyId = curr => {
    let currData = currency.find(item => item.val === curr)
    return currData && currData.id || 0
}

const sub = +process.argv[2]
if (!sub) {
    throw new Error('Ошибка! Не указан или неверный тип SubId')
}

const getData = region => {
    if (region.attempts >= maxAttempts) {
        console.log('Max attempts')
        console.log(region)
        return
    }
    axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=${region.value}`)
        .then(res => storeData(JSON.stringify(res.data), region.value))
        .catch(e => {
            console.error(e)
            region.attempts++
            getData(region)
        })
}

const storeData = (str, code) => {
    const data = JSON.parse(str)
    const params = data[sub].data
    console.log(params)
    try {
        SteamGiftsPrice.create({
            countryCode: code,
            currencyId: currencyId(params.price.currency),
            price: params.price.final,
            priceUsd: params.price.final,
            priceInitial: params.price.initial,
            priceInitialUsd: params.price.initial
        })
    } catch (e) {
        throw new Error(`Ошибка записи данных: ${e}`)
    }
}

regions.forEach(region => getData(region))

