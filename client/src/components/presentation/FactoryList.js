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
    let maxNumberTableTiles = props.factories.length * 3
    return tableTiles
      .concat(Array(maxNumberTableTiles - tableTiles.length).fill(null))
      .map((tile, index) => (
        <TileSquare
          id={`common-table-0-${index}`}
          key={index}
          bgColor={'hidden'}
          handleClick={() => {}}
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
