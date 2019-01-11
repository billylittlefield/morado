import React from 'react'
import Row from 'components/row'

function RowList(props) {
  function renderRowList(rows) {
    return rows.map((row, index) => {
      let canAcceptPendingTiles = props.isStaging && props.possibleRowPlacements[index]
      return (
        <Row
          key={index}
          rowIndex={index}
          onRowSelected={props.onRowSelected}
          canAcceptPendingTiles={canAcceptPendingTiles}
          onRowSelected={props.onRowSelected}
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
