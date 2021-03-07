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

const getEuData = () => {
    const selectMax = (fr, be, de) => {
        let frParams = JSON.parse(fr)[sub].data
        let beParams = JSON.parse(be)[sub].data
        let deParams = JSON.parse(de)[sub].data
        frParams = {...frParams, str: fr}
        beParams = {...beParams, str: be}
        deParams = {...deParams, str: de}
        let euroParams = [frParams, beParams, deParams]
        euroParams.sort((a, b) => a.price.initial > b.price.initial ? -1 : a.price.initial > b.price.initial ? 1 : 0)
        storeData(euroParams[0].str, 'EU')
    }
    const fr = axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=FR`)
    const be = axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=BE`)
    const de = axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=DE`)
    Promise.all([fr, be, de])
        .then(([resFr, resBe, resDe]) => {
            const frStr = JSON.stringify(resFr.data)
            const beStr = JSON.stringify(resBe.data)
            const deStr = JSON.stringify(resDe.data)
            selectMax(frStr, beStr, deStr)
        })
        .catch(e => console.error(e))
}

const getData = region => {
    if (region.attempts >= maxAttempts) {
        return
    }
    if (region.value === 'EU') {
        getEuData()
    } else {
        axios.get(`https://store.steampowered.com/api/packagedetails?packageids=${sub}&cc=${region.value}`)
            .then(res => storeData(JSON.stringify(res.data), region.value))
            .catch(() => {
                region.attempts++
                getData(region)
            })
    }
}

const convertToUsd = (val, currCode) => {
    if (currCode === 'USD') {
        return val
    }
    const rateIndex = `${currCode}USD`
    const rate = +currencyRates[rateIndex] || 0
    return val * rate
}

const storeData = (str, code) => {
    const data = JSON.parse(str)
    const params = data[sub].data
    try {
        SteamGiftsPrice.create({
            subId: sub,
            countryCode: code,
            currencyId: currencyId(params.price.currency),
            price: params.price.final,
            priceUsd: convertToUsd(params.price.final, params.price.currency),
            priceInitial: params.price.initial,
            priceInitialUsd: convertToUsd(params.price.initial, params.price.currency)
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



