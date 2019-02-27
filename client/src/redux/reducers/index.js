import { combineReducers } from 'redux'

import userReducer from 'redux/reducers/user'
import currentGameReducer from 'redux/reducers/currentGame'
import lobbyReducer from 'redux/reducers/lobby'

export default combineReducers({
  user: userReducer,
  currentGame: currentGameReducer,
  lobby: lobbyReducer,
})
