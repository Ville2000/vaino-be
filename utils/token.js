const jwt = require('jsonwebtoken')

const getDecodedToken = (request) => {
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.substring(7)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    return decodedToken
  }

  return
}

module.exports = getDecodedToken