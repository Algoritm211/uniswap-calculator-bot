const {Schema, model, ObjectId} = require('mongoose')

const User = new Schema({
  userId: String,
  favouriteCoins: String,
  name: String,
  date: {type: Date, default: Date.now()},
})


module.exports = model('User', User)
