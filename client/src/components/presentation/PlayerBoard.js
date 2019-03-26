import React from 'react'

import { DROPPED_TILE_PENALTIES } from '@shared/azul/game-invariants'
import Row from 'components/presentation/Row'
import RowList from 'components/presentation/RowList'

function PlayerBoard(props) {
  if (!props.player) {
    return null
  }
  const { stagingRows, finalRows, brokenTiles } = props.player
  const isActiveAndHasPendingSelection =
    props.player.seatIndex === props.activeSeatIndex &&
    props.selectedTiles &&
    props.selectedTiles.length > 0

  function getPossibleStagingRowPlacements() {
    if (!isActiveAndHasPendingSelection) {
      return null
    }

    const tileColor = props.selectedTiles[0]
    return stagingRows.map((row, rowIndex) => {
      // If the staging row is already full
      if (row.tiles.filter(t => t !== null).length === row.rowSize) {
        return false
      }

      // If the staging row is already storing another color
      if (row.tiles[0] !== tileColor && row.tiles[0] !== null) {
        return false
      }

      // If the corresponding final row already contains that color
      if (finalRows[rowIndex].tiles.includes(tileColor)) {
        return false
      }

      return true
    })
  }

  return (
    <div className={`player-board ${props.isOpponentBoard ? 'opponent-board' : 'own-board'}`}>
      <div className="player-info">
        <span>{props.player.username}</span>
        <span> - </span>
        <span>{props.player.score}</span>
      </div>
      <div className="staging-and-final-rows-container">
        <RowList
          isStaging={true}
          rows={stagingRows}
          possibleRowPlacements={getPossibleStagingRowPlacements()}
          onRowSelected={props.onRowSelected}
        />
        <RowList
          isStaging={false}
          rows={finalRows}
          onTileSelected={props.placeTileInFinalRow}
          rowsPendingTileTransfer={props.rowsPendingTileTransfer}
        />
      </div>
      <Row
        tiles={brokenTiles}
        rowSize={DROPPED_TILE_PENALTIES.length}
        rowIndex={-1}
        canAcceptPendingTiles={isActiveAndHasPendingSelection}
        onRowSelected={props.onRowSelected}
      />
    </div>
  )
}

export default PlayerBoard
