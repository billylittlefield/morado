const db = require('../db')
const _ = require('lodash')

const userRouter = require('express').Router()

userRouter.route('/').get((req, res) => {
  db.select()
    .table('users')
    .then(users => {
      res.status(200).json(users)
    })
})

userRouter.route('/:userId/games').get(async (req, res) => {
  let activeGames = await db
    .select({
      id: 'games.id',
      options: 'games.options',
      startTime: 'games.start_time',
    })
    .from('games')
    .join('game_plays', 'game_plays.game_id', 'games.id')
    .where('game_plays.user_id', req.session.userInfo.userId)

  const userInfoByGameId = _.keyBy(
    await db
      .select({
        gameId: 'game_plays.game_id',
        usernames: db.raw('GROUP_CONCAT(DISTINCT users.username ORDER BY users.username SEPARATOR ", ")'),
        userIds: db.raw('GROUP_CONCAT(DISTINCT users.id ORDER BY users.id SEPARATOR ", ")'),
      })
      .from('game_plays')
      .join('users', 'game_plays.user_id', 'users.id')
      .whereIn('game_plays.game_id', activeGames.map(game => game.id))
      .groupBy('game_plays.game_id'),
    'gameId'
  )

  const roundAndTurnInfoByGameId = _.keyBy(
    await db
      .select({
        gameId: 'game_plays.game_id',
        latestRound: db.raw('MAX(azul_actions.round_number)'),
        latestTurn: db.raw('MAX(azul_actions.turn_number)'),
      })
      .from('game_plays')
      .join('azul_actions', 'game_plays.game_id', 'azul_actions.game_id')
      .whereIn('game_plays.game_id', activeGames.map(game => game.id))
      .groupBy('game_plays.id'),
    'gameId'
  )

  const games = activeGames.map(game => {
    const userInfo = userInfoByGameId[game.id]
    const roundAndTurnInfo = roundAndTurnInfoByGameId[game.id] || {}
    return {
      id: game.id,
      startTime: game.startTime,
      options: JSON.parse(game.options),
      usernames: userInfo.usernames,
      userIds: userInfo.userIds,
      currentRound: roundAndTurnInfo.latestRound || 0,
      currentTurn: roundAndTurnInfo.latestTurn + 1 || 1
    }
  })


  res.status(200).json({ games })
})

module.exports = userRouter
