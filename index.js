const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')
const mongoose = require('mongoose')
const url = 'mongodb://vaino-db:89Alligaattori@ds125388.mlab.com:25388/vaino'

mongoose.connect(url)

app.use(cors())

app.use(bodyParser.json())
app.use(middleware.logger)

app.use('/api/users', usersRouter)

app.use(middleware.error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

