import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

function Row(props) {
  const {
    rowIndex,
    canAcceptPendingTiles,
    onRowSelected,
    possibleTileTransfers,
    tiles,
    requiredOrder,
  } = props

  function renderSquares() {
    return tiles.map((tileColor, columnIndex) => {
      const bgColor = requiredOrder ? requiredOrder[columnIndex] : null
      const canAcceptTileTransfer =
        possibleTileTransfers && possibleTileTransfers.includes(columnIndex)
      return (
        <TileSquare
          key={columnIndex}
          tileColor={tileColor}
          bgColor={bgColor}
          canAcceptTileTransfer={canAcceptTileTransfer}
        />
      )
    })
  }

  function handleClick() {
    if (canAcceptPendingTiles) {
      onRowSelected(rowIndex)
    }
  }

  let classList = 'row'
  if (canAcceptPendingTiles) {
    classList += ' active'
  }
  if (rowIndex === -1) {
    classList += ' broken-tiles'
  }
  return (
    <div className={classList} onClick={handleClick}>
      {renderSquares()}
    </div>
  )
}

export default Row
