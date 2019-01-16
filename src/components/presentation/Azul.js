import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import { Turn, PlayerTurn, FactoryRefill } from 'models/turn'
import GameBoard from 'components/presentation/GameBoard'
import {
  COLOR_TEMPLATE,
  DROPPED_TILE_PENALTIES,
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
} from 'util/game-invariants'
import { shuffle, getNumFactories } from 'util/game-helpers'

export default class Azul extends React.Component {
  startGame() {
    this.props.refillFactories()
  }

  render() {
    const startGameButton =
      <button onClick={() => this.startGame()}>Start Game</button>

    return (
      <div className="azul">
        Azul
        {startGameButton}
        <button onClick={() => this.undoMove()}>Undo</button>
        <button onClick={() => this.redoMove()}>Redo</button>
        <GameBoard
          playerBoards={this.props.playerBoards}
          freshTiles={this.props.freshTiles}
          factories={this.props.factories}
          discardTiles={this.props.discardTiles}
          tableTiles={this.props.tableTiles}
          pullTiles={this.props.pullTiles}
          stageTiles={this.props.stageTiles}
        />
      </div>
    )
  }
}

Azul.propTypes = {
  numPlayers: PropTypes.number.isRequired,
}
