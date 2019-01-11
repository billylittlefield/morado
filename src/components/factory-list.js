import React, { useState } from 'react'
import Factory from 'components/factory'

function FactoryList(props) {
  // const [selectedFactoryIndex, setSelectedFactoryIndex] = useState(null)
  // const [selectedTileColor, setselectedTileColor] = useState(null)

  // function selectTileInFactory(factoryIndex, tileColor) {
  //   setSelectedFactoryIndex(factoryIndex)
  //   setselectedTileColor(tileColor)
  // }

  function renderFactories(factories) {
    return factories.map((factory, index) => {
      return (
        <Factory
          key={index}
          factoryIndex={index}
          tiles={factory.tiles}
          isFactorySelected={index === props.selectedFactoryIndex}
          selectedTileColor={props.selectedTileColor}
          onTileSelectedInFactory={props.onTileSelectedInFactory}
        />
      )
    })
  }

  return <div className="factory-list">{renderFactories(props.factories)}</div>
}

export default FactoryList
