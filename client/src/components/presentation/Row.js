import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

const Row = ({ tiles, rowIndex, requiredOrder, canAcceptPendingTiles, onRowSelected }) => {
  const squares = tiles.map((tileColor, index) => {
    const bgColor = requiredOrder ? requiredOrder[index] : null
    return {
      bgColor,
      tileColor,
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

  let classList = 'row'
  if (canAcceptPendingTiles) {
    classList += ' active'
  }
  if (rowIndex === -1) {
    classList += ' broken-tiles'
  }
  return (
    <div className={classList} onClick={handleClick}>
      {squares.map(renderSquare)}
    </div>
  )
}

export default Row