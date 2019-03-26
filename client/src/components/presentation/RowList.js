import React from 'react'
import Row from 'components/presentation/Row'

function RowList(props) {
  function renderRowList(rows) {
    return rows.map((row, rowIndex) => {
      const canAcceptPendingTiles =
        props.isStaging && props.possibleRowPlacements && props.possibleRowPlacements[rowIndex]
      const possibleTileTransfers =
        !props.isStaging && props.rowsPendingTileTransfer && props.rowsPendingTileTransfer[rowIndex]

        return (
        <Row
          key={rowIndex}
          rowIndex={rowIndex}
          canAcceptPendingTiles={canAcceptPendingTiles}
          onRowSelected={props.onRowSelected}
          onTileSelected={props.onTileSelected}
          possibleTileTransfers={possibleTileTransfers}
          {...row}
        />
      )
    })
  }

  const classList = `${props.isStaging ? 'staging' : 'final'}-rows`
  return (
    <div className={classList}>
      <div className="row-container">{renderRowList(props.rows)}</div>
    </div>
  )
}

export default RowList
