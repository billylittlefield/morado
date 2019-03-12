import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { connect } from 'react-redux'

import { connectedToGame, receiveGameState, refillFactories, pullAndStageTiles, transferTiles } from 'redux/actions'
import { TILE_PULL } from '@shared/azul/game-invariants'
import Azul from 'components/presentation/Azul'

class AzulContainer extends React.Component {
  componentDidMount() {
    const gameId = this.props.gameId

    // Load game state
    axios.get(`/games/azul/${gameId}`).then(res => {
      this.props.receiveGameState({ ...res.data })
      
      // Check if the current user is in this game
      if (_.find(res.data.gameState.players, ['userId', this.props.userInfo.userId])) {

        // If so, setup websocket for game
        const socket = io.connect('localhost:3000')
        this.props.connectedToGame({ socket })
    
        socket.on('sessionExpired', this.props.logout)
        socket.on('userJoined', userInfo => {
          console.log(`${userInfo.username} has joined the lobby`)
        })
        socket.on('gameUpdate', (gameId, gameType, gameState) => {
          this.props.receiveGameState({ gameId, gameType, gameState })
        })
    
        socket.emit('joinGame', gameId)
      }
    })
  }
  
  pullAndStageTiles(payload) {
    const { factoryIndex, tileColor, targetRowIndex } = payload
    const { currentRoundNumber, currentTurnNumber, activeSeatIndex } = this.props.gameState
    const gameAction = {
      type: TILE_PULL,
      roundNumber: currentRoundNumber,
      turnNumber: currentTurnNumber,
      params: {
        seatIndex: activeSeatIndex,
        factoryIndex,
        tileColor,
        targetRowIndex,
      },
    }
    // Update local state:
    this.props.pullAndStageTiles(gameAction)
    // Update server state:
    this.props.socket.emit('pullAndStageTiles', gameAction)
  }

  render() {
    if (!this.props.gameState) {
      return <div>Loading...</div>
    }
    return (
      <Azul
        {...this.props.gameState}
        userInfo={this.props.userInfo}
        pullAndStageTiles={this.pullAndStageTiles.bind(this)}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const userInfo = state.userInfo
  const socket = state.currentGame.socket
  const gameState = state.currentGame.gameState
  const gameId = ownProps.match.params.gameId
  return { userInfo, socket, gameState, gameId }
}

export default connect(
  mapStateToProps,
  { receiveGameState, connectedToGame, refillFactories, pullAndStageTiles, transferTiles }
)(AzulContainer)
