import { connect } from 'react-redux'

import getGameState from 'redux/reducers'
import { shuffleTiles, refillFactories, pullTiles, stageTiles, transferTiles } from 'redux/actions'
import Azul from 'components/presentation/Azul'

const mapStateToProps = state => {
  return { ...state }
}

const mapDispatchToProps = dispatch => {
  return {
    shuffleTiles: payload => dispatch(shuffleTiles(payload)),
    refillFactories: payload => dispatch(refillFactories(payload)),
    pullTiles: payload => dispatch(pullTiles(payload)),
    stageTiles: payload => dispatch(stageTiles(payload)),
    // transferTiles: payload => dispatch(transferTiles(payload)),
    // refillFactories: payload => dispatch(refillFactories(payload))
  }
}

const AzulContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Azul)

export default AzulContainer
