const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const getDecodedToken = require('../utils/token')

/** User registration endpoint */
usersRouter.post('/', async (req, res) => {
  const body = req.body

  if (!body.username) {
    return res.status(400).json({ error: 'Virheellinen käyttäjänimi.' })
  }

  if (!body.password || body.password.length < 4) {
    return res.status(400).json({ error: 'Salasanan tulee olla vähintään neljä merkkiä pitkä.' })
  }

  const existingUser = await User.find({ username: body.username })

  if (existingUser.length !== 0) {
    return res.status(400).json({ error: 'Käyttäjänimi on jo käytössä.' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    passwordHash,
    games: [],
    friends: []
  })

  const savedUser = await user.save()

  const token = jwt.sign({
    username: savedUser.username,
    id: savedUser._id,
    expiress: new Date(Date.now() + 1000 * 60 * 60 * 3)
  }, process.env.SECRET)

  res.status(200).send({ token, username: user.username })
})

/** List friends */
usersRouter.get('/friends', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  if (!user)
    res.send(404).json({ error: 'User not found'})

  res.send(200).json(user.friends)
})

/** Add friend */
usersRouter.post('/friend', async (req, res) => {
  const decodedToken = await getDecodedToken(req)
  const userToAdd = req.body.username

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  if (!user)
    res.send(404).json({ error: 'User not found'})

  const newFriend = User.findOne({ username: userToAdd })

  if (!newFriend)
    res.send(404).json({ error: 'User not found with given username' })

  user.friends = user.friends.concat({
    username: newFriend.username,
    _id: newFriend._id
  })

  await user.save()

  res.send(200).json({
    username: newFriend.username, _id: newFriend._id
  })
})

/** Remove friend */
usersRouter.delete('/friend/:id', async (req, res) => {
  const decodedToken = await getDecodedToken(req)
  const userToRemove = req.body.userId

  if (!(decodedToken || decodedToken.id))
    res.send(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  if (!user)
    res.send(404).json({ error: 'User not found'})

  user.friends = user.friends.filter(user => user._id != userToRemove)

  await user.save();

  res.send(200)
})

module.exports = usersRouter