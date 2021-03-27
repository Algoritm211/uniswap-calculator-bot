
const COINLIST = require('../coin-list.json')
const axios = require('axios')

const getCoinAddress = async (coinFromMessage) => {
  try {
    let coinObjectFromBase = COINLIST.find(coin => coin.symbol === coinFromMessage)
    const coinInfo = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinObjectFromBase.id}`).then(data => data.data)
    return coinInfo.platforms.ethereum
  } catch (error) {
    console.log(error)
    return false
  }
}


module.exports = getCoinAddress
