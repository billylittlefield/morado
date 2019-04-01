import { handleActions } from 'redux-actions'

import AzulHelpers from '@shared/azul/helpers'
import { TILE_PULL, TILE_TRANSFER, GAME_ACTIONS_RECEIVED } from 'redux/actionTypes'

export default (state = null, action) => {
  const reducer = handleActions(
    {
      [TILE_PULL]: AzulHelpers.applyTilePull,
      [TILE_TRANSFER]: AzulHelpers.applyTileTransfer,
      [GAME_ACTIONS_RECEIVED]: AzulHelpers.applyGameActions
    },
    state
  )

  return reducer(state, action)
}
