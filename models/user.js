const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = User