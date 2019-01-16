import React, { useState } from 'react'
import PlayerBoard from 'components/presentation/PlayerBoard'
import FactoryList from 'components/presentation/FactoryList'

const GameBoard = ({ playerBoards, factories, tableTiles, pullTiles, stageTiles }) => {
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [possibleRowPlacements, setPossibleRowPlacements] = useState([])

  function selectTileInFactory(tileColor, factoryIndex) {
    const tileSet = factoryIndex !== -1 ? factories[factoryIndex] : tableTiles
    const tileCount = tileSet.filter(c => c === tileColor).length
    setSelectedFactoryIndex(factoryIndex)
    setSelectedTiles(Array(tileCount).fill(tileColor))
    setPossibleRowPlacements(getPossibleRowPlacements(tileCount, tileColor))
  }

  function selectPlacementRow(rowIndex) {
    pullTiles({ factoryIndex: selectedFactoryIndex, tileColor: selectedTiles[0] })
    stageTiles({ playerIndex: 0, selectedTiles, targetRowIndex: rowIndex })

    setSelectedFactoryIndex(null)
    setSelectedTiles([])
    setPossibleRowPlacements([])
  }

  // Map each staging row to whether or not it can accept the pending selection
  function getPossibleRowPlacements(tileCount, tileColor) {
    return playerBoards[0].stagingRows.map(row => {
      // If the staging row is already full
      if (row.tiles.filter(t => t !== null).length === row.rowSize) {
        return false
      }

      // If the staging row is already storing another color
      if (row.tiles[0] !== tileColor && row.tiles[0] !== null) {
        return false
      }

      return true
    })
  }

  return (
    <div className="game-board">
      Game Board
      <FactoryList
        onTileSelectedInFactory={selectTileInFactory.bind(this)}
        selectedTileColor={selectedTiles[0] || null}
        selectedFactoryIndex={selectedFactoryIndex}
        factories={factories}
        tableTiles={tableTiles}
      />
      <PlayerBoard
        hasPendingSelection={selectedTiles.length !== 0}
        possibleRowPlacements={possibleRowPlacements}
        stagingRows={playerBoards[0].stagingRows}
        onRowSelected={selectPlacementRow.bind(this)}
        finalRows={playerBoards[0].finalRows}
        brokenTiles={playerBoards[0].brokenTiles}
      />
    </div>
  )
}

export default GameBoard

// GameBoard.propTypes = {
//   takeTurn: PropTypes.func.isRequired,
//   roundNumber: PropTypes.number.isRequired,
//   turnNumber: PropTypes.number.isRequired,
//   playerBoards: PropTypes.arrayOf(PropTypes.object).isRequired,
//   factories: PropTypes.arrayOf(PropTypes.object).isRequired,
//   freshTiles: PropTypes.arrayOf(PropTypes.string).isRequired,
//   discardTiles: PropTypes.arrayOf(PropTypes.string).isRequired,
//   tableTiles: PropTypes.arrayOf(PropTypes.string).isRequired
// }
