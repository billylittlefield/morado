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
    this.state = {
      selectedFactoryIndex: null,
      selectedTiles: [],
    }
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

  // selectTileInFactory(tile) {
  //   if (tile.isStartingPlayer || !tile.isCommunalTile) {
  //     return
  //   }
  //   const userPlayer = this.getUserPlayer()
  //   const isUsersTurn = userPlayer && userPlayer.seatIndex === this.props.activeSeatIndex
  //   if (!isUsersTurn) {
  //     return
  //   }

  //   if (
  //     this.state.selectedTiles[0] === tile.color &&
  //     this.state.selectedFactoryIndex === (tile.groupName === 't' ? -1 : tile.groupIndex)
  //   ) {
  //     // Undo selection
  //     this.setState({
  //       selectedFactoryIndex: null,
  //       selectedTiles: [],
  //     })
  //   } else {
  //     // Select tiles in factory / broken tile row
  //     const { factories, tableTiles } = this.props
  //     const tileSet = tile.groupName === 'table' ? tableTiles : factories[tile.groupIndex]
  //     const selectedTiles = tileSet.filter(c => c === tile.color || c === STARTING_PLAYER)
  //     this.setState({
  //       selectedFactoryIndex: tile.groupName === 'table' ? -1 : tile.groupIndex,
  //       selectedTiles,
  //     })

  //   }
  // }

  selectTileInFactory(tile) {
    let selectedTiles = this.props.tileList.filter(t => {
      return (
        t.groupName === tile.groupName &&
        t.groupIndex === tile.groupIndex &&
        [tile.color, STARTING_PLAYER].includes(t.color)
      )
    })

    this.setState({ selectedTiles })
  }

  placeTilesFromFactoryOrTable(targetRowIndex) {
    this.props.pullAndStageTiles({
      factoryIndex: this.state.selectedFactoryIndex,
      tileColor: this.state.selectedTiles[0],
      targetRowIndex,
    })

    this.setState({
      selectedFactoryIndex: null,
      selectedTiles: [],
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

  renderTiles() {
    const smallTileBoards = this.getOpponents().map(o => `p${o.seatIndex}`)
    return this.props.tileList.map(tile => {
      let isHighlighted = false
      if (this.state.selectedFactoryIndex !== null) {
        if (this.state.selectedFactoryIndex === -1) {
          isHighlighted =
            tile.groupName === 'table' && this.state.selectedTiles.includes(tile.color)
        } else {
          isHighlighted =
            tile.groupName === 'factory' &&
            tile.groupIndex === this.state.selectedFactoryIndex &&
            this.state.selectedTiles.includes(tile.color)
        }
      }
      const highlightClass = isHighlighted ? ' highlight' : ''
      const sizeClass = smallTileBoards.includes(tile.boardName) ? ' tile-small' : ''
      return (
        <svg
          id={tile.id}
          key={tile.id}
          onClick={() => this.selectTileInFactory(tile)}
          className={`tile tile-${tile.color}${highlightClass}${sizeClass}`}>
          <path id="top-face" stroke="#fff" strokeWidth="2px" d={tile.topFacePath} />
          <path id="left-face" stroke="#fff" strokeWidth="2px" d={tile.leftFacePath} />
          <path id="right-face" stroke="#fff" strokeWidth="2px" d={tile.rightFacePath} />
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
          <div className="tile-container">{this.renderTiles()}</div>
          <div className="left-container">
            <FactoryList
              selectedTiles={this.state.selectedTiles}
              selectedFactoryIndex={this.state.selectedFactoryIndex}
              factories={this.props.factories}
              tableTiles={this.props.tableTiles}
            />
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
