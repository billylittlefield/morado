import React from 'react'
import axios from 'axios'
import io from 'socket.io-client'
import { connect } from 'react-redux'
import _ from 'lodash'
import Tether from 'tether'

import {
  connectedToGame,
  receiveGameState,
  refillFactories,
  pullAndStageTiles,
  transferTiles,
  receiveGameActions,
} from 'redux/actions'
import { TILE_PULL, TILE_TRANSFER, DROPPED_TILE_PENALTIES } from '@shared/azul/game-invariants'
import Azul from 'components/presentation/Azul'

class AzulContainer extends React.Component {
  state = {
    tileList: [],
  }

  componentDidMount() {
    const gameId = this.props.gameId

    // Load game state
    axios.get(`/games/azul/${gameId}`).then(res => {
      this.props.receiveGameState({ ...res.data })
      this.setInitialTiles({ ...res.data.gameState })

      // Check if the current user is in this game
      if (_.find(res.data.gameState.players, ['userId', this.props.userInfo.userId])) {
        // If so, setup websocket for game
        const socket = io.connect('localhost:3000')
        this.props.connectedToGame({ socket })

        socket.on('sessionExpired', this.props.logout)
        socket.on('userJoined', userInfo => {
          console.log(`${userInfo.username} has joined the lobby`)
        })
        socket.on('endOfRound', roundNumber => {
          console.log(`End of round ${roundNumber}`)
        })
        socket.on('startOfRound', roundNumber => {
          console.log(`Start of round ${roundNumber}`)
        })
        socket.on('gameUpdate', gameState => {
          this.validateGameState(gameState)
        })
        socket.on('transferTiles', gameAction => {
          this.props.transferTiles(gameAction)
          this.updateTethers(gameAction)
        })
        socket.on('pullAndStageTiles', gameAction => {
          this.props.pullAndStageTiles(gameAction)
          this.updateTethers(gameAction)
        })
        socket.on('gameActions', gameActions => {
          this.props.receiveGameActions(gameActions)
          this.updateTethers(gameActions)
        })

        socket.emit('joinGame', gameId)
      }
    })
  }
  componentWillUnmount() {
    this.props.socket.emit('leaveGame', this.props.gameId)
  }

  validateGameState(gameState) {
    if (!_.isEqual(gameState, this.props.gameState)) {
      console.log('houston we have a mismatch')
      this.props.receiveGameState({ gameState })
    }
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
  setInitialTiles(gameState) {
    let tileList = []
    gameState.factories.forEach((factory, factoryIndex) => {
      factory.forEach((tileColor, positionIndex) => {
        tileList.push({
          id: this.getUniqueId(),
          targetLocation: `f${factoryIndex}${positionIndex}`,
          tileColor,
        })
      })
    })
    gameState.tableTiles.forEach((tileColor, positionIndex) => {
      tileList.push({
        id: this.getUniqueId(),
        targetLocation: `t${positionIndex}`,
        tileColor,
      })
    })
    gameState.players.forEach((player, seatIndex) => {
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

    this.setState({ tileList })
    this.initializeTethers()
  }

  initializeTethers() {
    let tileList = this.state.tileList.map(tile => ({
      ...tile,
      tether:
        tile.tether ||
        new Tether({
          element: `#${tile.id}`,
          target: `#${tile.targetLocation}`,
          attachment: 'top left',
          targetAttachment: 'top left',
        }),
    }))

    this.setState({ tileList })
  }

  updateTethers(gameAction) {
    const { params } = gameAction
    switch (gameAction.type) {
      case 'FACTORY_REFILL':
        // this.addTiles(params)
        break
      case 'TILE_PULL':
        this.updateTethersForTilePull(params)
        break
      case 'TILE_TRANSFER':
        // this.transferTiles(params)
        break
      case 'TILE_DUMP':
        // this.dumpTiles()
        break
    }
  }

  updateTethersForTilePull(params) {
    const { seatIndex, factoryIndex, tileColor, targetRowIndex } = params
    const tileList = this.state.tileList
    const brokenTiles = tileList.filter(t => t.targetLocation.startsWith(`p${seatIndex}b`))
    const targetRowTiles = targetRowIndex === -1 ? brokenTiles : tileList.filter(t => t.targetLocation.startsWith(`p${seatIndex}s${targetRowIndex}`))
    const currentRowCount = targetRowTiles.length
    const currentBrokenTileCount = brokenTiles.length
    let numToBrokenTiles = 0
    let tileIdsToRemove = []

    const tilesToPlayer = this.state.tileList.filter(tile => {
      if (tile.tileColor !== tileColor) {
        return false
      }
      if (factoryIndex === -1) {
        return tile.targetLocation.startsWith('t')
      } else {
        return tile.targetLocation.startsWith(`f${factoryIndex}`)
      }
    })
    const tilesToTable = factoryIndex === -1 ? [] : this.state.tileList.filter(tile => {
      return tile.targetLocation.startsWith(`f${factoryIndex}`) && tile.tileColor !== tileColor
    })
    tilesToPlayer.forEach((tile, index) => {
      if (currentRowCount + index <= targetRowIndex) {
        tile.targetLocation = `p${seatIndex}s${targetRowIndex}${currentRowCount + index}`
        tile.tether.setOptions({
          element: `#${tile.id}`,
          target: `#${tile.targetLocation}`,
          attachment: 'top left',
          targetAttachment: 'top left',
        })
      } else if (currentBrokenTileCount + numToBrokenTiles <= DROPPED_TILE_PENALTIES.length) {
        tile.targetLocation = `p${seatIndex}b${currentBrokenTileCount + numToBrokenTiles}`
        tile.tether.setOptions({
          element: `#${tile.id}`,
          target: `#${tile.targetLocation}`,
          attachment: 'top left',
          targetAttachment: 'top left',
        })
        numToBrokenTiles++
      } else {
        tileIdsToRemove.push(tile.id)
      }
    })

    tilesToTable.concat(this.state.tileList.filter(t => t.targetLocation.startsWith('t'))).forEach((tile, index) => {
      tile.targetLocation = `t${index}`
      tile.tether.setOptions({
        element: `#${tile.id}`,
        target: `#${tile.targetLocation}`,
        attachment: 'top left',
        targetAttachment: 'top left',
      })
    })

    _.remove(this.state.tileList, t => tileIdsToRemove.includes(t.id))
  }

  pullAndStageTiles(args) {
    const { currentRoundNumber, currentTurnNumber, activeSeatIndex } = this.props.gameState
    const { factoryIndex, tileColor, targetRowIndex } = args

    const gameAction = {
      type: TILE_PULL,
      roundNumber: currentRoundNumber,
      turnNumber: currentTurnNumber,
      params: {
        seatIndex: activeSeatIndex,
        factoryIndex,
        tileColor,
        targetRowIndex,
      },
    }
    // Update local state:
    this.props.pullAndStageTiles(gameAction)
    // Update server state:
    this.props.socket.emit('pullAndStageTiles', gameAction)
    // Update tiles:
    this.updateTethersForTilePull(gameAction.params)
  }

  transferTiles(args) {
    const { seatIndex, rowIndex, columnIndex, tileColor } = args
    const { currentRoundNumber } = this.props.gameState

    const gameAction = {
      type: TILE_TRANSFER,
      roundNumber: currentRoundNumber,
      params: {
        rowIndex,
        columnIndex,
        tileColor,
        seatIndex,
      },
    }

    // Update local state:
    this.props.transferTiles(gameAction)
    // Update server state:
    this.props.socket.emit('transferTiles', gameAction)
  }

  render() {
    if (!this.props.gameState) {
      return <div>Loading...</div>
    }
    return (
      <Azul
        {...this.props.gameState}
        tileList={this.state.tileList}
        userInfo={this.props.userInfo}
        pullAndStageTiles={this.pullAndStageTiles.bind(this)}
        transferTiles={this.transferTiles.bind(this)}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const userInfo = state.userInfo
  const socket = state.currentGame.socket
  const gameState = state.currentGame.gameState
  const gameId = ownProps.match.params.gameId
  return { userInfo, socket, gameState, gameId }
}

export default connect(
  mapStateToProps,
  {
    receiveGameState,
    connectedToGame,
    refillFactories,
    pullAndStageTiles,
    transferTiles,
    receiveGameActions,
  }
)(AzulContainer)
