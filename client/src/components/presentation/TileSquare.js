import React from 'react'

function TileSquare(props) {
  const { bgClass, shouldHighlight, handleClick, hidden, id } = props

  return (
    <div
      id={id}
      className={`square ${bgClass} ${shouldHighlight ? 'highlight' : ''} ${hidden ? 'hidden' : ''}`}
      onClick={handleClick}
    />
  )
}

export default TileSquare
