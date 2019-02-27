import React from 'react'
import TileSquare from 'components/presentation/TileSquare'

function Factory(props) {
  function renderTilesInFactory(tileColors) {
    return tileColors.map((tileColor, index) => {
      return (
        <TileSquare
          isSelected={props.isFactorySelected && props.selectedTileColor === tileColor}
          key={index}
          bgColor={null}
          tileColor={tileColor}
          handleClick={() => props.onTileSelectedInFactory(tileColor, props.factoryIndex)}
        />
      )
    })
  }

  return <div className="factory">{renderTilesInFactory(props.tiles)}</div>
}

export default Factory
