import React from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

import GameBoard from 'components/presentation/GameBoard'
import { shuffle } from 'util/game-helpers'
import { REQUIRED_ORDER } from 'util/game-invariants'
import { PlayerTurn, FactoryRefill, TileTransfer } from 'models/turn'

export default class Azul extends React.Component {
  refillFactories() {
    const shuffledFreshTiles = shuffle(this.props.freshTiles.slice())
    const shuffledDiscardTiles = shuffle(this.props.discardTiles.slice())

    const refilledFactories = this.props.factories.map(() => {
      const refilledFactory = []

      while (refilledFactory.length < 4) {
        if (shuffledFreshTiles.length > 0) {
          refilledFactory.push(shuffledFreshTiles.pop())
          continue
        }
        if (shuffledDiscardTiles.length > 0) {
          refilledFactory.push(shuffledDiscardTiles.pop())
          continue
        }
        break
      }

      return refilledFactory
    })

    const gameAction = new FactoryRefill(this.props.round, this.props.turn, refilledFactories)
    this.props.refillFactories(gameAction)
  }

  pullAndStageTiles({ factoryIndex, tileColor, targetRowIndex }) {
    const gameAction = new PlayerTurn(
      this.props.round,
      this.props.turn,
      this.props.activePlayerIndex,
      factoryIndex,
      tileColor,
      targetRowIndex
    )
    this.props.pullAndStageTiles(gameAction)
  }



  transferTiles() {
    let transfers = []

    this.props.playerBoards.forEach((playerBoard, playerIndex) => {
      playerBoard.stagingRows.forEach((stagingRow, rowIndex) => {
        const isStagingRowFull =
          stagingRow.rowSize === stagingRow.tiles.filter(t => t !== null).length
        if (!isStagingRowFull) {
          return
        }

        const tileColor = stagingRow.tiles[0]
        const isStagingRowUniform = _.every(stagingRow.tiles, t => t === tileColor)
        if (!isStagingRowUniform) {
          throw new Error('Staging row should only contain 1 color of tile')
        }

        const isSpotFilled = playerBoard.finalRows[rowIndex].tiles.includes(tileColor)
        if (!isSpotFilled) {
          const columnIndex = REQUIRED_ORDER[rowIndex].indexOf(tileColor)
          transfers.push(
            new TileTransfer(
              this.props.round,
              this.props.turn,
              playerIndex,
              rowIndex,
              columnIndex,
              tileColor
            )
          )
        }
      })
    })

    this.props.transferTiles(transfers)
  }
  
  isRoundOver() {
    return _.every(this.props.factories, ['length', 0]) && this.props.tableTiles.length === 0
  }

  componentDidUpdate() {
    if (this.isRoundOver()) {
      this.transferTiles()
      this.refillFactories()
    }
  }

  render() {
    return (
      <div className="azul">
        Azul
        <button onClick={() => this.refillFactories()}>Start Game</button>
        <GameBoard
          round={this.props.round}
          turn={this.props.turn}
          playerBoards={this.props.playerBoards}
          activePlayerIndex={this.props.activePlayerIndex}
          freshTiles={this.props.freshTiles}
          factories={this.props.factories}
          discardTiles={this.props.discardTiles}
          tableTiles={this.props.tableTiles}
          pullAndStageTiles={this.pullAndStageTiles.bind(this)}
        />
      </div>
    )
  }
}

Azul.propTypes = {
  numPlayers: PropTypes.number.isRequired,
}
