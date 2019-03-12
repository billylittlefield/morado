import {
  LOGIN,
  LOGOUT,
  UPDATE_ALL_GAMES_FROM_SERVER,
  CONNECTED_TO_GAME,
  RECEIVED_AVAILABLE_GAMES_FROM_SERVER,
  GAME_STATE_RECEIVED,
  NEW_GAME_CREATED
} from 'redux/actionTypes'
import { FACTORY_REFILL, TILE_PULL, TILE_TRANSFER } from '@shared/azul/game-invariants'

export function login(payload) {
  return { type: LOGIN, payload }
}

export function logout() {
  return { type: LOGOUT }
}

export function receiveGameState(payload) {
  return { type: GAME_STATE_RECEIVED, payload }
}

export function receivedActiveGames(payload) {
  return { type: UPDATE_ALL_GAMES_FROM_SERVER, payload }
}

export function receivedAvailableGames(payload) {
  return { type: RECEIVED_AVAILABLE_GAMES_FROM_SERVER, payload }
}

export function createdNewGame(payload) {
  return { type: NEW_GAME_CREATED, payload }
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
  return { type: CONNECTED_TO_GAME, payload }
}
