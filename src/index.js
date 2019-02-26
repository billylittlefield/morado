import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import axios from 'axios'
import Modal from 'react-modal'

import rootReducer from 'redux/reducers'
import App from 'app'

const production = process.env.NODE_ENV === 'production'

const AppToRender = production ? App : hot(module)(App)

const targetElementId = 'app'
const targetElement = document.getElementById(targetElementId)

const store = createStore(rootReducer)

axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true

Modal.setAppElement(`#${targetElementId}`)

ReactDOM.render(
  <Provider store={store}>
    <AppToRender />
  </Provider>,
  targetElement
)
