import React from 'react'
import AzulContainer from 'components/containers/AzulContainer'
import 'app.scss'

const App = () => {
  return (
    <>
      <h1>Azul</h1>
      <AzulContainer hasGameStarted={false} numPlayers={4} useColorTemplate={false} />
    </>
  )
}

export default App
