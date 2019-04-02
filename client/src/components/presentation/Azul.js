import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import Tether from 'tether'

import OpponentList from 'components/presentation/OpponentList'
import FactoryList from 'components/presentation/FactoryList'
import PlayerBoard from 'components/presentation/PlayerBoard'
import TilePieces from 'components/presentation/TilePieces'
import { STARTING_PLAYER } from '@shared/azul/game-invariants'

export default class Azul extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedFactoryIndex: null,
      selectedTiles: [],
    }
  }

  initializeTileMap() {
    let tileList = []
    this.props.factories.forEach((factory, factoryIndex) => {
      factory.forEach((tileColor, positionIndex) => {
        tileList.push({
          id: this.getUniqueId(),
          targetLocation: `f${factoryIndex}${positionIndex}`,
          tileColor,
        })
      })
    })
    this.props.players.forEach((player, seatIndex) => {
      player.stagingRows.forEach((stagingRow, rowIndex) => {
        stagingRow.tiles.forEach((tileColor, positionIndex) => {
          if (tileColor === null) {
            return
          }
          tileList.push({
            id: this.getUniqueId(),
            targetLocation: `p${seatIndex}s${rowIndex}${positionIndex}`,
            tileColor,
          })
        })
      })
      player.finalRows.forEach((finalRow, rowIndex) => {
        finalRow.tiles.forEach((tileColor, positionIndex) => {
          if (tileColor === null) {
            return
          }
          tileList.push({
            id: this.getUniqueId(),
            targetLocation: `p${seatIndex}f${rowIndex}${positionIndex}`,
            tileColor,
          })
        })
      })
      player.brokenTiles.forEach((tileColor, positionIndex) => {
        if (tileColor === null) {
          return
        }
        tileList.push({
          id: this.getUniqueId(),
          targetLocation: `p${seatIndex}b${positionIndex}`,
          tileColor,
        })
      })
    })

    tileList.forEach(t => (this.tileMap[t.id] = { ...t }))
  }

  // componentDidUpdate() {
  //   this.updateTethers()
  // }

  updateTethers() {
    const tileMap = this.tileMap

    visibleTiles.forEach(tile => {
      // update existing tethers
      let tileMapRecord = tileMap[tile.id]
      if (tileMapRecord) {
        tileMapRecord.tether.setOptions({
          ...tether.options,
          target: `#${tile.targetLocation}`,
        })
      } else {
        // create new tethers
        tileMap[tile.id] = {
          tether: new Tether({
            element: `#${tile.id}`,
            target: `#${tile.targetLocation}`,
            attachment: 'top left',
            targetAttachment: 'top left',
          }),
        }
      }
    })

    // remove old tethers
    _.difference(Object.keys(tileMap), _.map(visibleTiles, 'id')).forEach(keyToRemove => {
      tileMap[keyToRemove].tether.destroy()
      delete tileMap[keyToRemove]
    })
  }

  getUniqueId() {
    return (
      '_' +
      Math.random()
        .toString(36)
        .substr(2, 9) +
      '_' +
      Math.random()
        .toString(36)
        .substr(2, 9)
    )
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

  selectTileInFactory(tileColor, factoryIndex) {
    if (tileColor === STARTING_PLAYER) {
      return
    }
    const userPlayer = this.getUserPlayer()
    const isUsersTurn = userPlayer && userPlayer.seatIndex === this.props.activeSeatIndex
    if (!isUsersTurn) {
      return
    }

    if (
      this.state.selectedTiles[0] === tileColor &&
      this.state.selectedFactoryIndex === factoryIndex
    ) {
      // Undo selection
      this.setState({
        selectedFactoryIndex: null,
        selectedTiles: [],
      })
    } else {
      // Select tiles in factory / broken tile row
      const { factories, tableTiles } = this.props
      const tileSet = factoryIndex !== -1 ? factories[factoryIndex] : tableTiles
      const selectedTiles = tileSet.filter(c => c === tileColor)
      if (factoryIndex === -1 && this.props.firstSeatNextRound === null) {
        selectedTiles.push(STARTING_PLAYER)
      }
      this.setState({
        selectedFactoryIndex: factoryIndex,
        selectedTiles,
      })
    }
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

  render() {
    const userPlayer = this.getUserPlayer()
    const opponents = this.getOpponents()
    const rowsPendingTileTransfer =
      userPlayer && this.props.seatsRequiringInput[userPlayer.seatIndex]
    return (
      <>
        <Link to="/lobby">Back to Lobby</Link>
        <section className="azul">
          <div className="tile-container">
            {this.props.tileList.map(t => <div key={t.id} className={`tile tile-${t.tileColor}`} id={t.id} />)}
          </div>
          <div id="tile-container" />
          <div className="left-container">
            <FactoryList
              onTileSelectedInFactory={this.selectTileInFactory.bind(this)}
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
