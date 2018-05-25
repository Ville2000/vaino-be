const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const middleware = require('./utils/middleware')
const usersRouter = require('./controllers/users')


app.use(cors())

app.use(bodyParser.json())
app.use(middleware.logger)

app.use('/api/users', usersRouter)

app.use(middleware.error)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

