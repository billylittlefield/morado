import React from 'react'

import { DROPPED_TILE_PENALTIES } from '@shared/azul/game-invariants'
import Row from 'components/presentation/Row'
import RowList from 'components/presentation/RowList'

function PlayerBoard(props) {
  if (!props.player) {
    return null
  }
  const { stagingRows, finalRows, brokenTiles, seatIndex } = props.player

  const isActiveAndHasPendingSelection =
    seatIndex === props.activeSeatIndex && props.selectedTiles.length > 0

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

  const possibleRowPlacements = getPossibleStagingRowPlacements()

  // Add one verification check before propagating action to ensure that the target row can
  // accept the tiles from the factory
  function verifyAndPlaceTilesFromFactory(rowIndex) {
    if (possibleRowPlacements && possibleRowPlacements[rowIndex]) {
      props.placeTilesFromFactoryOrTable(rowIndex)
    }
  }

  function verifyAndPlaceTilesFromTable(rowIndex) {
    if (rowIndex === -1 && isActiveAndHasPendingSelection) {
      props.placeTilesFromFactoryOrTable(rowIndex)
    }
  }

  function verifyAndTransferTileToFinalRow(rowIndex, columnIndex) {
    if (
      props.rowsPendingTileTransfer &&
      props.rowsPendingTileTransfer[rowIndex] &&
      props.rowsPendingTileTransfer[rowIndex].includes(columnIndex)
    ) {
      const tileColor = stagingRows[rowIndex].tiles[0]
      props.transferTileToFinalRow(rowIndex, columnIndex, tileColor, seatIndex)
    }
  }

  return (
    <div className={`player-board ${props.isOpponentBoard ? 'opponent-board' : 'own-board'}`}>
      <div className="player-info">
        <span>{props.player.username} </span>
        <span>{props.player.score}</span>
      </div>
      <div className="staging-and-final-rows-container">
        <RowList
          id={`p${seatIndex}s`}
          isStaging={true}
          rows={stagingRows}
          possibleRowPlacements={possibleRowPlacements}
          onTileSelected={verifyAndPlaceTilesFromFactory}
        />
        <RowList
          id={`p${seatIndex}f`}
          isStaging={false}
          rows={finalRows}
          rowsPendingTileTransfer={props.rowsPendingTileTransfer}
          onTileSelected={verifyAndTransferTileToFinalRow}
        />
      </div>
      <Row
        id={`p${seatIndex}b`}
        tiles={brokenTiles}
        rowSize={DROPPED_TILE_PENALTIES.length}
        rowIndex={-1}
        canAcceptPendingTiles={isActiveAndHasPendingSelection}
        onTileSelected={verifyAndPlaceTilesFromTable}
      />
    </div>
  )
}

export default PlayerBoard
