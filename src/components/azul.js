import _ from 'lodash'
import React from 'react'
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
      history: [
        {
          roundNumber: 1,
          turnNumber: 1,
          playerBoards,
          freshTiles,
          discardTiles: [],
          tableTiles: [],
          factories,
        },
      ],
      historyIndex: 0,
    }
  }

  getCurrentState() {
    return this.state.history[this.state.historyIndex]
  }

  startGame() {
    this.shuffleTiles()
    this.fillFactories()
    this.setState({ hasGameStarted: true })
  }

  shuffleTiles() {
    const history = this.state.history.slice(0, this.state.historyIndex + 1)
    const currentState = history[history.length - 1]
    shuffle(currentState.freshTiles)

    this.setState({ history })
  }

  fillFactories() {
    const history = this.state.history.slice(0, this.state.historyIndex + 1)
    const { factories, freshTiles, discardTiles } = history[history.length - 1]

    function addTileToFactory(factory) {
      if (freshTiles.length === 0) {
        freshTiles = shuffle(discardTiles)
      }
      factory.tiles.push(freshTiles.pop())
    }

    let factoriesFilled = false
    while (!factoriesFilled) {
      factories.forEach(factory => {
        if (factory.tiles.length < 4) {
          addTileToFactory(factory)
        }
      })

      // Exit loop if all factories are full, or if we're out of tiles to fill with
      factoriesFilled =
        factories.every(f => f.tiles.length === 4) ||
        (discardTiles.length === 0 && freshTiles.length === 0)
    }

    this.setState({ history })
  }

  removeTilesFromFactory(factory, selectedTiles, tableTiles) {
    const leftoverTiles = _.difference(factory.tiles, selectedTiles)
    tableTiles = tableTiles.concat(leftoverTiles)
    factory.tiles = []
  }

  addSelectedTilesToRow(selectedTiles, stagingRow, brokenTiles, discardTiles) {
    const numFreeSquaresInRow = stagingRow.tiles.filter(t => t === null).length
    selectedTiles.forEach(tile => {
      // First attempt to add to row
      let availableIndex = _.indexOf(stagingRow.tiles, null)
      if (availableIndex !== -1) {
        stagingRow.tiles[availableIndex] = tile
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

  takeTurn(playerIndex, factoryIndex, selectedTiles, rowIndex) {
    const history = this.state.history.slice(0, this.state.historyIndex + 1)
    let newState = _.cloneDeep(history[history.length - 1])
    const stagingRow = newState.playerBoards[playerIndex].stagingRows[rowIndex]
    const brokenTiles = newState.playerBoards[playerIndex].brokenTiles
    const factory = newState.factories[factoryIndex]
    const { tableTiles, discardTiles } = newState

    this.removeTilesFromFactory(factory, selectedTiles, tableTiles)
    this.addSelectedTilesToRow(selectedTiles, stagingRow, brokenTiles, discardTiles)

    newState.turnNumber++
    this.setState({ history: history.concat(newState), historyIndex: this.state.historyIndex + 1 })
  }

  render() {
    const currentState = this.state.history[this.state.historyIndex]
    const startGameButton = this.state.hasGameStarted ? null : (
      <button onClick={() => this.startGame()}>Start Game</button>
    )

    return (
      <div className="azul">
        Azul
        {startGameButton}
        <GameBoard {...currentState} takeTurn={this.takeTurn.bind(this)} />
      </div>
    )
  }
}
