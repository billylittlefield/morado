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
    this.state = { selectedTiles: [] }
  }

  componentDidUpdate() {
    this.props.tileList.forEach(t => {
      t.setParent(this)
    })
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

  selectTile(tile) {
    let selectedTiles = []
    if (!this.state.selectedTiles.includes(tile)) {
      selectedTiles = this.props.tileList.filter(t => {
        return (
          t.groupName === tile.groupName &&
          t.groupIndex === tile.groupIndex &&
          [tile.color, STARTING_PLAYER].includes(t.color)
        )
      })
    }
    this.setState({ selectedTiles })
    this.props.selectTiles(selectedTiles)
  }

  placeTilesFromFactoryOrTable(targetRowIndex) {
    const factoryIndex = this.state.selectedTiles[0].groupName === 'table' ? -1 : this.state.selectedTiles[0].groupIndex
    this.props.pullAndStageTiles({
      factoryIndex,
      tileColor: _.reject(this.state.selectedTiles, { color: STARTING_PLAYER })[0].color,
      targetRowIndex,
    })

    this.setState({ selectedTiles: [] })
  }

  transferTileToFinalRow(rowIndex, columnIndex, tileColor, seatIndex) {
    this.props.transferTiles({
      rowIndex,
      columnIndex,
      tileColor,
      seatIndex,
    })
  }

  renderTiles() {
    const smallTileBoards = this.getOpponents().map(o => `p${o.seatIndex}`)
    return this.props.tileList.map(tile => {
      const isHighlighted = this.state.selectedTiles.includes(tile)
      const highlightClass = isHighlighted ? ' highlight' : ''
      const sizeClass = smallTileBoards.includes(tile.boardName) ? ' tile-small' : ''
      return (
        <svg
          id={tile.id}
          key={tile.id}
          className={`tile tile-${tile.color}${highlightClass}${sizeClass}`}>
          <path
            stroke="#fff"
            strokeWidth="2px"
            d={tile.topFacePath}
            onClick={() => this.selectTile(tile)}
          />
          <path stroke="#fff" strokeWidth="2px" d={tile.leftFacePath} />
          <path stroke="#fff" strokeWidth="2px" d={tile.rightFacePath} />
        </svg>
      )
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
            <FactoryList factories={this.props.factories} tableTiles={this.props.tableTiles} />
            <PlayerBoard
              player={userPlayer}
              activeSeatIndex={this.props.activeSeatIndex}
              selectedTiles={this.state.selectedTiles}
              placeTilesFromFactoryOrTable={this.placeTilesFromFactoryOrTable.bind(this)}
              transferTileToFinalRow={this.transferTileToFinalRow.bind(this)}
              rowsPendingTileTransfer={rowsPendingTileTransfer}
            />
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
