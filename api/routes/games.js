const gameRouter = require('express').Router()

const GameController = require('../controllers/game')
const db = require('../db')

gameRouter.route('/').get((req, res) => {
  db('games').then(games => {
    res.status(200).json(games)
  })
})

gameRouter.route('/:gameId').get((req, res) => {
  db('games')
    .where('id', req.params.gameId)
    .then(game => {
      res.status(200).json(game)
    })
})

gameRouter.route('/azul/join').post(async (req, res) => {
  const games = await db('games')
    .select('games.id')
    .where('games.start_time', null)
    .andWhere('games.title', 'azul')
    .join('game_plays', 'games.id', 'game_plays.game_id')
    .havingRaw('count(*) < 4')
    .groupBy('games.id')

  let gameId
  if (games.length === 0) {
    gameId = await GameController.createGame(req.session.userInfo)
  } else {
    gameId = await GameController.joinGame(req.session.userInfo, games[0].id)
  }

  res.status(200).json({ gameId })
})

module.exports = gameRouter
