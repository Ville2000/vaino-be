const mongoose = require('mongoose')

const Game = mongoose.model('Game', {
  beginTime: Date,
  endTime: Date,
  createdBy: {
    _id: { type: String },
    username: { type: String }
  },
  started: {
    type: Boolean,
    default: false
  },
  players: [
    {
      _id: {
        type: String
      },
      invAccepted: {
        type: Boolean
      },
      username: {
        type: String
      }
    }
  ],
  currentRound: {
    type: Number,
    default: 1
  },
  scores: [
    {
      player: {
        type: String
      },
      round: {
        type: Number
      },
      points: {
        type: Number
      }
    }
  ]
})

module.exports = Game