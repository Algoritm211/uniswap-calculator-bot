const {Markup} = require('telegraf')

const mainMenuKeyboard = Markup.keyboard([
  ['🖊️️Set my coins', '💰 My coins'], // Row1 with 1 button
]).oneTime().resize()

const enterKeyboard = Markup.keyboard([
  ['⬅️ Go back'], // Row1 with 1 button
]).oneTime().resize()

module.exports = {
  mainMenuKeyboard,
  enterKeyboard
}
