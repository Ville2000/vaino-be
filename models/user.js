const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: String,
  passwordHash: String
})

module.exports = User