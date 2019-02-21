import { handleActions } from 'redux-actions'

import AzulHelpers from '@shared/azul/helpers'
import {
  TILE_PULL,
  FACTORY_REFILL,
  TILE_TRANSFER,
} from '@shared/azul/game-invariants'

export default (state = null, action) => {
  const reducer = handleActions(
    {
      [TILE_PULL]: AzulHelpers.applyTilePull,
      [FACTORY_REFILL]: AzulHelpers.applyFactoryRefill,
      [TILE_TRANSFER]: AzulHelpers.applyTileTransfer,
    },
    state
  )

  return reducer(state, action)
}
