import React from 'react';
import { connect } from 'react-redux';
import http from 'http-instance'
import _ from 'lodash';
import { Redirect, withRouter } from 'react-router-dom';

import Lobby from 'components/presentation/Lobby';
import {
  logout,
  connectedToGame,
  receiveGameState,
  receivedActiveGames,
  receivedAvailableGames,
  createdNewGame,
} from 'redux/actions';

class LobbyContainer extends React.Component {
  componentDidMount() {
    if (!this.props.userId) {
      return;
    }

    http
      .get(`/users/${this.props.userId}/games`)
      .then(res => {
        const { games } = res.data;
        this.props.receivedActiveGames({ games });
      })
      .catch(err => {
        throw err;
      });

    http
      .get('/games/available')
      .then(res => {
        this.props.receivedAvailableGames({ games: res.data.games });
      })
      .catch(err => {
        throw err;  
      });
  }

  joinGame(gameId) {
    const userId = this.props.userId;
    http
      .post('/gameplays', { gameId, userId })
      .then(res => {
        this.props.history.push(`/azul/${gameId}`);
      })
      .catch(err => {
        throw err;
      });
  }

  createGame(name, numPlayers, useColorTemplate) {
    http
      .post('/games', { name, numPlayers, useColorTemplate }, { withCredentials: true, data: {} })
      .then(res => {
        this.props.createdNewGame({ game: res.data });
        this.props.history.push(`/azul/${res.data.gameId}`);
      })
      .catch(err => {
        throw err;
      });
  }

  render() {
    if (this.props.shouldRedirectToLogin) {
      return <Redirect to="/login" />;
    }

    return (
      <Lobby
        activeGames={this.props.activeGames}
        availableGames={this.props.availableGames}
        joinGame={this.joinGame.bind(this)}
        createGame={this.createGame.bind(this)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    shouldRedirectToLogin: !state.userInfo.isLoggedIn,
    userId: state.userInfo.userId,
    activeGames: state.lobby.activeGames,
    availableGames: state.lobby.availableGames,
  };
}

export default connect(
  mapStateToProps,
  {
    logout,
    connectedToGame,
    receiveGameState,
    receivedActiveGames,
    receivedAvailableGames,
    createdNewGame,
  }
)(withRouter(LobbyContainer));
