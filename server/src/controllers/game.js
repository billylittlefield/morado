import db from 'db'
import _ from 'lodash'

import AzulHelpers from '@shared/azul/helpers'

async function createGame(options) {
  const gameId = (await db('games').insert({
    options: JSON.stringify(options),
  }))[0]

  return gameId
}

async function createGamePlay(gameId, userId, seatIndex) {
  if (!seatIndex) {
    const playerCountQuery = await db('game_plays')
      .count({ numPlayers: 'user_id' })
      .where('game_plays.game_id', gameId)
      .groupBy('game_plays.game_id')
    seatIndex = playerCountQuery.length > 0 ? playerCountQuery[0].numPlayers : 0
  }
  await db('game_plays').insert({
    game_id: gameId,
    user_id: userId,
    seat_index: seatIndex,
  })
}

async function fetchGames({ isStarted, isFull }) {
  let query = db('games')
    .select({
      gameId: 'games.id',
      numPlayers: db.raw('count(game_plays.user_id)'),
      maxPlayers: db.raw('json_extract(games.options, "$.numPlayers")'),
    })
    .leftJoin('game_plays', 'games.id', 'game_plays.game_id')

  if (isStarted) {
    query.whereNotNull('games.start_time')
  } else {
    query.whereNull('games.start_time')
  }

  let games = await query.groupBy('games.id')
  let filteredGames = games.filter(game => {
    return isFull ? game.numPlayers === game.maxPlayers : game.numPlayers < game.maxPlayers
  })

  return fetchGamesByIds(_.map(filteredGames, 'gameId'))
}

async function fetchGamesByUserId(userId) {
  const activeGameIds = _.map(
    await db
      .select({ gameId: 'games.id' })
      .from('games')
      .join('game_plays', 'game_plays.game_id', 'games.id')
      .where('game_plays.user_id', userId),
    'gameId'
  )

  return fetchGamesByIds(activeGameIds)
}

async function fetchGamesByIds(gameIds) {
  let games = db
    .select({
      gameId: 'games.id',
      usernames: db.raw(
        'GROUP_CONCAT(DISTINCT users.username ORDER BY users.username SEPARATOR ",")'
      ),
      userIds: db.raw('GROUP_CONCAT(DISTINCT users.id ORDER BY users.id SEPARATOR ",")'),
      latestRound: db.raw('MAX(azul_actions.round_number)'),
      latestTurn: db.raw('MAX(azul_actions.turn_number)'),
      startTime: 'games.start_time',
      options: 'games.options',
    })
    .from('games')
    .leftJoin('game_plays', 'games.id', 'game_plays.game_id')
    .leftJoin('users', 'game_plays.user_id', 'users.id')
    .leftJoin('azul_actions', 'games.id', 'azul_actions.game_id')
    .whereIn('games.id', gameIds)
    .groupBy('games.id')

  return games.map(game => {
    const usernames = game.usernames ? game.usernames.split(',') : []
    const userIds = game.userIds ? game.userIds.split(',').map(Number) : []
    return {
      ...game,
      options: JSON.parse(game.options),
      usernames,
      userIds,
    }
  })
}

async function getGameState(gameId) {
  const game = (await db
    .table('games')
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
        type: action.type,
        roundNumber: action.round_number,
        turnNumber: action.turn_number,
        params: JSON.parse(action.params),
      }
    })

  const initialState = AzulHelpers.getInitialGameState(players, game.options)
  const currentState = AzulHelpers.applyActions(initialState, gameActions)

  return currentState
}

async function applyAction(gameId, gameAction) {
  let currentState = await getGameState(gameId)
  currentState = await AzulHelpers.applyActions(currentState, [gameAction])

  await db('azul_actions').insert({
    game_id: gameId,
    type: gameAction.type,
    round_number: gameAction.roundNumber,
    turn_number: gameAction.turnNumber,
    params: JSON.stringify(gameAction.params),
  })
  return currentState
}

export default {
  createGame,
  createGamePlay,
  fetchGames,
  fetchGamesByUserId,
  getGameState,
  applyAction,
}
