import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

const Row = ({ tiles, rowSize, rowIndex, requiredOrder, canAcceptPendingTiles, onRowSelected }) => {
  const squares = Array(rowSize)
    .fill()
    .map((_, index) => {
      const bgColor = requiredOrder ? requiredOrder[index] : null
      return {
        bgColor,
        tileColor: tiles[index],
      }
    })

  function renderSquare(square, index) {
    return <TileSquare key={index} tileColor={square.tileColor} bgColor={square.bgColor} />
  }

  function handleClick() {
    if (canAcceptPendingTiles) {
      onRowSelected(rowIndex)
    }
  }

  return (
    <div className={`${canAcceptPendingTiles ? 'active' : ''} row`} onClick={handleClick}>
      {squares.map(renderSquare)}
    </div>
  )
}

export default Row
