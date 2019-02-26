import React from 'react'
import _ from 'lodash'

import GameBoard from 'components/presentation/GameBoard'
import { REQUIRED_ORDER } from '@shared/azul/game-invariants'

export default class Azul extends React.Component {
  componentDidUpdate() {
    if (this.isRoundOver()) {
      this.transferTiles()
      this.refillFactories()
    }
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
            // new TileTransfer(
            //   this.props.round,
            //   this.props.turn,
            //   playerIndex,
            //   rowIndex,
            //   columnIndex,
            //   tileColor
            // )
          )
        }
      })
    })

    this.props.transferTiles(transfers)
  }
  
  isRoundOver() {
    return _.every(this.props.factories, ['length', 0]) && this.props.tableTiles.length === 0
  }

  render() {
    let nextMoveText;
    if (this.props.currentRoundNumber === 0 && this.props.currentTurnNumber === 0) {
      nextMoveText = 'Waiting for game to begin'
    } else {
      const activePlayer = _.find(this.props.players, ['seatIndex', this.props.activeSeatIndex])
      nextMoveText = `${activePlayer.username}'s move`
    }
    return (
      <div className="azul">
        <div>Game: {this.props.options.name}</div>
        <div>Round: {this.props.currentRoundNumber}</div>
        <div>Turn: {this.props.currentTurnNumber}</div>
        <div>{nextMoveText}</div>
        <GameBoard
          userInfo={this.props.userInfo}
          players={this.props.players}
          activeSeatIndex={this.props.activeSeatIndex}
          freshTiles={this.props.freshTiles}
          factories={this.props.factories}
          discardTiles={this.props.discardTiles}
          tableTiles={this.props.tableTiles}
          pullAndStageTiles={this.props.pullAndStageTiles.bind(this)}
        />
      </div>
    )
  }
}
