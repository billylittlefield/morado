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
  let games = await db
    .select({
      gameId: 'raw_game_data.game_id',
      startTime: 'raw_game_data.start_time',
      options: 'raw_game_data.options',
      usernames: db.raw('GROUP_CONCAT(DISTINCT raw_game_data.username ORDER BY username)'),
      userIds: db.raw('GROUP_CONCAT(DISTINCT raw_game_data.user_id ORDER BY username)'),
      latestRound: db.raw('MAX(raw_game_data.round_number)'),
      latestTurn: db.raw('MAX(raw_game_data.turn_number)'),
    })
    .from(
      db
        .select(
          'game_plays.game_id',
          'games.start_time',
          'games.options',
          'game_plays.user_id',
          'users.username',
          'azul_actions.round_number',
          'azul_actions.turn_number'
        )
        .from('games')
        .join('game_plays', 'game_plays.game_id', 'games.id')
        .join('azul_actions', 'games.id', 'azul_actions.game_id')
        .join('users', 'game_plays.user_id', 'users.id')
        .as('raw_game_data')
    )
    .whereIn(
      'raw_game_data.game_id',
      db
        .select('games.id')
        .from('games')
        .join('game_plays', 'game_plays.game_id', 'games.id')
        .where('game_plays.user_id', req.session.userInfo.userId)
    )
    .groupBy('raw_game_data.game_id')

  games = games.map(game => {
    return {
      gameId: game.gameId,
      name: game.name,
      startTime: game.startTime,
      options: JSON.parse(game.options),
      latestRound: game.latestRound,
      latestTurn: game.latestTurn,
      players: _.zipWith(
        game.userIds.split(','),
        game.usernames.split(','),
        (userId, username) => ({
          userId,
          username,
        })
      ),
    }
  })

  res.status(200).json({ games })
})

module.exports = userRouter
