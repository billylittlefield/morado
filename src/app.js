import React from 'react'
import { connect } from 'react-redux'

import AzulContainer from 'components/container/AzulContainer'
import HeaderContainer from 'components/container/HeaderContainer'
import Lobby from 'components/presentation/Lobby'
import 'app.scss'

const mapStateToProps = state => {
  return { ...state }
}

const App = props => {
  
  let componentToRender
  if (props.user.isLoggedIn) {
    if (props.currentGame.gameState !== null) {
      componentToRender = <AzulContainer hasGameStarted={false} numPlayers={4} useColorTemplate={false}/>
    } else {
      componentToRender = <Lobby userInfo={props.user} />
    }
  }
  
  return (
    <>
      <h1>Azul</h1>
      <HeaderContainer user={props.user} />
      {componentToRender}
    </>
  )
}

export default connect(mapStateToProps)(App)
