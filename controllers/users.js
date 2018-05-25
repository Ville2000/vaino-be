const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')

usersRouter.get('/', (req, res) => {
  console.log('Getting user');
})

usersRouter.post('/', async (req, res) => {
  const body = req.body
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  
})

module.exports = usersRouter