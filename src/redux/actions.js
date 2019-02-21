
import {
  LOGIN,
  LOGOUT,
  UPDATE_GAME_STATE_FROM_SERVER,
  UPDATE_ALL_GAMES_FROM_SERVER,
  CONNECTED_TO_GAME,
} from 'redux/actionTypes'
import {
  FACTORY_REFILL,
  TILE_PULL,
  TILE_TRANSFER,
} from '@shared/azul/game-invariants'

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
  return { type: FACTORY_REFILL, payload }
}

export function pullAndStageTiles(payload) {
  return { type: TILE_PULL, payload }
}

export function transferTiles(payload) {
  return { type: TILE_TRANSFER, payload }
}

export function connectedToGame(payload) {
  return { type: CONNECTED_TO_GAME, payload}
}
