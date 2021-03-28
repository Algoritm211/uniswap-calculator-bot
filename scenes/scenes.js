const {Scenes} = require('telegraf')
const { Markup } = require('telegraf')
const getCoinAddress = require('../helpers/address-getter')
const User = require('../models/User')
const getTokenPrice = require('../helpers/price-getter')
const {mainMenuKeyboard} = require("../keyboards/keyboards");
const {enterKeyboard} = require("../keyboards/keyboards");



class SceneGenerator {
  setUserFavoritePairsScene = () => {
    const pairs = new Scenes.BaseScene('setPairs')
    pairs.enter(async (ctx) => {
      await ctx.reply('Enter new pairs with a space separated by @.\n\nExample: <code>AAVE BAL@AMP BAL</code>\n\nIt will be equal to pairs AAVE-BAL and AMP-BAL', {parse_mode: 'HTML', reply_markup: enterKeyboard.reply_markup})
    })
    pairs.on('text', async (ctx) => {
      if (ctx.message.text === '⬅️ Go back') {
        ctx.reply('Ok, you are in main menu, you can continue to type prices of tokens', {reply_markup: mainMenuKeyboard.reply_markup})
        ctx.scene.leave()
        return
      }
      const isValid = await pairsValidation(ctx.message.text)
      if (isValid) {
        await ctx.reply('All is valid. Your coins have been recorded in the database')
        const user = await User.findOne({userId: ctx.message.chat.id})
        user.favouriteCoins = JSON.stringify(ctx.message.text.split('@'))
        await user.save()
        // console.log(JSON.stringify(ctx.message.text.split('@')))
      } else {
        await ctx.reply('Entered coins is not valid or don`t exist on Uniswap, try again')
        await ctx.scene.reenter()
      }

    })
    pairs.on('message', async (ctx) => {
      await ctx.reply('It`s not crypto pairs, try again')
      await ctx.scene.reenter()
    })
    return pairs
  }

  getUserFavoritePairsScene = () => {
    const favPairs = new Scenes.BaseScene('favPairs')

    favPairs.enter(async (ctx) => {
      await ctx.reply('<i>We take information of your tokens. Please wait (it usually takes about 20 seconds)</i>', {parse_mode: 'HTML'})
      const user = await User.findOne({userId: ctx.message.chat.id})
      // console.log(JSON.parse(user.favouriteCoins))
      if (JSON.parse(user.favouriteCoins).length > 0) {
        const pairText = await getPairPrices(JSON.parse(user.favouriteCoins))
        await ctx.reply(pairText, {parse_mode: 'HTML', reply_markup: enterKeyboard.reply_markup})
      } else {
        await ctx.reply(`You don't have any favorite tokens yet`, {parse_mode: 'HTML'})
      }
      // await ctx.scene.leave()
    })

    favPairs.on('text', async (ctx) => {
      if (ctx.message.text === '⬅️ Go back') {
        ctx.reply('Ok, you are in main menu, you can continue to type prices of tokens', {reply_markup: mainMenuKeyboard.reply_markup})
        await ctx.scene.leave()
        return
      }
    })

    return favPairs
  }
}


async function pairsValidation(text) {
  const messageText = text.toLowerCase()
  const pairs = messageText.split('@')
  for(let pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
    if (pairs[pairIndex].split(' ').length > 2 || pairs[pairIndex].split(' ').length < 2) {
      return false
    }
    const [firstCoin, secondCoin] = pairs[pairIndex].split(' ')
    const[firstCoinAddress, secondCoinAddress] = await getCoinAddress([firstCoin, secondCoin])
    if (!firstCoinAddress || !secondCoinAddress) {
      return false
    }
  }

  return true
}

//Returns text with prices
async function getPairPrices(pairsArr) {
  let messageText = '<b>The last prices was loaded!📋</b>\n\n'
  for (let pairIndex = 0; pairIndex < pairsArr.length; pairIndex++) {
    const [firstCoin, secondCoin] = pairsArr[pairIndex].split(' ')
    const[firstCoinAddress, secondCoinAddress] = await getCoinAddress([firstCoin, secondCoin])
    const price = await getTokenPrice([firstCoinAddress, secondCoinAddress])
    messageText += `<code>1 ${firstCoin.toUpperCase()} = ${price} ${secondCoin.toUpperCase()}</code>\n`
  }

  messageText += '\n<i>*You can easy copy price</i>'
  return messageText
}


module.exports = SceneGenerator
//AAVE BAL @ AMP BAL
