import React from 'react'
import { connect } from 'react-redux'

import { refillFactories, pullAndStageTiles, transferTiles } from 'redux/actions'
import { TILE_PULL } from '@shared/azul/game-invariants'
import Azul from 'components/presentation/Azul'

class AzulContainer extends React.Component {
  pullAndStageTiles(payload) {
    const { factoryIndex, tileColor, targetRowIndex } = payload
    debugger
    const gameAction = {
      type: TILE_PULL,
      roundNumber: this.props.currentRoundNumber,
      turnNumber: this.props.currentTurnNumber,
      params: {
        seatIndex: this.props.activeSeatIndex,
        factoryIndex,
        tileColor,
        targetRowIndex
      }
    }
    this.props.pullAndStageTiles(gameAction)
    this.props.socket.emit('pullAndStageTiles', gameAction)
  }
  
  render() {
    return <Azul {...this.props} pullAndStageTiles={this.pullAndStageTiles.bind(this)} />
  }
}

const mapStateToProps = state => {
  return { ...state.currentGame.gameState, socket: state.currentGame.socket }
}

const mapDispatchToProps = dispatch => {
  return {
    refillFactories: payload => dispatch(refillFactories(payload)),
    pullAndStageTiles: payload => dispatch(pullAndStageTiles(payload)),
    transferTiles: payload => dispatch(transferTiles(payload)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AzulContainer)
