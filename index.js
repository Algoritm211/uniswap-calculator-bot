const {Telegraf, Markup, session, Scenes} = require('telegraf')
const mongoose = require('mongoose')
require('dotenv').config()
const phrases = require('./phrases.json')
const getCoinAddress = require('./helpers/address-getter')
const getTokenPrice = require('./helpers/price-getter')
const SceneGenerator = require('./scenes/scenes')
const currentScene = new SceneGenerator()
const setUserCoinsScene = currentScene.setUserFavoritePairsScene()
const getUserCoinsScene = currentScene.getUserFavoritePairsScene()
const User = require('./models/User')


const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Scenes.Stage([setUserCoinsScene, getUserCoinsScene])

bot.use(session())
bot.use(stage.middleware())

const mainMenuKeyboard = Markup.keyboard([
  ['🖊️️Set my coins', '💰 My coins'], // Row1 with 1 button
]).oneTime().resize()

// Start message
bot.start(async (ctx) => {
  const userName = ctx.message.from.first_name
  ctx.reply(`Hello, ${userName}!\n\n ${phrases.startMessage}`, {parse_mode: "HTML", reply_markup: mainMenuKeyboard.reply_markup})
  const isUserExists = !!await User.findOne({userId: ctx.message.chat.id})
  if (!isUserExists) {
    const user = new User({userId: ctx.message.chat.id, name: userName, favouriteCoins: ''})
    await user.save()
  }
})

// Help message
bot.help((ctx) => {
  ctx.reply(`${phrases.helpMessage} \n\n\n ${phrases.authors}`, {parse_mode: 'HTML', disable_web_page_preview: true})
})

//Reaction on text
bot.on('text', async (ctx) => {
  if (ctx.message.text === '💰 My coins') {
    await ctx.scene.enter('favPairs')
    return
  } else if (ctx.message.text === '🖊️️Set my coins') {
    await ctx.scene.enter('setPairs')
    return
  }
  if (ctx.message.text.split(' ').length > 2 || ctx.message.text.split(' ').length < 2) {
    ctx.reply(phrases.errorFormat)
    return
  }
  const {message_id: waitingMessageId} = await ctx.telegram.sendMessage(ctx.message.chat.id, phrases.loading, {parse_mode: 'HTML'})
  const [firstCoin, secondCoin] = ctx.message.text.toLowerCase().split(' ')

  const[firstCoinAddress, secondCoinAddress] = await getCoinAddress([firstCoin, secondCoin])

  if (!firstCoinAddress || !secondCoinAddress) {
    await ctx.telegram.deleteMessage(ctx.message.chat.id, waitingMessageId)
    ctx.reply(phrases.errorTickers)
    return
  }

  const price = await getTokenPrice([firstCoinAddress, secondCoinAddress])

  await ctx.telegram.editMessageText(
    ctx.message.chat.id,
    waitingMessageId,
    null,
    `<b>The last price was loaded!📋</b>\n\n<code>1 ${firstCoin.toUpperCase()} = ${price} ${secondCoin.toUpperCase()}</code>\n\n<i>*You can easy copy price</i>`,
    {parse_mode: 'HTML'}
  )
})

const START = async () => {
  await bot.launch()
  await mongoose
    .connect(process.env.dbURL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false, tls: true })
    .then(() => console.log( 'Database Connected' ))
    .catch(err => console.log( err ));
  console.log('Bot was started')
}

START()



// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
