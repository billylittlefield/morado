import React, { useEffect, useState } from 'react'
import axios from 'axios'

import AzulContainer from 'components/containers/AzulContainer'
import 'app.scss'

const getData = async setData => {
  const result = await axios('https://nodejs-express-6gk9khaop.now.sh/')
  setData(result.data)
}

const App = () => {
  const [data, setData] = useState('')

  useEffect(() => {
    getData(setData)
  }, [])

  return (
    <>
      <h1>Azul</h1>
      <AzulContainer hasGameStarted={false} numPlayers={4} useColorTemplate={false} />
    </>
  )
}

export default App
