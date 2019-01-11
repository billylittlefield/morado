import React, { useState } from 'react'
import PlayerBoard from 'components/player-board'
import FactoryList from 'components/factory-list'

function GameBoard(props) {
  const [selectedfactoryId, setSelectedfactoryId] = useState(null)
  const [selectedTiles, setSelectedTiles] = useState([])
  const [possibleRowPlacements, setPossibleRowPlacements] = useState([])

  function selectTileInFactory(tileColor, factoryId) {
    setSelectedfactoryId(factoryId)
    const tileCount = props.factories[factoryId].tiles.filter(c => c === tileColor).length
    setSelectedTiles(Array(tileCount).fill(tileColor))
    setPossibleRowPlacements(getPossibleRowPlacements(tileCount, tileColor))
  }

  function selectPlacementRow(rowIndex) {
    props.takeTurn(0, selectedfactoryId, selectedTiles, rowIndex)
    setSelectedfactoryId(null)
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
        selectedfactoryId={selectedfactoryId}
        factories={props.factories}
      />
      <PlayerBoard
        hasPendingSelection={selectedTiles.length !== 0}
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
