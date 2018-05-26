const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: {
    type: String,
    unique: true
  },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
})

module.exports = User