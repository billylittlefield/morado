import { UPDATE_ALL_GAMES_FROM_SERVER } from 'redux/actionTypes'

const initialState = []

function allGamesReducer(state = initialState, action) {
  if (action.type === UPDATE_ALL_GAMES_FROM_SERVER) {
    return action.games
  } else {
    return state
  }
}

export default allGamesReducer
