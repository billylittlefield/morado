import React, { useState } from 'react'
import Factory from 'components/presentation/Factory'
import TileSquare from 'components/presentation/TileSquare'

function FactoryList(props) {
  function renderFactories(factories) {
    return factories.map((factory, index) => {
      return (
        <Factory
          key={index}
          factoryIndex={index}
          tiles={factory}
          isFactorySelected={index === props.selectedFactoryIndex}
          selectedTileColor={props.selectedTileColor}
          onTileSelectedInFactory={props.onTileSelectedInFactory}
        />
      )
    })
  }

  function renderTableTiles(tableTiles) {
    return (
      <div className="table-tiles">
        {tableTiles.map((tile, index) => <TileSquare
          isSelected={props.selectedFactoryIndex === -1 && props.selectedTileColor === tile}
          key={index}
          bgColor={null}
          tileColor={tile}
          handleClick={() => props.onTileSelectedInFactory(tile, -1)}
        />)}
      </div>
    )
  }

  return (
    <div className="factory-list">
      {renderFactories(props.factories)}
      {renderTableTiles(props.tableTiles)}
    </div>
  )
}

export default FactoryList
