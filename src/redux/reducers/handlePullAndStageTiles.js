import { handleAction } from 'redux-actions'
import produce from 'immer'
import { PULL_AND_STAGE_TILES } from 'redux/actionTypes'

const handlePullAndStageTiles = (state, action) => {
  return produce(state, draft => {
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
  })
}

export default handlePullAndStageTiles
