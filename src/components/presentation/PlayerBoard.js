import React from 'react'

import { DROPPED_TILE_PENALTIES } from 'util/game-invariants'
import Row from 'components/presentation/Row'
import RowList from 'components/presentation/RowList'

function PlayerBoard(props) {
  return (
    <div className="player-board">
      Player Board
      <div className="rows-container">
        <RowList
          isStaging={true}
          possibleRowPlacements={props.possibleRowPlacements}
          rows={props.stagingRows}
          onRowSelected={props.onRowSelected}
        />
        <RowList isStaging={false} rows={props.finalRows} />
      </div>
      <div className="broken-tiles">
        <Row
          tiles={props.brokenTiles}
          rowSize={DROPPED_TILE_PENALTIES.length}
          rowIndex={-1}
          canAcceptPendingTiles={props.hasPendingSelection}
          onRowSelected={props.onRowSelected}
        />
      </div>
    </div>
  )
}

export default PlayerBoard
