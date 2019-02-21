import { combineReducers } from 'redux'

import userReducer from 'redux/reducers/user'
import currentGameReducer from 'redux/reducers/currentGame'
import allGamesReducer from 'redux/reducers/allGames'

export default combineReducers({
  user: userReducer,
  currentGame: currentGameReducer,
  allGames: allGamesReducer
})
