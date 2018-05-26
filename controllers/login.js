const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
  const body = req.body
  const user = await User.findOne({ username: body.username })

  const passwordMatch = user === null ?
    false :
    await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordMatch))
    return res.status(400).json({ error: 'Invalid username or password' })

  // Expiress in three hours
  const token = jwt.sign({
    username: user.username,
    id: user._id,
    expiress: new Date(Date.now() + 1000 * 60 * 60 * 3)
  }, process.env.SECRET)

  res.status(200).send({ token, username: user.username })
})

module.exports = loginRouter