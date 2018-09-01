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
    createdBy: {
      _id: user._id,
      username: user.username
    },
    players: [],
  })

  game.players = game.players.concat(
    {
      _id: user._id,
      username: user.username,
      invAccepted: true
    }
  )

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
    return res.status(401).json({ error: 'Tunnistus epäonnistui. Kirjaudu sisään uudestaan' })

  const game = await Game.findById(gameId)
  
  if (!game)
    return res.status(404).json({ error: 'Peliä ei löytynyt tällä id:llä' })

  const isCreator = game.createdBy._id == decodedToken.id

  if (!isCreator)
    return res.status(401).json({ error: 'Sinulla ei ole oikeutta lisätä pelaajaa' })

  const playerToAdd = await User.findOne({ username: playerUsername })

  if (!playerToAdd)
    return res.status(404).json({ error: 'Player not found' })

  if (!game.players)
    game.players = []

  if (game.players.find(player => player.username === playerToAdd.username))
    return res.status(400).json({ error: 'Pelaaja on jo pelissä' })

  game.players = game.players.concat({
    _id: playerToAdd._id,
    username: playerToAdd.username,
    invAccepted: false
  })

  await game.save()

  return res.status(200).json(game)
})

/** Poll games that have invitation pending */
gamesRouter.get('/invitedTo', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findOne({ _id: decodedToken.id })
  
  if (!user)
    res.status(404).json({ error: 'Tunnistautuminen epäonnistui. Kirjaudu uudelleen sisään' })

  const games = await Game.find({
    players: {
      _id: user._id,
      username: user.username,
      invAccepted: false
    }
  })

  return res.status(200).json(games)
})

/** Get game by id */
gamesRouter.get('/:id', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    return res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    return res.status(404).json({ error: 'Game not found' })

  const includesPlayer = game.players.some(player => player._id == decodedToken.id)

  if (!includesPlayer)
    return res.status(401).json({ error: 'Not authorized.' })

  return res.status(200).json(game)
})

// TODO: Not tested
/** Accept invitation */
gamesRouter.put('/:id/accept', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    return res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    return res.status(404).json({ error: 'Game not found' })

  const player = game.players.find(player => player._id == decodedToken.id)

  if (!player)
    return res.status(404).json({ error: 'Player not found' })

  player.invAccepted = true

  const user = await User.findById(decodedToken.id)

  if (!user)
    return res.status(404).json({ error: 'User not found'})

  if (!user.games)
    user.games = []

  user.games = user.games.concat(game._id)

  await user.save()

  await game.save()

  console.log('Alles ist gut')

  return res.sendStatus(200)
})

// TODO: Not tested
/** Deny invitation */
gamesRouter.put('/:id/deny', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    return res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    return res.status(404).json({ error: 'Game not found' })

  const filteredPlayers = game.players.filter(player => player._id != decodedToken.id)

  game.players = filteredPlayers

  await game.save()

  return res.sendStatus(200)
})

// TODO: Not tested
/** Leave/end (leave if not creator, end if creator) game */
gamesRouter.put('/:id/leave', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    return res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    return res.status(404).json({ error: 'Game not found' })

  const isCreator = game.createdBy._id == decodedToken.id

  if (isCreator) {
    const players = game.players

    for (const player of players) {
      const user = await User.findById(player._id)
      user.games = user.games.filter(gameId => gameId != game._id)
      user.save()
    }

    await Game.findByIdAndRemove({ _id: game._id })

    return res.sendStatus(200)
  } else {
    const user = await User.findById(decodedToken.id)
    user.games = user.games.filter(gameId => gameId != game._id)
    user.save()

    const filteredPlayers = game.players.filter(player => player._id != decodedToken.id)

    game.players = filteredPlayers

    await game.save()

    return res.sendStatus(200)
  }
})

/** Add points to round */
gamesRouter.post('/:id/points/:round', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const gameId = req.params.id
  const game = await Game.findById(gameId)

  if (!game)
    res.status(404).json({ error: 'Game not found' })

  const player = game.players.find(player => player._id == decodedToken.id)

  if (!player)
    res.status(404).json({ error: 'Pelaajaa ei löydy pelistä' })
  
  const round = req.params.round
  const points = req.body.points

  if (!round || !points || round < 1 || round > 7)
    res.status(400).json({ error: 'Virhe kierroksessa tai pisteissä' })

  const score = game.scores.find(score => (score.player == decodedToken.id && score.round == round))

  if (score) {
    score.points = points
  } else {
    game.scores = game.scores.concat({
      player: player._id,
      round,
      points
    })
  }

  await game.save()

  res.sendStatus(200)
})

/** List games */
gamesRouter.get('/', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    return res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findOne({ _id: decodedToken.id })

  if (!user)
    return res.status(404).json({ error: 'Virhe tunnistautumisessa. Kirjaudu sisään uudelleen' })

  const games = await Game.find({
    players: {
      _id: user._id,
      username: user.username,
      invAccepted: true
    }
  }).sort({ beginTime: 1})

  return res.status(200).json(games)
})

// TODO: Points by round

// TODO: Start game

module.exports = gamesRouter