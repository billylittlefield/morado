import React from 'react'

const TileSquare = ({ tileColor, bgColor, isSelected, handleClick }) => {
  const tileClass = tileColor ? ` tile-${tileColor}` : ''
  const bgClass = bgColor ? ` tile-${bgColor}` : ''
  const selectedClass = isSelected ? ` selected` : ''
  const classList = `square${tileClass}${bgClass}${selectedClass}`

  return <div className={classList} onClick={handleClick} />
}

export default TileSquare
