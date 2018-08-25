const mongoose = require('mongoose')

const Game = mongoose.model('Game', {
  beginTime: Date,
  endTime: Date,
  createdBy: {
    _id: { type: String },
    username: { type: String }
  },
  players: [
    {
      _id: {
        type: String
      },
      invAccepted: {
        type: Boolean
      }
    }
  ],
  rounds: [
    {
      round_type: {
        type: String,
        enum: ['2x3', 'S&3', '2xS', '3x3', '2x3&S', '2xS&3', '3xS']
      },
      scores: [{
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        score: Number
      }]
    }
  ]
})

module.exports = Game