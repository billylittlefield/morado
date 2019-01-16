import {
  SHUFFLE_TILES,
  PULL_TILES,
  STAGE_TILES,
  TRANSFER_TILES_TO_FINAL_ROWS,
  REFILL_FACTORIES,
} from 'redux/actionTypes'

export function shuffleTiles(payload) {
  return { type: SHUFFLE_TILES, payload }
}

export function refillFactories() {
  return { type: REFILL_FACTORIES }
}

export function pullTiles(payload) {
  return { type: PULL_TILES, payload }
}

export function stageTiles(payload) {
  return { type: STAGE_TILES, payload }
}

export function transferTiles(payload) {
  return { type: TRANSFER_TILES_TO_FINAL_ROWS, payload }
}
