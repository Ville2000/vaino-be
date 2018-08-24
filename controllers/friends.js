const friendsRouter = require('express').Router()
const User = require('../models/user')
const getDecodedToken = require('../utils/token')

friendsRouter.get('/', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  if (!user) res.status(404).json({ error: 'Authorization error ' })

  let friends = user.friends

  if (friends && friends.length > 0) {
    friends = user.friends.map(friend => ({
      _id: friend._id,
      username: friend.username
    }))
  }

  return res.status(200).json(friends)
})

friendsRouter.post('/', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  const friendUsername = req.body.username

  const friend = await User.findOne({ username: friendUsername })

  if (!friend)
    return res.status(404).json({ error: 'Kaveria ei löytynyt' })

  const friendToAdd = {
    _id: friend._id,
    username: friend.username
  }

  if (user.friends && user.friends.length > 0 && user.friends.some(f => f._id == friend._id))
    return res.status(400).json({ error: 'Kaveri on jo listallasi' })

  user.friends = user.friends.concat({
    _id: friend._id,
    username: friend.username
  })

  await user.save()

  const formattedFriends = user.friends.map(f => ({
    _id: f._id,
    username: f.username
  }))

  return res.status(200).json(formattedFriends)
})

friendsRouter.delete('/:id', async (req, res) => {
  const decodedToken = await getDecodedToken(req)

  if (!(decodedToken || decodedToken.id))
    res.status(401).json({ error: 'Authorization token missing or invalid.' })

  const user = await User.findById(decodedToken.id)

  const friendId = req.params.id

  user.friends = user.friends.filter(friend => friend._id != friendId)

  await user.save()


  return res.status(200).json(user.friends)
})

module.exports = friendsRouter