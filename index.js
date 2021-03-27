const {Telegraf} = require('telegraf')
require('dotenv').config()
const phrases = require('./phrases.json')


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
  const {message_id: waitingMessageId} = await ctx.telegram.sendMessage(ctx.message.chat.id, phrases.loading, {parse_mode: 'HTML'})
  await sleep(3000)
  const mockText = '1 BTC = $60 000'
  await ctx.telegram.editMessageText(
    ctx.message.chat.id,
    waitingMessageId,
    null,
    mockText
  )
})

bot.launch().then(() => console.log('Bot was started'))

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
