require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const gamesRouter = require('./controllers/games')
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

mongoose.connect(url)

app.use(cors())

app.use(bodyParser.json())
app.use(middleware.logger)
app.use(express.static('build'))

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/games', gamesRouter)

app.use(middleware.error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

