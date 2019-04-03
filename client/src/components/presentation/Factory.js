import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

function Factory(props) {
  function renderTilesInFactory(tiles) {
    return tiles.map((tileColor, index) => {
      return (
        <TileSquare
          id={`common-factory-${props.factoryIndex}-${index}`}
          key={index}
          bgClass={'hidden'}
          shouldHighlight={false}
          handleClick={() => {}}
        />
      )
    })
  }

  return <div className="factory">{renderTilesInFactory(props.tiles)}</div>
}

export default Factory
