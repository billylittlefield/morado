import React from 'react'
import _ from 'lodash'
import moment from 'moment'


function Lobby(props) {
  function renderExistingGames() {
    return (
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Players</th>
            <th>Round</th>
            <th>Turn</th>
            <th>Started</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {props.allGames.map((game, index) => {
          return (
            <tr key={index}>
              <td>{game.options.name}</td>
              <td>{game.usernames}</td>
              <td>{game.currentRound}</td>
              <td>{game.currentTurn}</td>
              <td>{game.startTime ? moment(game.startTime).format('h:ma M/D/YY') : 'Not started'}</td>
              <td><button onClick={() => { props.joinGame(game.id) }}>Resume</button></td>
            </tr>
          )
        })}
        </tbody>
      </table>
    )
  }

  return (
    <section className="lobby">
        <div className="new-game">
          Start a new game: <button onClick={() => { props.joinGame() }}>Join Game</button>
        </div>
        <div className="existing-games">
          Your existing games: {renderExistingGames()}
        </div>
      </section>
  )
}

export default Lobby
