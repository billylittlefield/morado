
import {
  REFILL_FACTORIES,
  PULL_AND_STAGE_TILES,
  TRANSFER_TILES_TO_FINAL_ROWS,
  LOGIN,
  LOGOUT
} from 'redux/actionTypes'

export function refillFactories(payload) {
  return { type: REFILL_FACTORIES, payload }
}

export function pullAndStageTiles(payload) {
  return { type: PULL_AND_STAGE_TILES, payload }
}

export function transferTiles(payload) {
  return { type: TRANSFER_TILES_TO_FINAL_ROWS, payload }
}

export function login(payload) {
  return { type: LOGIN, payload }
}

export function logout() {
  return { type: LOGOUT }
}
