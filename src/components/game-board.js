import React, { useState } from 'react'
import PlayerBoard from 'components/player-board'
import FactoryList from 'components/factory-list'

function GameBoard(props) {
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [possibleRowPlacements, setPossibleRowPlacements] = useState([])

  function selectTileInFactory(tileColor, factoryIndex) {
    setSelectedFactoryIndex(factoryIndex)
    const tileCount = props.factories[factoryIndex].tiles.filter(c => c === tileColor).length
    setSelectedTiles(Array(tileCount).fill(tileColor))
    setPossibleRowPlacements(getPossibleRowPlacements(tileCount, tileColor))
  }

  function selectPlacementRow(rowIndex) {
    props.takeTurn(0, selectedFactoryIndex, selectedTiles, rowIndex)
    setSelectedFactoryIndex(null)
    setSelectedTiles([])
    setPossibleRowPlacements([])
  }

  // Map each staging row to whether or not it can accept the pending selection
  function getPossibleRowPlacements(tileCount, tileColor) {
    return props.playerBoards[0].stagingRows.map(row => {
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
        factories={props.factories}
      />
      <PlayerBoard
        possibleRowPlacements={possibleRowPlacements}
        stagingRows={props.playerBoards[0].stagingRows}
        onRowSelected={selectPlacementRow.bind(this)}
        finalRows={props.playerBoards[0].finalRows}
        brokenTiles={props.playerBoards[0].brokenTiles}
      />
    </div>
  )
}

export default GameBoard
