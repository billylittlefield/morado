import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import undoable from 'redux-undo'

import rootReducer from 'redux/reducers'
import App from 'app'

const production = process.env.NODE_ENV === 'production'

const AppToRender = production ? App : hot(module)(App)

const target = document.getElementById('app')

const store = createStore(undoable(rootReducer))

ReactDOM.render(
  <Provider store={store}>
    <AppToRender />
  </Provider>,
  target
)
