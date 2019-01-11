import _ from 'lodash'
import React from 'react'
import PropTypes from 'prop-types'

import { Turn, PlayerTurn, FactoryRefill } from 'models/turn'
import GameBoard from 'components/game-board'
import { DROPPED_TILE_PENALTIES, TILE_COLORS, NUM_TILES_OF_COLOR } from 'util/game-invariants'
import { shuffle, getNumFactories } from 'util/game-helpers'

export default class Azul extends React.Component {
  constructor(props) {
    super(props)

    const playerBoards = Array(props.numPlayers)
      .fill()
      .map(() => {
        return {
          stagingRows: Array(5)
            .fill()
            .map((_, index) => {
              return {
                tiles: Array(index + 1).fill(null),
                rowSize: index + 1,
              }
            }),
          finalRows: Array(5)
            .fill()
            .map(() => {
              return {
                tiles: Array(5).fill(null),
                rowSize: 5,
                requiredOrder: null,
              }
            }),
          brokenTiles: {
            rowSize: DROPPED_TILE_PENALTIES.length,
            tiles: Array(DROPPED_TILE_PENALTIES.length).fill(null),
          },
        }
      })

    const freshTiles = Array(TILE_COLORS.length * NUM_TILES_OF_COLOR)
      .fill()
      .map((_, index) => {
        return TILE_COLORS[index % TILE_COLORS.length]
      })

    const factories = Array(getNumFactories(props.numPlayers))
      .fill()
      .map(() => ({ tiles: [] }))

    this.state = {
      numPlayers: props.numPlayers,
      hasGameStarted: false,
      hasGameEnded: false,
      roundNumber: 0,
      turnNumber: 0,
      gameState: {
        playerBoards,
        freshTiles,
        discardTiles: [],
        tableTiles: [],
        factories,
      },
      turnHistory: [],
      historyIndex: 0,
    }
  }

  startGame() {
    this.shuffleTiles()
    this.fillFactories()
    this.setState({ hasGameStarted: true })
  }

  shuffleTiles() {
    let gameState = this.state.gameState
    gameState.freshTiles = shuffle(gameState.freshTiles)
    this.setState({ gameState })
  }

  fillFactories() {
    let gameState = this.state.gameState
    
    gameState.factories.forEach(factory => {
      _.times(4, () => {
        if (gameState.freshTiles.length > 0) {
          factory.tiles.push(gameState.freshTiles.pop())
        } else {
          gameState.freshTiles = shuffle(gameState.discardTiles)
        }
      })
    })
    
    let turnHistory = this.state.turnHistory
    const roundNumber = this.state.roundNumber + 1
    const factoryRefill = new FactoryRefill({ factories: gameState.factories })
    turnHistory.push(new Turn(roundNumber, 0, null, factoryRefill))
    const historyIndex = this.state.historyIndex + 1

    this.setState({ gameState, turnHistory, roundNumber, historyIndex })
  }

  removeTilesFromFactory(factory, selectedTiles, tableTiles) {
    const leftoverTiles = _.difference(factory.tiles, selectedTiles)
    tableTiles = tableTiles.concat(leftoverTiles)
    factory.tiles = []
  }

  addSelectedTilesToRow(selectedTiles, targetRow, brokenTiles, discardTiles) {
    const numFreeSquaresInRow = targetRow.tiles.filter(t => t === null).length
    selectedTiles.forEach(tile => {
      // First attempt to add to row
      let availableIndex = _.indexOf(targetRow.tiles, null)
      if (availableIndex !== -1) {
        targetRow.tiles[availableIndex] = tile
        return
      }

      // If there is space in the staging row, attempt to add to broken tiles row
      availableIndex = _.indexOf(brokenTiles.tiles, null)
      if (availableIndex !== -1) {
        brokenTiles.tiles[availableIndex] = tile
        return
      }

      // If there is no space in either staging row or broken tiles row, discard the tile
      discardTiles.push(tile)
    })
  }

  takeTurn(playerIndex, factoryId, selectedTiles, targetRowIndex) {
    let gameState = this.state.gameState
    const targetRow = targetRowIndex === -1 ? 
      gameState.playerBoards[playerIndex].brokenTiles : 
      gameState.playerBoards[playerIndex].stagingRows[targetRowIndex]
    const brokenTiles = gameState.playerBoards[playerIndex].brokenTiles
    const factory = gameState.factories[factoryId]
    const { tableTiles, discardTiles } = gameState

    this.removeTilesFromFactory(factory, selectedTiles, tableTiles)
    this.addSelectedTilesToRow(selectedTiles, targetRow, brokenTiles, discardTiles)

    let turnHistory = this.state.turnHistory
    const turnNumber = this.state.turnNumber + 1
    const playerTurn = new PlayerTurn(0, factoryId, selectedTiles[0], selectedTiles.length, targetRowIndex)
    turnHistory.push(new Turn(this.state.roundNumber, turnNumber, playerTurn, null))
    const historyIndex = this.state.historyIndex + 1

    this.setState({ gameState, turnHistory, turnNumber, historyIndex })
  }

  render() {
    const gameState = this.state.gameState
    const startGameButton = this.state.hasGameStarted ? null : (
      <button onClick={() => this.startGame()}>Start Game</button>
    )

    return (
      <div className="azul">
        Azul
        {startGameButton}
        <GameBoard {...gameState} takeTurn={this.takeTurn.bind(this)} />
      </div>
    )
  }
}

Azul.propTypes = {
  numPlayers: PropTypes.number.isRequired
}
