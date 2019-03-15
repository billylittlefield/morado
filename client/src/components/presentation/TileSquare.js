import React from 'react'

function TileSquare(props) {
  const { tileColor, bgColor, isSelected, handleClick, canAcceptTileTransfer } = props
  const tileClass = tileColor ? ` tile-${tileColor}` : ''
  const bgClass = bgColor ? ` bg-${bgColor}` : ''
  const selectedClass = isSelected ? ` selected` : ''
  const possibleTileTransferClass = canAcceptTileTransfer ? ` pending-tile-transfer` : ''
  const classList = `square${tileClass}${bgClass}${selectedClass}${possibleTileTransferClass}`

  return <div className={classList} onClick={handleClick} />
}

export default TileSquare
