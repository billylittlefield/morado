import React from 'react';
import Row from 'components/presentation/Row';

function RowList(props) {
  const possibleRowPlacements = props.possibleRowPlacements || Array(5).fill(false);
  const rowsPendingTileTransfer = props.rowsPendingTileTransfer || Array(5).fill(false);

  function renderRowList(rows) {
    return rows.map((row, rowIndex) => {
      return (
        <Row
          id={`${props.id}-${rowIndex}`}
          key={rowIndex}
          rowIndex={rowIndex}
          onTileSelected={props.onTileSelected}
          onRowSelected={props.onRowSelected}
          shouldHighlight={possibleRowPlacements[rowIndex]}
          possibleTileTransfers={rowsPendingTileTransfer[rowIndex]}
          tiles={row.tiles}
          requiredOrder={row.requiredOrder}
        />
      );
    });
  }

  return (
    <div className={`${props.isStaging ? 'staging' : 'final'}-rows`}>
      <div className="row-container">{renderRowList(props.rows)}</div>
    </div>
  );
}

export default RowList;
