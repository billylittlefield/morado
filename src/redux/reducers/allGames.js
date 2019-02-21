import { UPDATE_ALL_GAMES_FROM_SERVER, LOGOUT } from 'redux/actionTypes'

const initialState = []

function allGamesReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_ALL_GAMES_FROM_SERVER:
      return action.games
    case LOGOUT:
      return initialState
    default:
      return state
  }
}

export default allGamesReducer
