import { combineReducers } from 'redux'

import userReducer from 'redux/reducers/user'
import gameReducer from 'redux/reducers/game'
import allGamesReducer from 'redux/reducers/allGames'

export default combineReducers({
  user: userReducer,
  currentGame: gameReducer,
  allGames: allGamesReducer
})
