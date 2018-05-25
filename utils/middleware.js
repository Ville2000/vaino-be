const logger = (req, res, next) => {
  console.log('Method: ', req.method)
  console.log('Path: ', req.path)
  console.log('Body: ', req.body)
  console.log('---')
  next()
}

const error = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

module.exports = {
  logger,
  error
}