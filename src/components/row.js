import React from 'react'
import TileSquare from 'components/tile-square'

function Row(props) {
  const squares = Array(props.rowSize)
    .fill()
    .map((_, index) => {
      const bgColor = props.requiredOrder ? props.requiredOrder[index] : null
      return {
        bgColor,
        tileColor: props.tiles[index],
      }
    })

  function renderSquare(square, index) {
    return <TileSquare key={index} tileColor={square.tileColor} bgColor={square.bgColor} />
  }

  function handleClick() {
    if (props.canAcceptPendingTiles) {
      props.onRowSelected(props.rowIndex)
    }
  }

  return (
    <div className={`${props.canAcceptPendingTiles ? 'active' : ''} row`} onClick={handleClick}>
      {squares.map(renderSquare)}
    </div>
  )
}

export default Row
