import produce from 'immer'

import { shuffle } from 'util/game-helpers'
import { TILE_COLORS, NUM_TILES_OF_COLOR, GET_FACTORY_COUNT, DROPPED_TILE_PENALTIES } from 'util/game-invariants'
import {
  SHUFFLE_TILES,
  REFILL_FACTORIES,
  PULL_TILES,
  STAGE_TILES,
  TRANSFER_TILES_TO_FINAL_ROWS,
} from 'redux/actionTypes'

const initialState = {
  playerBoards: [createNewPlayerBoard(0), createNewPlayerBoard(1)],
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
}

function createNewPlayerBoard(playerId) {
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
        return { tiles: Array(5).fill(null), rowSize: 5, requiredOrder: null }
      }),
    brokenTiles: Array(DROPPED_TILE_PENALTIES.length).fill(null)
  }
}

export default function(state = initialState, action) {
  return produce(state, draft => {
    switch (action.type) {
      case SHUFFLE_TILES: {
        draft.freshTiles = shuffle(draft.freshTiles)
      }

      case REFILL_FACTORIES: {
        shuffle(draft.freshTiles)
        draft.factories.forEach((factory, factoryIndex) => {
          while (factory.length < 4) {
            if (draft.freshTiles.length === 0) {
              if (draft.discardTiles.length === 0) {
                return
              }
              draft.freshTiles === shuffle(draft.discardTiles)
              draft.discardTiles = []
            }

            factory.push(draft.freshTiles.pop())
          }
        })
        draft.round++
        draft.turn = 0
        break
      }

      case PULL_TILES: {
        const { factoryIndex, tileColor } = action.payload
        if (factoryIndex === -1) {
          draft.tableTiles = draft.tableTiles.filter(t => t !== tileColor)
        } else {
          const leftoverTiles = draft.factories[factoryIndex].filter(t => t !== tileColor)
          draft.tableTiles = draft.tableTiles.concat(leftoverTiles)
          draft.factories[factoryIndex] = []
        }
        break
      }

      case STAGE_TILES: {
        const { playerIndex, selectedTiles, targetRowIndex } = action.payload

        selectedTiles.forEach(tile => {
          let targetRow =
            targetRowIndex !== -1
              ? draft.playerBoards[playerIndex].stagingRows[targetRowIndex].tiles
              : draft.playerBoards[playerIndex].brokenTiles
          let availableIndex = targetRow.indexOf(null)

          if (availableIndex !== -1) {
            targetRow[availableIndex] = tile
            return
          }

          targetRow = draft.playerBoards[playerIndex].brokenTiles
          availableIndex = targetRow.indexOf(null)
          if (availableIndex !== -1) {
            targetRow[availableIndex] = tile
            return
          }

          draft.discardTiles.push(tile)
        })
        break
      }

      case TRANSFER_TILES_TO_FINAL_ROWS: {
        const { playerIndex, rowIndex, columnIndex } = action.payload

        const board = draft.playerBoards[playerIndex]
        const color = board.stagingRows[rowIndex].tiles[0]

        board.finalRows[rowIndex].tiles[columnIndex] = color
        draft.discardTiles = draft.discardTiles.concat(Array(rowIndex).fill(color))
        break
      }
    }
  })
}
