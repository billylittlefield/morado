import React from 'react'

function TileSquare(props) {
  const { bgClass, shouldHighlight, handleClick, id } = props

  return (
    <div
      id={id}
      className={`square ${bgClass} ${shouldHighlight ? 'highlight' : ''}`}
      onClick={handleClick}
    />
  )
}

export default TileSquare
