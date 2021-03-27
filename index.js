const {Telegraf} = require('telegraf')
require('dotenv').config()
const phrases = require('./phrases.json')
const getCoinAddress = require('./helpers/address-getter')
const getTokenPrice = require('./helpers/price-getter')


const bot = new Telegraf(process.env.BOT_TOKEN)

// Sleep function for imitation of async actions
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Start message
bot.start((ctx) => {
  const userName = ctx.message.chat.first_name
  ctx.reply(`Hello, ${userName}!\n\n ${phrases.startMessage}`, {parse_mode: "HTML"})
})

// Help message
bot.help((ctx) => {
  ctx.reply(`${phrases.helpMessage} \n\n\n ${phrases.authors}`, {parse_mode: 'HTML', disable_web_page_preview: true})
})

//Reaction on text
bot.on('text', async (ctx) => {
  if (ctx.message.text.split(' ').length > 2 || ctx.message.text.split(' ').length < 2) {
    ctx.reply(phrases.errorFormat)
    return
  }
  const {message_id: waitingMessageId} = await ctx.telegram.sendMessage(ctx.message.chat.id, phrases.loading, {parse_mode: 'HTML'})
  const [firstCoin, secondCoin] = ctx.message.text.toLowerCase().split(' ')

  const firstCoinAddress = await getCoinAddress(firstCoin)
  const secondCoinAddress = await getCoinAddress(secondCoin)
  console.log()

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

bot.launch().then(() => console.log('Bot was started'))


// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
