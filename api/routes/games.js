const gameRouter = require('express').Router()
const GameController = require('../controllers/game')

gameRouter.route('/available').get(async (req, res) => {
  let games = await GameController.fetchGames(false, false)
  let filteredGames = games.filter(game => {
    return !game.userIds.includes(req.session.userInfo.userId)
  })

  res.status(200).json({ games: filteredGames })
})

gameRouter.route('/').post(async (req, res) => {
  let options = req.body
  let gameId = await GameController.createGame(options)
  await GameController.createGamePlay(gameId, req.session.userInfo.userId, 0)

  res.status(200).json({ gameId })
})

module.exports = gameRouter
