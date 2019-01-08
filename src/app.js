import React from 'react'
import 'app.scss'

const App = () => {
  return (
    <>
      <h1>Azul</h1>
      <GameBoard />
    </>
  )
}

// ============= BILLY EDIT =============

class GameBoard extends React.Component {
  constructor(props) {
    super(props);

    const playerBoards = Array(props.numPlayers).fill().map(() => {
      return {
        stagingRows: Array(5).fill().map((_, rowSize) => {
          return { 
            squares: Array(rowSize + 1).fill().map(() => ({ bgColor: null, tileColor: null }))
          }
        }),
        finalRows: Array(5).fill().map(() => {
          return {
            squares: Array(5).fill().map(() => ({ bgColor: null, tileColor: null }))
          }
        }),
        brokenTiles: []
      }
    })

    this.state = {
      numPlayers: props.numPlayers,
      hasGameEnded: false,
      history: [{
        roundNumber: 1,
        turnNumber: 1,
        playerBoards
      }],
      historyIndex: 0
    }
  }

  render() {
    return (
      <div>
        <PlayerBoard
          stagingRows={this.state.history[this.state.historyIndex].playerBoards[0].stagingRows}
          finalRows={this.state.history[this.state.historyIndex].playerBoards[0].finalRows}
          brokenTiles={this.state.history[this.state.historyIndex].playerBoards[0].brokenTiles}
        />
      </div>
    )
  }
}

const PlayerBoard = props => {
  return (
    <div>
      <TileRows rowType="staging" rows={props.stagingRows}/>
      <TileRows rowType="final" rows={props.finalRows}/>
      <BrokenTiles brokenTiles={props.brokenTiles}/>
    </div>
  )
}

const TileRows = props => {
  function renderTileRows(rows) {
    return rows.map((row, index) => {
      return <Row key={index} squares={row.squares} rowType={props.rowType}/>
    })
  }

  return (
    <div className={props.rowType + "-rows"}>
      {renderTileRows(props.rows)}
    </div>
  )
}
const Row = props => {
  function renderSquares(squares) {
    return squares.map((square, index) => {
      return (
        <TileSquare
          key={index}
          tileColor={square.tileColor} 
          bgColor={square.bgColor}
        />
      )
    })
  }

  return (
    <div className={props.rowType + "-row"}>
      {renderSquares(props.squares)}
    </div>
  )
}

const BrokenTiles = props => {
  const maxBrokenTiles = 10;

  function renderBrokenTiles(brokenTiles) {
    let result = Array.from({ length: maxBrokenTiles }, () => ({ tileColor: null, bgColor: null }))
    brokenTiles.forEach(({ tileColor }, index) => {
      result[index].tileColor = tileColor
    })

    return result.map((square, index) => {
      return (
        <TileSquare
          key={index}
          tileColor={square.tileColor}
          bgColor={square.bgColor}
        />
      )
    })
  }

  return (
    <div className="broken-tiles">
      {renderBrokenTiles(props.brokenTiles)}
    </div>
  )
}

const TileSquare = props => {
  return (
    <div className="square">
      {props.tileColor || props.bgColor}
    </div>
  )
}



// ============= BILLY EDIT =============


export default App
