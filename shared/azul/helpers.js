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
  FIRST_PLAYER_TOKEN,
  GET_FACTORY_COUNT,
} = require('./game-invariants')

const { shuffle } = require('../util')

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
    factories: Array(GET_FACTORY_COUNT(options.numPlayers))
      .fill()
      .map(() => []),
    discardTiles: [],
    tableTiles: [],
    currentRoundNumber: null,
    currentTurnNumber: null,
    firstSeatNextRound: null,
    activeSeatIndex: 0,
    actionHistory: [],
    historyIndex: 0,
    seatsRequiringInput: [],
  }
}

function createInitialTileList() {
  return Array(TILE_COLORS.length * NUM_TILES_OF_COLOR)
    .fill()
    .map((_, index) => {
      return TILE_COLORS[index % TILE_COLORS.length]
    })
}

function createNewPlayer(player, seatIndex, useColorTemplate) {
  return {
    userId: player.userId,
    username: player.username,
    seatIndex,
    score: 0,
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

function generateInitialFactoryRefills(gameSize) {
  const shuffleTiles = shuffle(createInitialTileList())
  return Array(GET_FACTORY_COUNT(gameSize))
    .fill()
    .map((_ignore, factoryIndex) => {
      const factory = []
      _.times(4, () => factory.push(shuffleTiles.pop()))
      const factoryCode = createFactoryCodeFromTiles(factory)
      return {
        type: FACTORY_REFILL,
        roundNumber: 1,
        turnNumber: 0,
        params: {
          factoryCode,
          factoryIndex,
        },
      }
    })
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
  newState = checkForPendingTileTransfers(newState)
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
      // PLAYER PULLED FROM TABLE TILES
      if (draft.firstSeatNextRound === null) {
        // If this is the first player to pull from table tiles, give them the first player token
        const vacantIndex = player.brokenTiles.indexOf(null)
        if (vacantIndex !== -1) {
          player.brokenTiles[vacantIndex] = FIRST_PLAYER_TOKEN
        }
        draft.firstSeatNextRound = params.seatIndex
      }
      ;[selectedTiles, leftoverTiles] = _.partition(draft.tableTiles, t => t === tileColor)
      draft.tableTiles = leftoverTiles
    } else {
      // PLAYER PULLED FROM FACTORY
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
      let vacantIndex = targetRow.indexOf(null)

      if (vacantIndex !== -1) {
        targetRow[vacantIndex] = tile
        return
      }

      targetRow = player.brokenTiles
      vacantIndex = targetRow.indexOf(null)
      if (vacantIndex !== -1) {
        targetRow[vacantIndex] = tile
      } else {
        // Player's broken tiles row is full -- discard the tile
        draft.discardTiles.push(tile)
      }
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
  const { seatIndex, rowIndex, columnIndex, tileColor } = params

  return produce(state, draft => {
    const player = _.find(draft.players, { seatIndex })

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

function checkForPendingTileTransfers(state) {
  const { tableTiles, factories } = state

  return produce(state, draft => {
    if (
      tableTiles.length !== 0 ||
      factories.every(f => f.length !== 0) ||
      draft.options.useColorTemplate
    ) {
      return draft
    }

    let seatsRequiringInput = {}
    draft.players.forEach(player => {
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

        // If not using the template, identify all possible column indices given the current state
        // of final rows on this players board
        const possibleColumnIndices = [0, 1, 2, 3, 4].filter(columnIndex => {
          return (
            player.finalRows.every(r => r.tiles[columnIndex] !== tileColor) &&
            stagingRow[columnIndex] === null
          )
        })
        if (possibleColumnIndices.length > 1) {
          const rowIndexToColumnIndexMap = { [rowIndex]: possibleColumnIndices }
          // If there are more than one available index, we can't auto-perform this transfer
          if (seatsRequiringInput[player.seatIndex]) {
            Object.assign(seatsRequiringInput[player.seatIndex], rowIndexToColumnIndexMap)
          } else {
            seatsRequiringInput[player.seatIndex] = rowIndexToColumnIndexMap
          }
        }
      })
    })

    draft.seatsRequiringInput = seatsRequiringInput
  })
}

const TILE_TYPES = TILE_COLORS.concat([null])

/**
 * Converts a factory code into a list of tile types. A factory code is a 4 digit number where each
 * digit represents a tile color, or null.
 * @see {TILE_TYPES}
 * @return {Array.<string>}
 * @param {string} factoryCode
 */
function parseTilesFromFactoryCode(factoryCode) {
  let factory = []
  factoryCode.split('').forEach(tileCode => {
    factory.push(TILE_TYPES[tileCode])
  })
  return factory
}

function createFactoryCodeFromTiles(tiles) {
  return tiles.map(tile => TILE_TYPES.indexOf(tile)).join('')
}

module.exports = {
  getInitialGameState,
  generateInitialFactoryRefills,
  applyActions,
  applyTilePull,
}
