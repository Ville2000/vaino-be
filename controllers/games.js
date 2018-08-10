const gamesRouter = require('express').Router()
const Game = require('../models/game')
const User = require('../models/user')
const getDecodedToken = require('../utils/token')

/** Create a new game */
gamesRouter.post('/', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

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

/** Add a player to a game */
gamesRouter.put('/:id/addPlayer', async (req, res) => {
  const gameId = req.params.id
  const playerUsername = req.body.username
  console.log('playerUsername', playerUsername)
  
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const isCreator = game.createdBy == decodedToken.id

  if (!isCreator)
    res.send(401).json({ error: 'Not authorized' })

  // TODO: Lisää pelaaja pelaajalistaan
  // game.players = game.players.concat(player)
  
  res.send(200)
})

/** Get game by id */
gamesRouter.get('/:id', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const includesPlayer = game.players.some(player => player == decodedToken.id)

  if (!includesPlayer)
    res.send(401).json({ error: 'Not authorized.' })

  res.status(200).json(game)
})

module.exports = gamesRouter