import React from 'react'
import { connect } from 'react-redux'
import io from 'socket.io-client'
import axios from 'axios'
import _ from 'lodash'

import Lobby from 'components/presentation/Lobby'
import { logout, connectedToGame, updateGameStateFromServer, updateAllGamesFromServer } from 'redux/actions'

class LobbyContainer extends React.Component {
  componentDidMount() {
    axios
      .get(`/users/${this.props.userId}/games`)
      .then(res => {
        const { games } = res.data
        this.props.updateAllGamesFromServer(games)
      })
      .catch(err => {
        throw err
      })
  }

  joinGame(gameId) {
    const socket = io.connect('localhost:3000')
    this.props.connectedToGame({ socket })

    socket.on('sessionExpired', this.props.logout)
    socket.on('userJoined', userInfo => {
      console.log(`${userInfo.username} has joined the lobby`)
    })
    socket.on('gameUpdate', (gameId, gameType, gameState) => {
      this.props.updateGameStateFromServer({ gameId, gameType, gameState })
    })

    if (!gameId) {
      socket.emit('queueToPlay')
    } else {
      socket.emit('joinGame', gameId)
    }
  }

  render() {
    return <Lobby allGames={this.props.allGames} joinGame={this.joinGame.bind(this)} />
  }
}

function mapStateToProps(state) {
  return {
    userId: state.user.userId,
    allGames: state.allGames,
  }
}

export default connect(
  mapStateToProps,
  { logout, connectedToGame, updateGameStateFromServer, updateAllGamesFromServer }
)(LobbyContainer)
