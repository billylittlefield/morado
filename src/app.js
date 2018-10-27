import React from 'react'
import Scoreboard from 'components/scoreboard'
import StagingRows from 'components/staging-rows'
import FinalRows from 'components/final-rows'
import DiscardRow from 'components/discard-row'
import 'app.scss'

const App = () => {
  return (
    <>
      <h1>Azul</h1>
      <div>
        <Scoreboard />
        <div class="side-by-side">
          <StagingRows />
          <FinalRows />
        </div>
        <DiscardRow />
      </div>
    </>
  )
}

export default App
