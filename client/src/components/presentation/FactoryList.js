import React, { useState } from 'react'
import Factory from 'components/presentation/Factory'
import TileSquare from 'components/presentation/TileSquare'

function FactoryList(props) {
  function renderFactories(factories) {
    const factoryElements = factories.map((factory, index) => {
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

    return (
      <>
        <div className="factory-row">
          {factoryElements.slice(0, Math.floor(factoryElements.length / 2))}
        </div>
        <div className="factory-row">
          {factoryElements.slice(Math.floor(factoryElements.length / 2))}
        </div>
      </>
    )
  }

  function renderTableTiles(tableTiles) {
    return tableTiles.map((tile, index) => (
      <TileSquare
        isSelected={props.selectedFactoryIndex === -1 && props.selectedTileColor === tile}
        key={index}
        bgColor={null}
        tileColor={tile}
        handleClick={() => props.onTileSelectedInFactory(tile, -1)}
      />
    ))
  }

  return (
    <div className="factory-container">
      {renderFactories(props.factories)}
      <div className="table-tiles">{renderTableTiles(props.tableTiles)}</div>
    </div>
  )
}

export default FactoryList
