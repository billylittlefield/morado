import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

function Factory(props) {
  function renderTilesInFactory(tiles) {
    const elements = tiles.map((tileColor, index) => {
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

    return (
      <>
        <div className="factory-tile-row">
          {elements.slice(0, 2)}
        </div>
        <div className="factory-tile-row">
          {elements.slice(2)}
        </div>
      </>
    )
  }

  return <div className="factory">{renderTilesInFactory(props.tiles)}</div>
}

export default Factory
