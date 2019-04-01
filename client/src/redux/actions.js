import {
  LOGIN,
  LOGOUT,
  UPDATE_ALL_GAMES_FROM_SERVER,
  CONNECTED_TO_GAME,
  RECEIVED_AVAILABLE_GAMES_FROM_SERVER,
  GAME_STATE_RECEIVED,
  NEW_GAME_CREATED,
  GAME_ACTIONS_RECEIVED
} from 'redux/actionTypes'

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

export function refillFactories(action) {
  return action
}

export function pullAndStageTiles(action) {
  return action
}

export function transferTiles(action) {
  return action
}

export function connectedToGame(payload) {
  return { type: CONNECTED_TO_GAME, payload }
}

export function receiveGameActions(payload) {
  return { type: GAME_ACTIONS_RECEIVED, payload }
}
