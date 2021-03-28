
const COINLIST = require('../coin-list.json')
const axios = require('axios')

const getCoinAddress = async (pairsArr) => {
  try {
    let addressArray = []
    // const [firstCoin, secondCoin] = pairsArr.split(' ')
    for (let coinNum = 0; coinNum < pairsArr.length; coinNum++) {
      let coinObjectFromBase = COINLIST.find(coin => coin.symbol === pairsArr[coinNum].toLowerCase())
      console.log(coinObjectFromBase)
      const coinInfo = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinObjectFromBase.id}`).then(data => data.data)
      addressArray.push(coinInfo.platforms.ethereum)
    }
    return addressArray
  } catch (error) {
    console.log(error)
    return false
  }
}



module.exports = getCoinAddress
