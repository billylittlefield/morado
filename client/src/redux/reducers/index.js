import { combineReducers } from 'redux';

import userInfoReducer from 'redux/reducers/userInfo';
import currentGameReducer from 'redux/reducers/currentGame';
import lobbyReducer from 'redux/reducers/lobby';

export default combineReducers({
  userInfo: userInfoReducer,
  currentGame: currentGameReducer,
  lobby: lobbyReducer,
});
