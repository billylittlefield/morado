import React from 'react'
import { connect } from 'react-redux'

import { refillFactories, pullAndStageTiles, transferTiles } from 'redux/actions'
import { TILE_PULL } from '@shared/azul/game-invariants'
import Azul from 'components/presentation/Azul'

class AzulContainer extends React.Component {
  pullAndStageTiles(payload) {
    const { factoryIndex, tileColor, targetRowIndex } = payload
    const { roundNumber, turnNumber, activeSeatIndex } = this.props.gameState
    const gameAction = {
      type: TILE_PULL,
      roundNumber,
      turnNumber,
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
  const { userInfo, socket } = ownProps
  return { userInfo, socket, gameState: state.currentGame.gameState }
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
