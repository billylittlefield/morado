import produce from 'immer'

import { FIRST_PLAYER_TOKEN } from 'util/game-invariants'

const handlePullAndStageTiles = (state, action) => {
  return produce(state, draft => {
    const { playerIndex, factoryIndex, tileColor, targetRowIndex } = action.payload
    const board = draft.playerBoards[playerIndex]
    let selectedTiles, leftoverTiles

    if (factoryIndex === -1) {
      // Tiles pulled from table tiles
      if (draft.haveTableTilesBeenPulled === false) {
        // If first player to pull from table, give them the first player token
        draft.haveTableTilesBeenPulled = true
        const availableIndex = board.brokenTiles.indexOf(null)
        if (availableIndex !== -1) {
          board.brokenTiles[availableIndex] = FIRST_PLAYER_TOKEN
        }
        board.isFirstPlayerNextRound = true
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
        targetRowIndex !== -1 ? board.stagingRows[targetRowIndex].tiles : board.brokenTiles
      let firstAvailableTileIndex = targetRow.indexOf(null)

      if (firstAvailableTileIndex !== -1) {
        targetRow[firstAvailableTileIndex] = tile
        return
      }

      targetRow = board.brokenTiles
      firstAvailableTileIndex = targetRow.indexOf(null)
      if (firstAvailableTileIndex !== -1) {
        targetRow[availableIndex] = tile
        return
      }

      draft.discardTiles.push(tile)
    })
    draft.turnHistory = [...draft.turnHistory.slice(0, draft.historyIndex), action.payload]
    draft.historyIndex++
    draft.turn++
    draft.activePlayerIndex = (draft.activePlayerIndex + 1) % draft.playerBoards.length
  })
}

export default handlePullAndStageTiles
