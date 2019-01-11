import React from 'react'

function TileSquare(props) {
  const tileClass = props.tileColor ? ` tile-${props.tileColor}` : ''
  const bgClass = props.bgColor ? ` tile-${props.bgColor}` : ''
  const selectedClass = props.isSelected ? ` selected` : ''
  const classList = `square${tileClass}${bgClass}${selectedClass}`

  return <div className={classList} onClick={props.handleClick} />
}

export default TileSquare
