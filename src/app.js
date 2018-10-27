import React from 'react'
import 'app.scss'

const App = () => {
  const scoreboard = <div class="scoreboard">Scoreboard</div>
  const stagingRows = <div class="staging-rows">Staging rows</div>
  const finalRows = <div class="final-rows">Final Rows</div>
  const discardRow = <div class="discard-row">discard row</div>
  const factories = <div class="factories">factories</div>

  return (
    <>
      <h1>Azul</h1>
      <div>
        {scoreboard}
        <div class="side-by-side">
          {stagingRows}
          {finalRows}
        </div>
        {discardRow}
      </div>
    </>
  )
}

export default App
