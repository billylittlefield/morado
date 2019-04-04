const _ = require('lodash')
const { produce } = require('immer')

const {
  FACTORY_REFILL,
  TILE_PULL,
  TILE_TRANSFER,
  TILE_DUMP,
  REQUIRED_ORDER,
  DROPPED_TILE_PENALTIES,
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
  STARTING_PLAYER,
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
    tableTiles: [STARTING_PLAYER],
    currentRoundNumber: null,
    currentTurnNumber: null,
    firstSeatNextRound: null,
    activeSeatIndex: 0,
    actionHistory: [],
    historyIndex: 0,
    seatsRequiringInput: {},
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

function applyGameActions(state, action) {
  return action.payload.reduce((state, action) => applyGameAction(state, action), state)
}

function applyGameAction(state, action) {
  let newState
  switch (action.type) {
    case FACTORY_REFILL:
      newState = applyFactoryRefill(state, action)
      break
    case TILE_PULL:
      newState = applyTilePull(state, action)
      break
    case TILE_TRANSFER:
      newState = applyTileTransfer(state, action)
      break
    case TILE_DUMP:
      newState = applyTileDump(state, action)
      break
    default:
      throw new Error('Unrecognized Azul action type')
  }
  newState = checkForPendingTileTransfers(newState)
  return newState
}

function applyFactoryRefill(state, action) {
  const { roundNumber, params } = action

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
        if (freshTileIndex === -1) {
          throw new Error('tile bag does not contain tile being requested')
        }
      }
      draft.freshTiles.splice(freshTileIndex, 1)
      draft.factories[params.factoryIndex].push(tile)
    })
    draft.actionHistory = [...draft.actionHistory.slice(0, draft.historyIndex), action]
    draft.historyIndex++
    draft.currentRoundNumber = roundNumber
    draft.currentTurnNumber = 1
  })
}

function applyTilePull(state, action) {
  const { turnNumber, params } = action
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
        draft.firstSeatNextRound = params.seatIndex
      }
      ;[selectedTiles, leftoverTiles] = _.partition(
        draft.tableTiles,
        t => t === tileColor || t === STARTING_PLAYER
      )
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
      if (tile === STARTING_PLAYER) {
        let vacantIndex = player.brokenTiles.indexOf(null)
        if (vacantIndex !== -1) {
          player.brokenTiles[vacantIndex] = tile
        }
        return
      }
      let targetRow =
        targetRowIndex === -1 ? player.brokenTiles : player.stagingRows[targetRowIndex].tiles
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

    draft.actionHistory = [...draft.actionHistory.slice(0, draft.historyIndex), action]
    draft.historyIndex++
    draft.currentTurnNumber = turnNumber + 1
    draft.activeSeatIndex = (draft.activeSeatIndex + 1) % draft.players.length
  })
}

function applyTileTransfer(state, action) {
  const { seatIndex, rowIndex, columnIndex, tileColor } = action.params

  return produce(state, draft => {
    const player = _.find(draft.players, { seatIndex })

    player.finalRows[rowIndex].tiles[columnIndex] = tileColor
    player.score += scoreTilePlacement(player.finalRows, rowIndex, columnIndex)
    player.stagingRows[rowIndex].tiles.fill(null)
    draft.discardTiles = draft.discardTiles.concat(Array(rowIndex).fill(tileColor))
    draft.actionHistory = [...draft.actionHistory.slice(0, draft.historyIndex), action]
    draft.historyIndex++
  })
}

function applyTileDump(state, action) {
  const { firstSeatNextRound } = action.params
  return produce(state, draft => {
    draft.players.forEach(player => {
      let brokenTiles = player.brokenTiles.filter(t => t !== null)
      brokenTiles.forEach((brokenTile, index) => {
        player.score += DROPPED_TILE_PENALTIES[index]
      })
      draft.discardTiles = draft.discardTiles.concat(brokenTiles.filter(t => t !== STARTING_PLAYER))
      player.brokenTiles = Array(DROPPED_TILE_PENALTIES.length).fill(null)
    })

    draft.tableTiles = [STARTING_PLAYER]
    draft.activeSeatIndex = firstSeatNextRound
    draft.firstSeatNextRound = null
    draft.actionHistory = [...draft.actionHistory.slice(0, draft.historyIndex), action]
    draft.historyIndex++
  })
}

function scoreTilePlacement(rows, rowIndex, columnIndex) {
  let horizontalNeighbors = []
  let verticalNeighbors = []
  let offset = 1
  let continueLeft = columnIndex > 0
  let continueRight = columnIndex < 4
  let continueUp = rowIndex > 0
  let continueDown = rowIndex < 0

  while (continueLeft || continueRight || continueUp || continueDown) {
    if (
      continueLeft &&
      columnIndex - offset >= 0 &&
      rows[rowIndex].tiles[columnIndex - offset] !== null
    ) {
      horizontalNeighbors.push(columnIndex - offset)
    } else {
      continueLeft = false
    }

    if (
      continueRight &&
      columnIndex + offset <= 4 &&
      rows[rowIndex].tiles[columnIndex + offset] !== null
    ) {
      horizontalNeighbors.push(columnIndex + offset)
    } else {
      continueRight = false
    }

    if (
      continueUp &&
      rowIndex - offset >= 0 &&
      rows[rowIndex - offset].tiles[columnIndex] !== null
    ) {
      verticalNeighbors.push(rowIndex - offset)
    } else {
      continueUp = false
    }

    if (
      continueDown &&
      rowIndex + offset <= 4 &&
      rows[rowIndex + offset].tiles[columnIndex] !== null
    ) {
      verticalNeighbors.push(rowIndex + offset)
    } else {
      continueDown = false
    }

    offset++
  }

  let baseScore = verticalNeighbors.length > 1 && horizontalNeighbors.length > 1 ? 2 : 1
  return baseScore + verticalNeighbors.length + horizontalNeighbors.length
}

function checkForPendingTileTransfers(state) {
  const { tableTiles, factories } = state

  if (
    tableTiles.length !== 0 ||
    factories.every(f => f.length !== 0) ||
    state.options.useColorTemplate
  ) {
    return state
  }

  let seatsRequiringInput = {}
  state.players.forEach(player => {
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
          player.finalRows[rowIndex].tiles[columnIndex] === null
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

  return produce(state, draft => {
    draft.seatsRequiringInput = seatsRequiringInput
  })
}

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
    tileCode === 5 ? factory.push(null) : factory.push(TILE_COLORS[tileCode])
  })
  return factory
}

function createFactoryCodeFromTiles(tiles) {
  let tileCodes = tiles.map(tile => {
    if (tile === null || tile === undefined) {
      return 5
    }
    return TILE_COLORS.indexOf(tile)
  })
  while (tileCodes.length < 4) {
    tileCodes.push(5)
  }
  return tileCodes.join('')
}

module.exports = {
  getInitialGameState,
  generateInitialFactoryRefills,
  applyGameAction,
  applyGameActions,
  applyTilePull,
  applyTileTransfer,
  createFactoryCodeFromTiles,
}
