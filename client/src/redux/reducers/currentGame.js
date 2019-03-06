import { AZUL } from '@shared/azul/game-invariants'
import { GAME_STATE_RECEIVED, LOGOUT, CONNECTED_TO_GAME } from 'redux/actionTypes'
import azulReducer from 'redux/reducers/games/azul'

const initialState = {
  gameId: null,
  gameType: null,
  gameState: null,
  socket: null,
}

function getGameReducer(gameType) {
  switch (gameType) {
    case AZUL:
      return azulReducer
    default:
      return state => state
  }
}

function currentGameReducer(state = initialState, action) {
  switch (action.type) {
    case GAME_STATE_RECEIVED:
      const { gameId, gameType, gameState } = action.payload
      return { ...state, gameId, gameType, gameState }
    case CONNECTED_TO_GAME:
      const { socket } = action.payload
      return { ...state, socket }
    case LOGOUT:
      return { ...initialState }
    default:
      return {
        ...state,
        gameState: getGameReducer(state.gameType)(state.gameState, action),
      }
  }
}

export default currentGameReducer
