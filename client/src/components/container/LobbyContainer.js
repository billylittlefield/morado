import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import _ from 'lodash'
import { Redirect } from 'react-router-dom'

import Lobby from 'components/presentation/Lobby'
import {
  logout,
  connectedToGame,
  receiveGameState,
  receivedActiveGames,
  receivedAvailableGames,
  createdNewGame,
} from 'redux/actions'

class LobbyContainer extends React.Component {
  componentDidMount() {
    if (!this.props.userId) {
      return
    }

    axios
      .get(`/users/${this.props.userId}/games`)
      .then(res => {
        const { games } = res.data
        this.props.receivedActiveGames({ games })
      })
      .catch(err => {
        throw err
      })

    axios
      .get('/games/available')
      .then(res => {
        this.props.receivedAvailableGames({ games: res.data.games })
      })
      .catch(err => {
        throw err
      })
  }

  joinGame(gameId) {
    const userId = this.props.userId
    axios.post('/gameplays', { gameId, userId })
  }

  createGame(name, numPlayers, useColorTemplate) {
    axios
      .post('/games', { name, numPlayers, useColorTemplate })
      .then(res => {
        this.props.createdNewGame({ game: res.data })
      })
      .catch(err => {
        throw err
      })
  }

  render() {
    if (this.props.shouldRedirectToLogin) {
      return <Redirect to="/login" />
    }

    return (
      <Lobby
        activeGames={this.props.activeGames}
        availableGames={this.props.availableGames}
        joinGame={this.joinGame.bind(this)}
        createGame={this.createGame.bind(this)}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    shouldRedirectToLogin: !state.userInfo.isLoggedIn,
    userId: state.userInfo.userId,
    activeGames: state.lobby.activeGames,
    availableGames: state.lobby.availableGames,
  }
}

export default connect(
  mapStateToProps,
  {
    logout,
    connectedToGame,
    receiveGameState,
    receivedActiveGames,
    receivedAvailableGames,
    createdNewGame
  }
)(LobbyContainer)
