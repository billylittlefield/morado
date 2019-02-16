import React from 'react'
import { connect } from 'react-redux'
import io from 'socket.io-client'
import axios from 'axios'
import _ from 'lodash'
import moment from 'moment'

import { logout, updateGameStateFromServer, updateAllGamesFromServer } from 'redux/actions'

let socket

class Lobby extends React.Component {
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
    socket = io.connect('localhost:3000')

    socket.on('sessionExpired', this.props.logout)

    socket.on('userJoined', userInfo => {
      console.log(`${userInfo.username} has joined the lobby`)
    })

    socket.on('gameUpdate', (gameId, gameType, gameState) => {
      this.props.updateGameStateFromServer({ gameId, gameType, gameState })
    })

    if (gameId === null) {
      socket.emit('queueToPlay')
    } else {
      socket.emit('joinGame', gameId)
    }
  }

  renderExistingGames() {
    return (
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Players</th>
            <th>Round</th>
            <th>Turn</th>
            <th>Started</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {this.props.allGames.map((game, index) => {
          return (
            <tr key={index}>
              <td>{game.options.name}</td>
              <td>{_.map(game.players, 'username').join(', ')}</td>
              <td>{game.latestRound}</td>
              <td>{game.latestTurn + 1}</td>
              <td>{moment(game.startTime).format('h:ma M/D/YY')}</td>
              <td><button onClick={() => { this.joinGame(game.gameId) }}>Join</button></td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }

  render() {
    return (
      <section className="lobby">
        <div className="new-game">
          Start a new game: <button onClick={this.joinGame}>Join Game</button>
        </div>
        <div className="existing-games">
          Your existing games: {this.renderExistingGames()}
        </div>
      </section>
    )
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
  { logout, updateGameStateFromServer, updateAllGamesFromServer }
)(Lobby)
