import db from 'db'
import _ from 'lodash'

import AzulHelpers from '@shared/azul/helpers'
import { shuffle } from '@shared/util'
import { REQUIRED_ORDER, TILE_TRANSFER, FACTORY_REFILL, TILE_DUMP } from '@shared/azul/game-invariants'

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
      startTime: 'games.start_time',
      options: 'games.options',
    })
    .from('games')
    .leftJoin('game_plays', 'games.id', 'game_plays.game_id')
    .leftJoin('users', 'game_plays.user_id', 'users.id')
    .leftJoin('azul_actions', 'games.id', 'azul_actions.game_id')
    .whereIn('games.id', gameIds)
    .groupBy('games.id')
    .orderBy('games.id', 'desc')

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

async function startGameIfFull(gameId) {
  const gameSize = parseInt(
    (await db('games')
      .select({
        gameSize: db.raw('json_extract(games.options, "$.numPlayers")'),
      })
      .where('games.id', gameId))[0].gameSize
  )

  const numPlayers = (await db('game_plays')
    .count('user_id as numPlayers')
    .where('game_id', gameId))[0].numPlayers

  if (gameSize === numPlayers) {
    const initialFactoryRefills = AzulHelpers.generateInitialFactoryRefills(gameSize)
    await saveAndApplyActions(gameId, initialFactoryRefills)
    await db('games')
      .where('games.id', gameId)
      .update('start_time', new Date())
  }
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
  const currentState = AzulHelpers.applyGameActions(initialState, { payload: gameActions })
  return currentState
}

async function saveAndApplyActions(gameId, gameActions, gameState = null) {
  if (gameState === null) {
    gameState = await getGameState(gameId)
  }
  const updatedState = await AzulHelpers.applyGameActions(gameState, { payload: gameActions })

  await db('azul_actions').insert(
    gameActions.map(action => ({
      game_id: gameId,
      type: action.type,
      round_number: action.roundNumber,
      turn_number: action.turnNumber,
      params: JSON.stringify(action.params),
    }))
  )

  return updatedState
}

function isRoundOver(gameState) {
  const { tableTiles, factories } = gameState
  return tableTiles.length === 0 && factories.every(f => f.length === 0)
}

async function incrementRound(gameId) {
  await db('games')
    .where('id', gameId)
    .increment('current_round_number', 1)
}

function generateTileDump(gameState) {
  return {
    type: TILE_DUMP,
    roundNumber: gameState.currentRoundNumber,
  }
}

function generateFactoryRefills(gameState) {
  let shuffledTiles = shuffle(_.cloneDeep(gameState.discardTiles)).concat(
    shuffle(_.cloneDeep(gameState.freshTiles))
  )

  return gameState.factories.map((factory, factoryIndex) => {
    let factoryTiles = []
    while (factoryTiles.length < 4) {
      if (shuffledTiles.length > 0) {
        factoryTiles.push(shuffledTiles.pop())
      } else {
        break
      }
    }

    return {
      type: FACTORY_REFILL,
      roundNumber: gameState.currentRoundNumber + 1,
      turnNumber: null,
      params: {
        factoryIndex,
        factoryCode: AzulHelpers.createFactoryCodeFromTiles(factoryTiles),
      },
    }
  })
}

function generateTileTransfers(gameState) {
  const { useColorTemplate } = gameState.options
  let tileTransfers = []
  // For every player
  gameState.players.forEach(player => {
    // Look at their staging rows
    player.stagingRows.forEach((stagingRow, rowIndex) => {
      // Only look at full staging rows:
      if (stagingRow.rowSize !== stagingRow.tiles.filter(t => t !== null).length) {
        return
      }

      // Double check that all the tiles are the same color
      const tileColor = stagingRow.tiles[0]
      if (!stagingRow.tiles.every(t => t === tileColor)) {
        throw new Error('Staging row should only contain 1 color of tile')
      }

      // Double check that the corresponding final row doesn't already have this tile
      if (player.finalRows[rowIndex].tiles.includes(tileColor)) {
        throw new Error('Final row already contains this color')
      }

      // If using the color template, the column index is predefined
      if (useColorTemplate) {
        const columnIndex = REQUIRED_ORDER[rowIndex].indexOf(tileColor)
        tileTransfers.push({
          type: TILE_TRANSFER,
          roundNumber: gameState.currentRoundNumber,
          params: { seatIndex: player.seatIndex, rowIndex, columnIndex, tileColor },
        })
      } else {
        // If not using the template, identify all possible column indices given the current state
        // of final rows on this players board
        const possibleColumnIndices = [0, 1, 2, 3, 4].filter(columnIndex => {
          return (
            player.finalRows.every(r => r.tiles[columnIndex] !== tileColor) &&
            stagingRow[columnIndex] === null
          )
        })
        if (possibleColumnIndices.length === 1) {
          const columnIndex = possibleColumnIndices[0]
          tileTransfers.push({
            type: TILE_TRANSFER,
            roundNumber: gameState.currentRoundNumber,
            params: { seatIndex: player.seatIndex, rowIndex, columnIndex, tileColor },
          })
        }
      }
    })
  })

  return tileTransfers
}

export default {
  createGame,
  createGamePlay,
  fetchGames,
  fetchGamesByUserId,
  startGameIfFull,
  getGameState,
  saveAndApplyActions,
  isRoundOver,
  generateTileTransfers,
  generateFactoryRefills,
  incrementRound,
  generateTileDump,
}
