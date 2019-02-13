import { handleActions } from 'redux-actions'
import produce from 'immer'

const initialState = {
  userId: null,
  username: null,
  isLoggedIn: false
}

function login(state, action) {
  return produce(state, draft => {
    const { userId, username } = action.payload
    draft.userId = userId
    draft.username = username
    draft.isLoggedIn = true
  })
}

function logout(state, action) {
  return produce(state, draft => {
    draft.userId = null,
    draft.username = null,
    draft.isLoggedIn = false
  })
}

export default (state = initialState, action) => {
  const reducer = handleActions({
    LOGIN: login,
    LOGOUT: logout
  }, state)

  return reducer(state, action)
}
