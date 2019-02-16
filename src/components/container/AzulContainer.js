import { connect } from 'react-redux'

import { refillFactories, pullAndStageTiles, transferTiles } from 'redux/actions'
import Azul from 'components/presentation/Azul'

const mapStateToProps = state => {
  return { ...state.currentGame.gameState }
}

const mapDispatchToProps = dispatch => {
  return {
    refillFactories: payload => dispatch(refillFactories(payload)),
    pullAndStageTiles: payload => dispatch(pullAndStageTiles(payload)),
    transferTiles: payload => dispatch(transferTiles(payload)),
  }
}

const AzulContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Azul)

export default AzulContainer
