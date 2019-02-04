import React, { useEffect, useState } from 'react'
import Scoreboard from 'components/scoreboard'
import StagingRows from 'components/staging-rows'
import FinalRows from 'components/final-rows'
import DiscardRow from 'components/discard-row'
import axios from 'axios'

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
      <div>
        <Scoreboard />
        <div className="side-by-side">
          <StagingRows />
          <FinalRows />
          Async data: {data}
        </div>
        <DiscardRow />
      </div>
    </>
  )
}

export default App
