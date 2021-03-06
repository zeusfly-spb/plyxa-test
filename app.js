const fs = require('fs')
const fetch = require('node-fetch')
const axios = require('axios')
const models = require('./models')
const SteamGiftsPrice = models.SteamGiftsPrice

const maxAttempts = 3
let regions
let currency
let currencyRates

const sub = +process.argv[2]
if (!sub) {
    throw new Error('Ошибка! Не указан или неверный тип SubId')
}

const getRegions = async () => {
    try {
        regions = JSON.parse(fs.readFileSync('./regions.json'))
        regions = regions.map(item => ({value: item, attempts: 0}))
    } catch (e) {
        throw new Error(`Ошибка чтения списка регионов: ${e}`)
    }
}

const getCurrencyList = async () => {
    try {
        currency = JSON.parse(fs.readFileSync('./currency.json'))
    } catch (e) {
        throw new Error(`Ошибка чтения списка валют: ${e}`)
    }
}

const currencyId = curr => {
    let currData = currency.find(item => item.val === curr)
    return currData && currData.id || 0
}

const getCurrencyRates = async () => {
    try {
        const response = await axios.get('https://admseller.plyxa.net/api/currency-rates.php')
        currencyRates = response.data
    } catch (e) {
        throw new Error(`Ошибка получения курсов валют: ${e}`)
    }
}

const getData = region => {
    if (region.attempts >= maxAttempts) {
        return
    }
    axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=${region.value}`)
        .then(res => storeData(JSON.stringify(res.data), region.value))
        .catch(() => {
            region.attempts++
            getData(region)
        })
}

const convertToUsd = (val, currCode) => {
    const rateIndex = `${currCode}USD`
    const rate = +currencyRates[rateIndex] || 0
    return val * rate
}

const storeData = (str, code) => {
    const data = JSON.parse(str)
    const params = data[sub].data
    try {
        SteamGiftsPrice.create({
            countryCode: code,
            currencyId: currencyId(params.price.currency),
            price: params.price.final,
            priceUsd: code === 'US' ? params.price.final : convertToUsd(params.price.final, params.price.currency),
            priceInitial: params.price.initial,
            priceInitialUsd: code === 'US' ? params.price.initial : convertToUsd(params.price.initial, params.price.currency)
        })
    } catch (e) {
        throw new Error(`Ошибка записи данных: ${e}`)
    }
}

const action = async () => {
    await getRegions()
    await getCurrencyList()
    await getCurrencyRates()
    regions.forEach(region => getData(region))
}

action()



