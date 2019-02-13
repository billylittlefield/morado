import { handleActions } from 'redux-actions'

import {
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
  DROPPED_TILE_PENALTIES,
  REQUIRED_ORDER,
} from 'util/game-invariants'
import handlePullAndStageTiles from 'redux/reducers/azul/handlePullAndStageTiles'
import handleRefillFactories from 'redux/reducers/azul/handleRefillFactories'
import handleTransferTiles from 'redux/reducers/azul/handleTransferTiles'


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
  firstPlayerNextRound: null,
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
  }
}

export default (state = initialState, action) => {
  const reducer = handleActions({
    PULL_AND_STAGE_TILES: handlePullAndStageTiles,
    REFILL_FACTORIES: handleRefillFactories,
    TRANSFER_TILES_TO_FINAL_ROWS: handleTransferTiles
  }, state)

  return reducer(state, action)
}
