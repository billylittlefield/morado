import React from 'react'
import { connect } from 'react-redux'
import io from 'socket.io-client'
import axios from 'axios'
import _ from 'lodash'
import { Redirect } from 'react-router-dom'

import Lobby from 'components/presentation/Lobby'
import {
  logout,
  connectedToGame,
  receiveGameState,
  updateActiveGamesFromServer,
  receivedAvailableGamesFromServer,
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
        this.props.updateActiveGamesFromServer({ games })
      })
      .catch(err => {
        throw err
      })

    axios
      .get('/games/available')
      .then(res => {
        this.props.receivedAvailableGamesFromServer({ games: res.data.games })
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
        const gameId = res.data.gameId
        this.joinGame(gameId)
      })
      .catch(err => {
        throw err
      })
  }

  render() {
    if (!this.props.isLoggedIn) {
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
    isLoggedIn: state.userInfo.isLoggedIn,
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
    updateActiveGamesFromServer,
    receivedAvailableGamesFromServer,
  }
)(LobbyContainer)
