import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import AzulContainer from 'components/container/AzulContainer'
import NavContainer from 'components/container/NavContainer'
import LobbyContainer from 'components/container/LobbyContainer'
import LoginContainer from 'components/container/LoginContainer'
import 'app.scss'
import { login } from 'redux/actions'


const mapStateToProps = state => {
  return { ...state }
}

class App extends React.Component {
  componentDidMount() {
    axios.post('/auth').then(res => {
      const userInfo = res.data
      if (userInfo.userId && userInfo.username) {
        this.props.login(userInfo)
      }
    })
  }

  render() {
    let componentToRender
    if (this.props.user.isLoggedIn) {
      if (this.props.currentGame.gameState !== null) {
        componentToRender = (
          <>
            <NavContainer user={this.props.user} />
            <AzulContainer userInfo={this.props.user} socket={this.props.currentGame.socket} />
          </>
        )
      } else {
        componentToRender = (
          <>
            <NavContainer user={this.props.user} />
            <LobbyContainer />
          </>
        )
      }
    } else {
      componentToRender = (
        <>
          <h1 className="page-title">AZUL Online</h1>
          <section className="main">
            <LoginContainer />
          </section>
        </>
      )
    }

    return (
      <>
        {componentToRender}
      </>
    )
  }
}

export default connect(mapStateToProps, { login })(App)
