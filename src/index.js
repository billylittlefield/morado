import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader'
import App from 'app'

const production = process.env.NODE_ENV === 'production'

const AppToRender = production ? App : hot(module)(App)

const target = document.getElementById('app')

ReactDOM.render(<AppToRender />, target)
