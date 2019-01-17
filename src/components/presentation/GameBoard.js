import React, { useState } from 'react'
import PlayerBoard from 'components/presentation/PlayerBoard'
import FactoryList from 'components/presentation/FactoryList'

const GameBoard = ({ round, turn, playerBoards, activePlayerIndex, factories, tableTiles, pullAndStageTiles }) => {
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [possibleRowPlacements, setPossibleRowPlacements] = useState([])

  function selectTileInFactory(tileColor, factoryIndex) {
    const tileSet = factoryIndex !== -1 ? factories[factoryIndex] : tableTiles
    const tileCount = tileSet.filter(c => c === tileColor).length
    setSelectedFactoryIndex(factoryIndex)
    setSelectedTiles(Array(tileCount).fill(tileColor))
    setPossibleRowPlacements(getPossibleRowPlacements(tileColor))
  }

  function selectPlacementRow(rowIndex) {
    pullAndStageTiles({ 
      factoryIndex: selectedFactoryIndex,
      tileColor: selectedTiles[0],
      targetRowIndex: rowIndex
    })

    setSelectedFactoryIndex(null)
    setSelectedTiles([])
    setPossibleRowPlacements([])
  }

  // Map each staging row to whether or not it can accept the pending selection
  function getPossibleRowPlacements(tileColor) {
    return playerBoards[activePlayerIndex].stagingRows.map((row, rowIndex) => {
      // If the staging row is already full
      if (row.tiles.filter(t => t !== null).length === row.rowSize) {
        return false
      }

      // If the staging row is already storing another color
      if (row.tiles[0] !== tileColor && row.tiles[0] !== null) {
        return false
      }

      // If the corresponding final row already contains that color
      if (playerBoards[activePlayerIndex].finalRows[rowIndex].tiles.includes(tileColor)) {
        return false
      }

      return true
    })
  }
  
  return (
    <div className="game-board">
      Game Board
      <div>Round: {round}</div>
      <div>Turn: {turn}</div>
      <FactoryList
        onTileSelectedInFactory={selectTileInFactory.bind(this)}
        selectedTileColor={selectedTiles[0] || null}
        selectedFactoryIndex={selectedFactoryIndex}
        factories={factories}
        tableTiles={tableTiles}
      />
      {playerBoards.map((playerBoard, index) => {
        return (
          <PlayerBoard
            key={index}
            isActive={activePlayerIndex === index}
            hasPendingSelection={selectedTiles.length !== 0}
            possibleRowPlacements={possibleRowPlacements}
            stagingRows={playerBoard.stagingRows}
            onRowSelected={selectPlacementRow.bind(this)}
            finalRows={playerBoard.finalRows}
            brokenTiles={playerBoard.brokenTiles}
          />
        )
      })}
    </div>
  )
}

export default GameBoard
