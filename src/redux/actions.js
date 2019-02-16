
import {
  REFILL_FACTORIES,
  PULL_AND_STAGE_TILES,
  TRANSFER_TILES_TO_FINAL_ROWS,
  LOGIN,
  LOGOUT,
  UPDATE_GAME_STATE_FROM_SERVER,
  UPDATE_ALL_GAMES_FROM_SERVER
} from 'redux/actionTypes'


export function login(payload) {
  return { type: LOGIN, payload }
}

export function logout() {
  return { type: LOGOUT }
}

export function updateGameStateFromServer(payload) {
  return { type: UPDATE_GAME_STATE_FROM_SERVER, payload }
} 

export function updateAllGamesFromServer(games) {
  return { type: UPDATE_ALL_GAMES_FROM_SERVER, games }
}

export function refillFactories(payload) {
  return { type: REFILL_FACTORIES, payload }
}

export function pullAndStageTiles(payload) {
  return { type: PULL_AND_STAGE_TILES, payload }
}

export function transferTiles(payload) {
  return { type: TRANSFER_TILES_TO_FINAL_ROWS, payload }
}
