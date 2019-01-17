import produce from 'immer'
import _ from 'lodash'
import { handleActions } from 'redux-actions'

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
import handlePullAndStageTiles from 'redux/reducers/handlePullAndStageTiles'
import handleFactoryRefill from 'redux/reducers/handleFactoryRefill'
import handleTileTransfers from 'redux/reducers/handleTileTransfers'

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

export default (state = initialState, action) => {
  const reducer = handleActions({
    PULL_AND_STAGE_TILES: handlePullAndStageTiles,
    REFILL_FACTORIES: handleFactoryRefill,
    TRANSFER_TILES_TO_FINAL_ROWS: handleTileTransfers
  }, state)

  return reducer(state, action)
}
