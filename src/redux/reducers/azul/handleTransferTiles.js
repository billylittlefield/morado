import produce from 'immer'
import { DROPPED_TILE_PENALTIES, FIRST_PLAYER_TOKEN } from 'util/game-invariants'

const handleTransferTiles = (state, action) => {
  return produce(state, draft => {
    const transfers = action.payload
  
    transfers.forEach(transfer => {
      const { playerIndex, rowIndex, columnIndex, tileColor } = transfer
      const board = draft.playerBoards[playerIndex]
  
      board.finalRows[rowIndex].tiles[columnIndex] = tileColor
      board.stagingRows[rowIndex].tiles.fill(null)
      draft.discardTiles = draft.discardTiles.concat(Array(rowIndex).fill(tileColor))
    })
    
    draft.playerBoards.forEach(board => {
      draft.discardTiles = draft.discardTiles.concat(
        board.brokenTiles.filter(t => t !== FIRST_PLAYER_TOKEN)
      )
      board.brokenTiles = Array(DROPPED_TILE_PENALTIES.length).fill(null)
    })
    
    draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), action.payload]
    draft.historyIndex++
  })
}

export default handleTransferTiles
