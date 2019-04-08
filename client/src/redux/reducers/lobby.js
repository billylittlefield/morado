import { combineReducers } from 'redux';

import {
  UPDATE_ALL_GAMES_FROM_SERVER,
  RECEIVED_AVAILABLE_GAMES_FROM_SERVER,
  NEW_GAME_CREATED,
} from 'redux/actionTypes';

function activeGamesReducer(state = [], action) {
  switch (action.type) {
    case UPDATE_ALL_GAMES_FROM_SERVER:
      return action.payload.games;
    case NEW_GAME_CREATED:
      return [action.payload.game].concat(state);
    default:
      return state;
  }
}

function availableGamesReducer(state = [], action) {
  switch (action.type) {
    case RECEIVED_AVAILABLE_GAMES_FROM_SERVER:
      return action.payload.games;
    default:
      return state;
  }
}

export default combineReducers({
  activeGames: activeGamesReducer,
  availableGames: availableGamesReducer,
});
