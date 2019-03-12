import express from 'express'

import GameController from 'controllers/game'

const gameRouter = express.Router()

gameRouter.route('/available').get(async (req, res) => {
  const games = await GameController.fetchGames({ isStarted: false, isFull: false })
  const filteredGames = games.filter(game => {
    return !game.userIds.includes(req.session.userInfo.userId)
  })

  res.status(200).json({ games: filteredGames })
})

gameRouter.route('/').post(async (req, res) => {
  const options = req.body
  const gameId = await GameController.createGame(options)
  await GameController.createGamePlay(gameId, req.session.userInfo.userId, 0)

  res
    .status(200)
    .json({
      gameId,
      usernames: [req.session.userInfo.username],
      userIds: [req.session.userInfo.userId],
      latestRound: null,
      latestTurn: null,
      startTime: null,
      options
    })
})

gameRouter.route('/azul/:gameId').get(async (req, res) => {
  const gameId = req.params.gameId
  const gameState = await GameController.getGameState(gameId)

  res.status(200).json({ gameId, gameState, gameType: 'azul' })
})

export default gameRouter
