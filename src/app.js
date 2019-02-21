import React from 'react'
import { connect } from 'react-redux'

import AzulContainer from 'components/container/AzulContainer'
import HeaderContainer from 'components/container/HeaderContainer'
import LobbyContainer from 'components/container/LobbyContainer'
import 'app.scss'

const mapStateToProps = state => {
  return { ...state }
}

const App = props => {
  
  let componentToRender
  if (props.user.isLoggedIn) {
    if (props.currentGame.gameState !== null) {
      componentToRender = <AzulContainer userInfo={props.user} socket={props.currentGame.socket} />
    } else {
      componentToRender = <LobbyContainer userInfo={props.user} />
    }
  }
  
  return (
    <>
      <HeaderContainer user={props.user} />
      {componentToRender}
    </>
  )
}

export default connect(mapStateToProps)(App)
