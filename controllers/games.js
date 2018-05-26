const gamesRouter = require('express').Router()
const Game = require('../models/game')
const User = require('../models/user')
const getDecodedToken = require('../utils/token')

gamesRouter.post('/', async (req, res) => {
  const decodedToken = getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  const game = new Game({
    beginTime: new Date(),
    endTime: null,
    createdBy: user._id,
    players: [user._id],
  })

  const savedGame = await game.save()

  user.games = user.games.concat(savedGame._id)
  await user.save()

  res.status(200).json(savedGame)
})

module.exports = gamesRouter