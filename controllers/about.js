const aboutRouter = require('express').Router()

aboutRouter.get('/', async (req, res) => {
  res.status(200).json([
    {
      title: 'Väinö?',
      imgSrc: '',
      content: 'Väinö on korttipeli!'
    },
    {
      title: 'Pelin aloittaminen',
      imgSrc: '',
      content: 'Jaa kortit'
    },
    {
      title: 'Pelin voittaminen',
      imgSrc: '',
      content: 'Kerää vähiten pisteitä'
    }
  ])
})

module.exports = aboutRouter