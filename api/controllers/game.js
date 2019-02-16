const db = require('../db')
const AzulHelpers = require('../../shared/azul/helpers')

/**
 * General matchmaking. Perform the following actions wrapped in a transaction:
 *   - find game where start_time is null, less than 4 players have joined, and the user joining is
 *     not already in the game
 *   - if no game exists, create a new one
 *   - create a game_play record for the game and user
 *   - return the game id
 * @public
 * @returns {Promise}
 * @param {Object} userInfo
 * @param {number} userInfo.userId
 */
function joinAvailableGame(userInfo) {
  const userId = userInfo.userId

  return db.transaction(async trx => {
    const availableGame = await trx('games')
      .first('games.id')
      .whereNotIn(
        'games.id',
        trx('games')
          .select('games.id')
          .leftJoin('game_plays', 'games.id', 'game_plays.game_id')
          .where('game_plays.user_id', userId)
      )
      .andWhere('games.start_time', null)
      .andWhere('games.title', 'azul')
      .leftJoin('game_plays', 'games.id', 'game_plays.game_id')
      .havingRaw('count(game_plays.user_id) < 4')
      .groupBy('games.id')

    let gameIdToJoin
    if (availableGame) {
      gameIdToJoin = availableGame.id
    } else {
      gameIdToJoin = (await trx('games').insert({
        title: 'azul',
        options: JSON.stringify({ numPlayers: 4, useColorTemplate: true }),
      }))[0]
    }

    const seatIndex = (await trx('game_plays').where('game_id', gameIdToJoin)).length
    await trx('game_plays').insert({
      game_id: gameIdToJoin,
      user_id: userId,
      seat_index: seatIndex,
    })

    return gameIdToJoin
  })
}

async function getGameState(gameId) {
  const game = (await db.table('games')
    .where('id', gameId)
    .map(game => {
      return {
        id: game.id,
        options: JSON.parse(game.options),
      }
    }))[0]

  const players = await db('users')
    .select({ userId: 'users.id', username: 'users.username' })
    .join('game_plays', 'users.id', 'game_plays.user_id')
    .where('game_plays.game_id', gameId)

  const gameActions = await db('azul_actions')
    .where('azul_actions.game_id', gameId)
    .orderBy('azul_actions.id')
    .map(action => {
      return {
        type: action.action_type,
        roundNumber: action.round_number,
        turnNumber: action.turn_number,
        params: JSON.parse(action.action_params),
      }
    })

  const initialState = AzulHelpers.getInitialGameState(players, game.options)
  const currentState = AzulHelpers.applyActions(initialState, gameActions)

  return currentState
}

module.exports = {
  joinAvailableGame,
  getGameState,
}
