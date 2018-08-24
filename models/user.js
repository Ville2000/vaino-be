const mongoose = require('mongoose')

const User = mongoose.model('User', {
  username: {
    type: String,
    unique: true
  },
  passwordHash: String,
  createdAt: { type: Date, default: Date.now },
  friends: [{
    _id: {
      type: String
    },
    username: {
      type: String
    }
  }],
  games: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }]
})

module.exports = User