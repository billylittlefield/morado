import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';

function Lobby(props) {
  const [createGameModalIsOpen, setCreateGameModalIsOpen] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGameSize, setNewGameSize] = useState(2);
  const [newGameTemplate, setNewGameTemplate] = useState(true);

  const modalStyle = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  };

  function renderActiveGames() {
    return (
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Players</th>
            <th>Round</th>
            <th>Started</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {props.activeGames.map((game, index) => {
            return (
              <tr key={index}>
                <td>{game.options.name}</td>
                <td>{game.usernames.join(', ')}</td>
                <td>{game.latestRound || '-'}</td>
                <td>
                  {game.startTime ? moment(game.startTime).format('h:mma M/D/YY') : 'Not started'}
                </td>
                <td>
                  <Link to={`azul/${game.gameId}`} className="mdc-button mdc-button--unelevated">
                    Resume
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function renderAvailableGames() {
    return (
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Size</th>
            <th>Players</th>
            <th>Color template</th>
            <th>Join</th>
          </tr>
        </thead>
        <tbody>
          {props.availableGames.map((game, index) => {
            return (
              <tr key={index}>
                <td>{game.options.name}</td>
                <td>{game.options.numPlayers}</td>
                <td>{game.usernames.join(', ') || 'Empty'}</td>
                <td>{game.options.useColorTemplate ? 'Standard' : 'No template'}</td>
                <td>
                  <button
                    className="mdc-button mdc-button--unelevated"
                    onClick={() => {
                      props.joinGame(game.gameId);
                    }}>
                    Join
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function openCreateGameModal() {
    setCreateGameModalIsOpen(true);
  }

  function createNewGame() {
    props.createGame(newGameName, newGameSize, newGameTemplate);
    setNewGameName('');
    setNewGameSize(2);
    setNewGameTemplate(true);
    setCreateGameModalIsOpen(false);
  }

  return (
    <section className="lobby">
      <h2>Available games</h2>
      <div className="new-game">
        {renderAvailableGames()}
        <button
          className="mdc-button mdc-button--unelevated new-game-button"
          onClick={() => {
            openCreateGameModal();
          }}>
          Create new game
        </button>
      </div>
      <h2>Your active games</h2>
      <div className="existing-games">{renderActiveGames()}</div>
      <Modal isOpen={createGameModalIsOpen} style={modalStyle}>
        <h2>Create new game</h2>
        <form>
          <p>
            <label htmlFor="new-game-name">Name</label>
            <input
              type="text"
              value={newGameName}
              onChange={e => setNewGameName(e.target.value)}
              id="new-game-name"
              placeholder="Game title..."
            />
          </p>
          <p>
            <label htmlFor="new-game-size">Size</label>
            <input
              type="number"
              value={newGameSize}
              onChange={e => setNewGameSize(parseInt(e.target.value))}
              min="2"
              max="4"
              id="new-game-size"
            />
          </p>
          <p>
            <label htmlFor="new-game-template">Color template</label>
            <input
              type="checkbox"
              checked={newGameTemplate}
              onChange={e => setNewGameTemplate(e.target.checked)}
            />
          </p>
          <p>
            <button
              onClick={e => {
                e.preventDefault();
                createNewGame();
              }}>
              Create
            </button>
          </p>
        </form>
      </Modal>
    </section>
  );
}

export default Lobby;
