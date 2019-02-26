import React from 'react'
import { connect } from 'react-redux'
import io from 'socket.io-client'
import axios from 'axios'
import _ from 'lodash'

import Lobby from 'components/presentation/Lobby'
import {
  logout,
  connectedToGame,
  updateGameStateFromServer,
  updateActiveGamesFromServer,
  receivedAvailableGamesFromServer,
} from 'redux/actions'

class LobbyContainer extends React.Component {
  componentDidMount() {
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

  resumeGame(gameId) {
    const socket = io.connect('localhost:3000')
    this.props.connectedToGame({ socket })

    socket.on('sessionExpired', this.props.logout)
    socket.on('userJoined', userInfo => {
      console.log(`${userInfo.username} has joined the lobby`)
    })
    socket.on('gameUpdate', (gameId, gameType, gameState) => {
      this.props.updateGameStateFromServer({ gameId, gameType, gameState })
    })

    socket.emit('joinGame', gameId)
  }

  async joinGame(gameId) {
    const userId = this.props.userId
    await axios.post('/gameplays', { gameId, userId })
    this.resumeGame(gameId)
  }

  createGame(name, numPlayers, useColorTemplate) {
    axios.post('/games', { name, numPlayers, useColorTemplate }).then(res => {
      const gameId = res.data.gameId
      this.joinGame(gameId)
    }).catch(err => {
      throw err
    })
  }

  render() {
    return (
      <Lobby
        activeGames={this.props.activeGames}
        availableGames={this.props.availableGames}
        joinGame={this.joinGame.bind(this)}
        createGame={this.createGame.bind(this)}
        resumeGame={this.resumeGame.bind(this)}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    userId: state.user.userId,
    activeGames: state.lobby.activeGames,
    availableGames: state.lobby.availableGames,
  }
}

export default connect(
  mapStateToProps,
  {
    logout,
    connectedToGame,
    updateGameStateFromServer,
    updateActiveGamesFromServer,
    receivedAvailableGamesFromServer,
  }
)(LobbyContainer)
