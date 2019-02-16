import { produce } from 'immer'

import { AZUL } from '@shared/azul/game-invariants'
import { UPDATE_GAME_STATE_FROM_SERVER } from 'redux/actionTypes'
import azulReducer from 'redux/reducers/games/azul'

const initialState = {
  gameId: null,
  gameType: null,
  gameState: null
}

function updateGameStateFromServer(state, action) {
  const { gameId, gameType, gameState } = action.payload
  return produce(state, draft => {
    draft.gameId = gameId
    draft.gameType = gameType
    draft.gameState = gameState
  })
}

function getGameReducer(gameType) {
  switch(gameType) {
    case AZUL:
      return azulReducer
    default:
      return state => state
  }
}

function gameReducer(state = initialState, action) {
  switch(action.type) {
    case UPDATE_GAME_STATE_FROM_SERVER:
      return updateGameStateFromServer(state, action)
    default:
      return {
        ...state,
        gameState: getGameReducer(state.gameType)(state.gameState, action)
      }
  }
}

export default gameReducer
