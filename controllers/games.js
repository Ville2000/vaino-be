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
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const isCreator = game.createdBy == decodedToken.id

  if (!isCreator)
    res.send(401).json({ error: 'Not authorized' })

  const playerToAdd = await User.findOne({ username: playerUsername })

  if (!playerToAdd)
    res.send(404).json({ error: 'Player not found' })

  if (!game.players)
    game.players = []

  game.players = game.players.concat({
    _id: playerToAdd._id,
    username: playerToAdd.username
  })

  await game.save()

  if (!playerToAdd.games)
    playerToAdd.games = []

  playerToAdd.games = playerToAdd.games.concat(game._id)

  await playerToAdd.save()

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

// TODO: Not tested
/** Accept invitation */
gamesRouter.put('/:id/accept', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const player = game.players.find(player => player._id == decodedToken.id)

  if (!player)
    res.send(404).json({ error: 'Player not found' })

  player.accepted = true

  const user = await User.findById(decodedToken.id)

  if (!user)
    res.send(404).json({ error: 'User not found'})

  if (!user.games)
    user.games = []

  user.games.concat(game._id)

  await user.save()

  await game.save()

  res.status(200)
})

// TODO: Not tested
/** Refuse invitation */
gamesRouter.put('/:id/refuse', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const filteredPlayers = game.players.filter(player => player._id != decodedToken.id)

  game.players = filteredPlayers

  await game.save()

  res.status(200)
})

// TODO:
/** Add points to round */
gamesRouter.post('/:id/points', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const player = game.players.find(player => player._id == decodedToken.id)
  
})

// TODO:
/** Update points of round */
gamesRouter.put('/:id/points', async (req, res) => {
  
})

// TODO: Not tested
/** Leave/end (leave if not creator, end if creator) game */
gamesRouter.put('/:id/refuse', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.send(404).json({ error: 'Game not found' })

  const isCreator = game.createdBy == decodedToken.id

  if (isCreator) {
    const players = game.players

    for (const player of players) {
      const user = await User.findById(player._id)
      user.games = user.games.filter(gameId => gameId != game._id)
      user.save()
    }

    await Game.deleteOne({ _id: game._id })
  } else {
    const user = await User.findById(decodedToken.id)
    user.games = user.games.filter(gameId => gameId != game._id)
    user.save()

    const filteredPlayers = game.players.filter(player => player._id != decodedToken.id)

    game.players = filteredPlayers

    await game.save()
  }

  res.status(200)
})

// TODO:
/** List games */

module.exports = gamesRouter