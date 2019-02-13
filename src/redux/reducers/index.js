import { combineReducers } from 'redux'

import user from 'redux/reducers/user'
import azul from 'redux/reducers/azul'

export default combineReducers({
  user,
  azul
})
