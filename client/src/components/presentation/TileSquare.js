import React from 'react'

const TileSquare = ({ tileColor, bgColor, isSelected, handleClick }) => {
  const tileClass = tileColor ? ` tile-${tileColor}` : ''
  const bgClass = bgColor ? ` bg-${bgColor}` : ''
  const selectedClass = isSelected ? ` selected` : ''
  const classList = `square${tileClass}${bgClass}${selectedClass}`

  return <div className={classList} onClick={handleClick} />
}

export default TileSquare
