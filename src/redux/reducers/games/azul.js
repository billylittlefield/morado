import { handleActions } from 'redux-actions'

import AzulHelpers from '@shared/azul/helpers'
import {
  PULL_AND_STAGE_TILES,
  REFILL_FACTORIES,
  TRANSFER_TILES_TO_FINAL_ROWS,
} from '@shared/azul/game-invariants'

export default (state = null, action) => {
  const reducer = handleActions(
    {
      [PULL_AND_STAGE_TILES]: AzulHelpers.applyTilePull,
      [REFILL_FACTORIES]: AzulHelpers.applyFactoryRefill,
      [TRANSFER_TILES_TO_FINAL_ROWS]: AzulHelpers.applyTileTransfer,
    },
    state
  )

  return reducer(state, action)
}
