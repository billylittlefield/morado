const gameplayRouter = require('express').Router()
const GameController = require('../controllers/game')

gameplayRouter.route('/').post(async (req, res) => {
  let { gameId, userId } = req.body
  if (req.session.userInfo.userId !== userId) {
    res.status(401).end()
  }
  await GameController.createGamePlay(gameId, userId)

  res.status(200).json({ gameId })
})

module.exports = gameplayRouter
