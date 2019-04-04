import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'

import OpponentList from 'components/presentation/OpponentList'
import FactoryList from 'components/presentation/FactoryList'
import PlayerBoard from 'components/presentation/PlayerBoard'
import { STARTING_PLAYER } from '@shared/azul/game-invariants'

export default class Azul extends React.Component {
  constructor(props) {
    super(props)
  }

  getUserPlayer() {
    return _.find(this.props.players, { userId: this.props.userInfo.userId })
  }

  getActivePlayer() {
    return _.find(this.props.players, { seatIndex: this.props.activeSeatIndex })
  }

  getOpponents() {
    const userPlayer = this.getUserPlayer()
    return _.reject(this.props.players, opponent => opponent === userPlayer)
  }

  placeTilesFromFactoryOrTable(targetRowIndex) {
    const selectedTiles = this.props.selectedTiles
    const factoryIndex = selectedTiles[0].groupName === 'table' ? -1 : selectedTiles[0].groupIndex
    this.props.pullAndStageTiles({
      factoryIndex,
      tileColor: _.reject(selectedTiles, { color: STARTING_PLAYER })[0].color,
      targetRowIndex,
    })
  }

  transferTileToFinalRow(rowIndex, columnIndex, tileColor, seatIndex) {
    this.props.transferTiles({
      rowIndex,
      columnIndex,
      tileColor,
      seatIndex,
    })
  }

  render() {
    const userPlayer = this.getUserPlayer()
    const opponents = this.getOpponents()
    const rowsPendingTileTransfer =
      userPlayer && this.props.seatsRequiringInput[userPlayer.seatIndex]
    return (
      <>
        <Link to="/lobby">Back to Lobby</Link>
        <section className="azul">
          <div id="tile-container"></div>
          <div className="left-container">
            <PlayerBoard
              player={userPlayer}
              activeSeatIndex={this.props.activeSeatIndex}
              selectedTiles={this.props.selectedTiles}
              placeTilesFromFactoryOrTable={this.placeTilesFromFactoryOrTable.bind(this)}
              transferTileToFinalRow={this.transferTileToFinalRow.bind(this)}
              rowsPendingTileTransfer={rowsPendingTileTransfer}
            />
            <FactoryList factories={this.props.factories} tableTiles={this.props.tableTiles} />
          </div>

          <div className="right-container">
            <div className="game-info">
              <div>Game: {this.props.options.name}</div>
              <div>Round: {this.props.currentRoundNumber || '-'}</div>
              <div>Turn: {this.props.currentTurnNumber || '-'}</div>
              <div>{`${this.getActivePlayer().username}'s turn`}</div>
            </div>
            <OpponentList activeSeatIndex={this.props.activeSeatIndex} opponents={opponents} />
          </div>
        </section>
      </>
    )
  }
}
