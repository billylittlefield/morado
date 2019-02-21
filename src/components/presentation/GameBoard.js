import React, { useState } from 'react'
import PlayerBoard from 'components/presentation/PlayerBoard'
import FactoryList from 'components/presentation/FactoryList'
import OpponentList from 'components/presentation/OpponentList'

function GameBoard(props) {
  const { players, activeSeatIndex, factories, tableTiles, pullAndStageTiles } = props
  const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [possibleRowPlacements, setPossibleRowPlacements] = useState([])
  const opponents = _.reject(props.players, { userId: props.userInfo.userId })
  const activePlayer = _.find(props.players, { userId: props.userInfo.userId })

  function selectTileInFactory(tileColor, factoryIndex) {
    if (activePlayer.seatIndex !== activeSeatIndex) {
      return
    }

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
      targetRowIndex: rowIndex,
    })

    setSelectedFactoryIndex(null)
    setSelectedTiles([])
    setPossibleRowPlacements([])
  }

  // Map each staging row to whether or not it can accept the pending selection
  function getPossibleRowPlacements(tileColor) {
    return players[activeSeatIndex].stagingRows.map((row, rowIndex) => {
      // If the staging row is already full
      if (row.tiles.filter(t => t !== null).length === row.rowSize) {
        return false
      }

      // If the staging row is already storing another color
      if (row.tiles[0] !== tileColor && row.tiles[0] !== null) {
        return false
      }

      // If the corresponding final row already contains that color
      if (players[activeSeatIndex].finalRows[rowIndex].tiles.includes(tileColor)) {
        return false
      }

      return true
    })
  }

  return (
    <div className="game-board">
      <FactoryList
        isActive={activeSeatIndex === activePlayer.seatIndex}
        onTileSelectedInFactory={selectTileInFactory.bind(this)}
        selectedTileColor={selectedTiles[0] || null}
        selectedFactoryIndex={selectedFactoryIndex}
        factories={factories}
        tableTiles={tableTiles}
      />
      <OpponentList 
        activeSeatIndex={activeSeatIndex}
        opponents={opponents}
      />
      <PlayerBoard
        isActive={activeSeatIndex === activePlayer.seatIndex}
        hasPendingSelection={selectedTiles.length !== 0}
        possibleRowPlacements={possibleRowPlacements}
        stagingRows={activePlayer.stagingRows}
        onRowSelected={selectPlacementRow.bind(this)}
        finalRows={activePlayer.finalRows}
        brokenTiles={activePlayer.brokenTiles}
      />
    </div>
  )
}

export default GameBoard
