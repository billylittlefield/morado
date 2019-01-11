import React from 'react'
import Row from 'components/row'
import RowList from 'components/row-list'

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
        <RowList
          isStaging={false}
          rows={props.finalRows}
        />
      </div>
      <div className="broken-tiles">
        <Row 
          {...props.brokenTiles}
          canAcceptPendingTiles={true}
          rowIndex={-1} 
          onRowSelected={props.onRowSelected} 
        />
      </div>
    </div>
  )
}

export default PlayerBoard
