import produce from 'immer'
import _ from 'lodash'

import {
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
  DROPPED_TILE_PENALTIES,
  REQUIRED_ORDER,
} from 'util/game-invariants'
import {
  REFILL_FACTORIES,
  PULL_AND_STAGE_TILES,
  TRANSFER_TILES_TO_FINAL_ROWS,
} from 'redux/actionTypes'

const initialState = {
  playerBoards: [createNewPlayerBoard(0, true), createNewPlayerBoard(1, true)],
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
  round: 0,
  turn: 0,
  haveTableTilesBeenPulled: false,
  turnHistory: [],
  historyIndex: 0,
  activePlayerIndex: 0,
}

function createNewPlayerBoard(playerId, useRequiredOrder) {
  return {
    playerId,
    stagingRows: Array(5)
      .fill()
      .map((_, index) => {
        return { tiles: Array(index + 1).fill(null), rowSize: index + 1 }
      }),
    finalRows: Array(5)
      .fill()
      .map((_, index) => {
        const requiredOrder = useRequiredOrder ? REQUIRED_ORDER[index] : null
        return { tiles: Array(5).fill(null), rowSize: 5, requiredOrder }
      }),
    brokenTiles: Array(DROPPED_TILE_PENALTIES.length).fill(null),
    isFirstPlayerNextRound: false,
  }
}

export default function(state = initialState, action) {
  return produce(state, draft => {
    switch (action.type) {
      case REFILL_FACTORIES: {
        draft.factories = action.payload.factories
        draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), action.payload]
        draft.historyIndex++
        draft.round++
        draft.turn = 1
        break
      }

      case PULL_AND_STAGE_TILES: {
        const { playerIndex, factoryIndex, tileColor, targetRowIndex } = action.payload
        const board = draft.playerBoards[playerIndex]
        let selectedTiles, leftoverTiles

        // Tiles pulled from table tiles:
        if (factoryIndex === -1) {
          // If first player to pull from table, give them the first_player token
          if (draft.haveTableTilesBeenPulled === false) {
            draft.haveTableTilesBeenPulled = true
            const availableIndex = board.brokenTiles.indexOf(null)
            if (availableIndex !== -1) {
              board.brokenTiles[availableIndex] = 'first_player'
            }
            board.isFirstPlayerNextRound = true
          }
          ;[selectedTiles, leftoverTiles] = _.partition(draft.tableTiles, t => t === tileColor)
          draft.tableTiles = leftoverTiles

          // Tiles pulled from factory
        } else {
          ;[selectedTiles, leftoverTiles] = _.partition(
            draft.factories[factoryIndex],
            t => t === tileColor
          )
          draft.tableTiles = draft.tableTiles.concat(leftoverTiles)
          draft.factories[factoryIndex] = []
        }

        ;(selectedTiles || []).forEach(tile => {
          let targetRow =
            targetRowIndex !== -1 ? board.stagingRows[targetRowIndex].tiles : board.brokenTiles
          let availableIndex = targetRow.indexOf(null)

          if (availableIndex !== -1) {
            targetRow[availableIndex] = tile
            return
          }

          targetRow = board.brokenTiles
          availableIndex = targetRow.indexOf(null)
          if (availableIndex !== -1) {
            targetRow[availableIndex] = tile
            return
          }

          draft.discardTiles.push(tile)
        })
        draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), action.payload]
        draft.historyIndex++
        draft.turn++
        draft.activePlayerIndex = (draft.activePlayerIndex + 1) % draft.playerBoards.length
        break
      }

      case TRANSFER_TILES_TO_FINAL_ROWS: {
        const transfers = action.payload

        transfers.forEach(transfer => {
          const { playerIndex, rowIndex, columnIndex, tileColor } = transfer
          const board = draft.playerBoards[playerIndex]

          board.finalRows[rowIndex].tiles[columnIndex] = tileColor
          board.stagingRows[rowIndex].tiles = Array(rowIndex + 1).fill(null)
          draft.discardTiles = draft.discardTiles.concat(Array(rowIndex).fill(tileColor))
        })
        draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), ...transfers]
        draft.historyIndex += transfers.length
        draft.playerBoards.forEach(board => {
          draft.discardTiles = draft.discardTiles.concat(
            board.brokenTiles.filter(t => t !== 'first_player')
          )
          board.brokenTiles = Array(DROPPED_TILE_PENALTIES.length).fill(null)
        })
        break
      }
    }
  })
}
