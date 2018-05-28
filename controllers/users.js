const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

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
    passwordHash
  })

  const savedUser = await user.save()

  const token = jwt.sign({
    username: savedUser.username,
    id: savedUser._id,
    expiress: new Date(Date.now() + 1000 * 60 * 60 * 3)
  }, process.env.SECRET)

  res.status(200).send({ token, username: user.username })
})

module.exports = usersRouter