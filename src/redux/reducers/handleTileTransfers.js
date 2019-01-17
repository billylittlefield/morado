import produce from 'immer'
import { DROPPED_TILE_PENALTIES } from 'util/game-invariants'

const handleTileTransfers = (state, action) => {
  return produce(state, draft => {
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
  })
}

export default handleTileTransfers
