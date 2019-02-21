const _ = require('lodash')
const { produce } = require('immer')

const {
  FACTORY_REFILL,
  TILE_PULL,
  REQUIRED_ORDER,
  TILE_TRANSFER,
  DROPPED_TILE_PENALTIES,
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
} = require('./game-invariants')

function getInitialGameState(players, options) {
  return {
    options,
    players: players.map((player, index) => {
      return createNewPlayer(player, index, options.useColorTemplate)
    }),
    freshTiles: Array(TILE_COLORS.length * NUM_TILES_OF_COLOR)
      .fill()
      .map((_, index) => {
        return TILE_COLORS[index % TILE_COLORS.length]
      }),
    factories: Array(5)
      .fill()
      .map(() => []),
    discardTiles: [],
    tableTiles: [],
    currentRoundNumber: 0,
    currentTurnNumber: 0,
    firstSeatNextRound: null,
    activeSeatIndex: 0,
    actionHistory: [],
    historyIndex: 0,
  }
}

function createNewPlayer(player, seatIndex, useColorTemplate) {
  return {
    userId: player.userId,
    username: player.username,
    seatIndex,
    stagingRows: Array(5)
      .fill()
      .map((_, index) => {
        return { tiles: Array(index + 1).fill(null), rowSize: index + 1 }
      }),
    finalRows: Array(5)
      .fill()
      .map((_, index) => {
        const requiredOrder = useColorTemplate ? REQUIRED_ORDER[index] : null
        return { tiles: Array(5).fill(null), rowSize: 5, requiredOrder }
      }),
    brokenTiles: Array(DROPPED_TILE_PENALTIES.length).fill(null),
  }
}

function applyActions(state, actions) {
  let newState = _.cloneDeep(state)
  actions.forEach(action => {
    switch (action.type) {
      case FACTORY_REFILL:
        newState = applyFactoryRefill(newState, { payload: action })
        break
      case TILE_PULL:
        newState = applyTilePull(newState, { payload: action })
        break
      case TILE_TRANSFER:
        newState = applyTileTransfer(newState, { payload: action })
        break
      default:
        throw new Error('Unrecognized Azul action type')
    }
  })
  return newState
}

function applyFactoryRefill(state, action) {
  const { roundNumber, turnNumber, params } = action.payload

  return produce(state, draft => {
    const tiles = parseTilesFromFactoryCode(params.factoryCode)

    if (draft.factories[params.factoryIndex].length !== 0) {
      throw new Error('factory must be empty before refilling')
    }
    tiles.forEach(tile => {
      let freshTileIndex = draft.freshTiles.findIndex(t => t === tile)
      if (freshTileIndex === -1) {
        if (draft.freshTiles.length !== 0) {
          throw new Error('tile bag does not contain tile being requested')
        }
        draft.freshTiles = draft.discardTiles
        draft.discardTiles = []
        freshTileIndex = draft.freshTiles.findIndex(t => t === tile)
        if (freshTileIndex === 0) {
          throw new Error('tile bag does not contain tile being requested')
        }
      }
      draft.freshTiles.splice(freshTileIndex, 1)
      draft.factories[params.factoryIndex].push(tile)
    })
    draft.actionHistory = [
      ...draft.actionHistory.slice(0, draft.historyIndex),
      { roundNumber, turnNumber, params },
    ]
    draft.historyIndex++
    draft.currentRoundNumber = roundNumber
    draft.currentTurnNumber = 1
  })
}

function applyTilePull(state, action) {
  const { roundNumber, turnNumber, params } = action.payload
  const { seatIndex, factoryIndex, tileColor, targetRowIndex } = params

  return produce(state, draft => {
    const player = _.find(draft.players, { seatIndex })
    if (!player) {
      throw new Error('player pulling tiles is not in game')
    }
    let selectedTiles, leftoverTiles

    if (factoryIndex === -1) {
      // Tiles pulled from table tiles
      if (draft.firstSeatNextRound === null) {
        // If first player to pull from table, give them the first player token
        const firstAvailableIndex = player.brokenTiles.indexOf(null)
        if (firstAvailableIndex !== -1) {
          player.brokenTiles[firstAvailableIndex] = FIRST_PLAYER_TOKEN
        }
        draft.firstSeatNextRound = userId
      }
      ;[selectedTiles, leftoverTiles] = _.partition(draft.tableTiles, t => t === tileColor)
      draft.tableTiles = leftoverTiles
    } else {
      // Tiles pulled from factory
      ;[selectedTiles, leftoverTiles] = _.partition(
        draft.factories[factoryIndex],
        t => t === tileColor
      )
      draft.tableTiles = draft.tableTiles.concat(leftoverTiles)
      draft.factories[factoryIndex] = []
    }

    ;(selectedTiles || []).forEach(tile => {
      // Find target staging row from index. If the index is -1, use broken tile row.
      let targetRow =
        targetRowIndex !== -1 ? player.stagingRows[targetRowIndex].tiles : player.brokenTiles
      let firstAvailableTileIndex = targetRow.indexOf(null)

      if (firstAvailableTileIndex !== -1) {
        targetRow[firstAvailableTileIndex] = tile
        return
      }

      targetRow = player.brokenTiles
      firstAvailableTileIndex = targetRow.indexOf(null)
      if (firstAvailableTileIndex !== -1) {
        targetRow[firstAvailableIndex] = tile
        return
      }

      draft.discardTiles.push(tile)
    })

    draft.actionHistory = [
      ...draft.actionHistory.slice(0, draft.historyIndex),
      { roundNumber, turnNumber, params },
    ]
    draft.historyIndex++
    draft.currentTurnNumber = turnNumber + 1
    draft.activeSeatIndex = (draft.activeSeatIndex + 1) % draft.players.length
  })
}

function applyTileTransfer(state, action) {
  const { roundNumber, turnNumber, params } = action.payload
  const { playerIndex, rowIndex, columnIndex, tileColor } = params

  return produce(state, draft => {
    const player = _.find(draft.players, { playerIndex })

    player.finalRows[rowIndex].tiles[columnIndex] = tileColor
    player.stagingRows[rowIndex].tiles.fill(null)
    draft.discardTiles = draft.discardTiles.concat(Array(rowIndex).fill(tileColor))
    draft.actionHistory = [
      ...draft.actionHistory.slice(0, draft.historyIndex),
      { roundNumber, turnNumber, params },
    ]
    draft.historyIndex++
  })
}

const TILE_TYPE_INDEX_MAP = {
  0: 'black',
  1: 'blue',
  2: 'red',
  3: 'snowflake',
  4: 'yellow',
  5: null,
}

/**
 * Converts a factory code into a list of tile types. A factory code is a 4 digit number where each
 * digit represents a tile. The map used to decode these digits is TILE_TYPE_INDEX_MAP
 * @see {TILE_TYPE_INDEX_MAP}
 * @return {Array.<string>}
 * @param {string} factoryCode
 */
function parseTilesFromFactoryCode(factoryCode) {
  let factory = []
  factoryCode.split('').forEach(tileCode => {
    factory.push(TILE_TYPE_INDEX_MAP[tileCode])
  })
  return factory
}

module.exports = {
  getInitialGameState,
  applyActions,
  applyTilePull
}
