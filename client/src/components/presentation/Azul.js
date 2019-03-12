import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'

import OpponentList from 'components/presentation/OpponentList'
import FactoryList from 'components/presentation/FactoryList'
import PlayerBoard from 'components/presentation/PlayerBoard'

export default class Azul extends React.Component {
  state = {
    selectedFactoryIndex: null,
    selectedTiles: [],
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
    const userPlayer = this.getUserPlayer()
    const isUsersTurn = userPlayer && (userPlayer.seatIndex === this.props.activeSeatIndex)
    if (!isUsersTurn) {
      return
    }

    if (this.state.selectedTiles[0] === tileColor && this.state.selectedFactoryIndex === factoryIndex) {
      // Undo selection
      this.setState({
        selectedFactoryIndex: null,
        selectedTiles: []
      })
    } else {
      // Select tiles in factory / broken tile row
      const { factories, tableTiles } = this.props
      const tileSet = factoryIndex !== -1 ? factories[factoryIndex] : tableTiles
      const tileCount = tileSet.filter(c => c === tileColor).length
      this.setState({
        selectedFactoryIndex: factoryIndex,
        selectedTiles: Array(tileCount).fill(tileColor)
      })
    }
  }

  selectPlacementRow(targetRowIndex) {
    this.props.pullAndStageTiles({
      factoryIndex: this.state.selectedFactoryIndex,
      tileColor: this.state.selectedTiles[0],
      targetRowIndex
    })

    this.setState({
      selectedFactoryIndex: null,
      selectedTiles: []
    })
  }

  render() {
    const userPlayer = this.getUserPlayer()
    const opponents = this.getOpponents()
    return (
      <>
        <Link to="/lobby">Back to Lobby</Link>
        <section className="azul">

          <div className="left-container">
            <FactoryList
              onTileSelectedInFactory={this.selectTileInFactory.bind(this)}
              selectedTileColor={this.state.selectedTiles[0] || null}
              selectedFactoryIndex={this.state.selectedFactoryIndex}
              factories={this.props.factories}
              tableTiles={this.props.tableTiles}
            />
            <PlayerBoard 
              player={userPlayer}
              activeSeatIndex={this.props.activeSeatIndex}
              selectedTiles={this.state.selectedTiles}
              onRowSelected={this.selectPlacementRow.bind(this)}
            />
          </div>

          <div className="right-container">
            <div className="game-info">
              <div>Game: {this.props.options.name}</div>
              <div>Round: {this.props.currentRoundNumber}</div>
              <div>Turn: {this.props.currentTurnNumber}</div>
              <div>{`${this.getActivePlayer().username}'s turn`}</div>
            </div>
            <OpponentList
              activeSeatIndex={this.props.activeSeatIndex}
              opponents={opponents}
            />
          </div>

        </section>
      </>
    )
  }
}

// componentDidUpdate() {
//   if (this.isRoundOver()) {
//     this.transferTiles()
//     this.refillFactories()
//   }
// }

// transferTiles() {
//   let transfers = []

//   this.props.players.forEach((player, playerIndex) => {
//     player.stagingRows.forEach((stagingRow, rowIndex) => {
//       const isStagingRowFull =
//         stagingRow.rowSize === stagingRow.tiles.filter(t => t !== null).length
//       if (!isStagingRowFull) {
//         return
//       }

//       const tileColor = stagingRow.tiles[0]
//       const isStagingRowUniform = _.every(stagingRow.tiles, t => t === tileColor)
//       if (!isStagingRowUniform) {
//         throw new Error('Staging row should only contain 1 color of tile')
//       }

//       const isSpotFilled = player.finalRows[rowIndex].tiles.includes(tileColor)
//       if (!isSpotFilled) {
//         const columnIndex = REQUIRED_ORDER[rowIndex].indexOf(tileColor)
//         transfers
//           .push
//           new TileTransfer(
//             this.props.round,
//             this.props.turn,
//             playerIndex,
//             rowIndex,
//             columnIndex,
//             tileColor
//           )
//           ()
//       }
//     })
//   })

//   this.props.transferTiles(transfers)
// }

// isRoundOver() {
//   return _.every(this.props.factories, ['length', 0]) && this.props.tableTiles.length === 0
// }
