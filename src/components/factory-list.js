import React, { useState } from 'react'
import Factory from 'components/factory'

function FactoryList(props) {
  // const [selectedfactoryId, setSelectedfactoryId] = useState(null)
  // const [selectedTileColor, setselectedTileColor] = useState(null)

  // function selectTileInFactory(factoryId, tileColor) {
  //   setSelectedfactoryId(factoryId)
  //   setselectedTileColor(tileColor)
  // }

  function renderFactories(factories) {
    return factories.map((factory, index) => {
      return (
        <Factory
          key={index}
          factoryId={index}
          tiles={factory.tiles}
          isFactorySelected={index === props.selectedfactoryId}
          selectedTileColor={props.selectedTileColor}
          onTileSelectedInFactory={props.onTileSelectedInFactory}
        />
      )
    })
  }

  return <div className="factory-list">{renderFactories(props.factories)}</div>
}

export default FactoryList
