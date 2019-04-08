import React from 'react';
import TileSquare from 'components/presentation/TileSquare';

function Row(props) {
  const {
    rowIndex,
    shouldHighlight,
    possibleTileTransfers,
    tiles,
    requiredOrder,
    onTileSelected,
    onRowSelected,
  } = props;

  function renderSquares() {
    return tiles.map((tileColor, columnIndex) => {
      const bgClass = requiredOrder ? `bg-${requiredOrder[columnIndex]}` : '';
      const canAcceptTileTransfer =
        possibleTileTransfers && possibleTileTransfers.includes(columnIndex);
      return (
        <TileSquare
          id={`${props.id}-${columnIndex}`}
          key={columnIndex}
          bgClass={bgClass}
          shouldHighlight={canAcceptTileTransfer}
          handleClick={() => onTileSelected && onTileSelected(rowIndex, columnIndex)}
        />
      );
    });
  }

  let classList = 'row';
  if (shouldHighlight) {
    classList += ' highlight';
  }
  if (rowIndex === -1) {
    classList += ' broken-tiles';
  }
  return (
    <div onClick={() => onRowSelected && onRowSelected(rowIndex)} className={classList}>
      {renderSquares()}
    </div>
  );
}

export default Row;
