import React from 'react'
import Row from 'components/presentation/Row'

function RowList(props) {
  const possibleRowPlacements = props.possibleRowPlacements || Array(5).fill(false)
  const rowsPendingTileTransfer = props.rowsPendingTileTransfer || Array(5).fill(false)

  function renderRowList(rows) {
    return rows.map((row, rowIndex) => {
        return (
        <Row
          key={rowIndex}
          rowIndex={rowIndex}
          onTileSelected={props.onTileSelected}
          canAcceptPendingTiles={possibleRowPlacements[rowIndex]}
          possibleTileTransfers={rowsPendingTileTransfer[rowIndex]}
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
