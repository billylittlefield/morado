import React from 'react';
import http from 'http-instance'
import io from 'socket.io-client';
import { connect } from 'react-redux';
import _ from 'lodash';

import Tile from 'models/Tile';
import {
  connectedToGame,
  receiveGameState,
  refillFactories,
  pullAndStageTiles,
  transferTiles,
  receiveGameActions,
} from 'redux/actions';
import {
  TILE_PULL,
  TILE_TRANSFER,
  DROPPED_TILE_PENALTIES,
  TILE_COLORS,
  STARTING_PLAYER,
} from '@shared/azul/game-invariants';
import Azul from 'components/presentation/Azul';

class AzulContainer extends React.Component {
  state = {
    tileList: [],
    isLoggedIn: false,
  };

  componentDidMount() {
    const gameId = this.props.gameId;

    // Load game state
    http.get(`/games/azul/${gameId}`).then(res => {
      this.setState({ isLoggedIn: this.props.userInfo.isLoggedIn });
      this.props.receiveGameState({ ...res.data });
      this.setInitialTiles({ ...res.data.gameState });

      // Check if the current user is in this game
      if (_.find(res.data.gameState.players, ['userId', this.props.userInfo.userId])) {
        // If so, setup websocket for game
        const socket = io.connect('localhost:3000');
        this.props.connectedToGame({ socket });

        socket.on('sessionExpired', this.props.logout);
        socket.on('userJoined', userInfo => {
          console.log(`${userInfo.username} has joined the lobby`);
        });
        socket.on('endOfRound', roundNumber => {
          console.log(`End of round ${roundNumber}`);
        });
        socket.on('startOfRound', roundNumber => {
          console.log(`Start of round ${roundNumber}`);
        });
        socket.on('gameUpdate', gameState => {
          this.validateGameState(gameState);
        });
        socket.on('transferTiles', gameAction => {
          this.props.transferTiles(gameAction);
          this.updateTethers(gameAction);
        });
        socket.on('pullAndStageTiles', gameAction => {
          this.props.pullAndStageTiles(gameAction);
          this.updateTethers(gameAction);
        });
        socket.on('gameActions', gameActions => {
          this.props.receiveGameActions(gameActions);
          gameActions.forEach(a => this.updateTethers(a));
        });

        socket.emit('joinGame', gameId);
      }
    });
  }
  componentWillUnmount() {
    this.props.socket.emit('leaveGame', this.props.gameId);
  }

  componentDidUpdate() {
    if (this.props.gameState && this.props.userInfo.isLoggedIn !== this.state.isLoggedIn) {
      this.setInitialTiles({ ...this.props.gameState });
      this.setState({ ...this.state, isLoggedIn: !this.state.isLoggedIn });
    }
  }

  validateGameState(gameState) {
    if (!_.isEqual(gameState, this.props.gameState)) {
      function difference(object, base) {
        function changes(object, base) {
          return _.transform(object, function(result, value, key) {
            if (!_.isEqual(value, base[key])) {
              result[key] =
                _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
            }
          });
        }
        return changes(object, base);
      }
      console.log('houston we have a mismatch');
      console.log(difference(gameState, this.props.gameState));
      this.props.receiveGameState({ gameState });
      this.setInitialTiles({ ...gameState });
    }
  }

  setInitialTiles(gameState) {
    this.state.tileList.forEach(t => t.destroy());
    let tileList = [];
    gameState.factories.forEach((factory, factoryIndex) => {
      factory.forEach((tileColor, positionIndex) => {
        tileList.push(new Tile(this, tileColor, 'common', 'factory', factoryIndex, positionIndex));
      });
    });
    gameState.tableTiles.forEach((tileColor, positionIndex) => {
      tileList.push(new Tile(this, tileColor, 'common', 'table', 0, positionIndex));
    });
    gameState.players.forEach((player, seatIndex) => {
      const isSmallTile = player.userId !== this.props.userInfo.userId;
      player.stagingRows.forEach((stagingRow, rowIndex) => {
        stagingRow.tiles.forEach((tileColor, positionIndex) => {
          if (tileColor === null) {
            return;
          }
          tileList.push(
            new Tile(
              this,
              tileColor,
              `p${seatIndex}`,
              'staging',
              rowIndex,
              positionIndex,
              isSmallTile
            )
          );
        });
      });
      player.finalRows.forEach((finalRow, rowIndex) => {
        finalRow.tiles.forEach((tileColor, positionIndex) => {
          if (tileColor === null) {
            return;
          }
          tileList.push(
            new Tile(
              this,
              tileColor,
              `p${seatIndex}`,
              'final',
              rowIndex,
              positionIndex,
              isSmallTile
            )
          );
        });
      });
      player.brokenTiles.forEach((tileColor, positionIndex) => {
        if (tileColor === null) {
          return;
        }
        tileList.push(
          new Tile(this, tileColor, `p${seatIndex}`, 'broken', 0, positionIndex, isSmallTile)
        );
      });
    });

    this.setState({ tileList });
  }

  updateTethers(gameAction) {
    const { params } = gameAction;
    switch (gameAction.type) {
      case 'FACTORY_REFILL':
        this.addTilesForFactoryRefill(params);
        break;
      case 'TILE_PULL':
        this.updateTethersForTilePull(params);
        break;
      case 'TILE_TRANSFER':
        this.transferTilesToFinalRow(params);
        break;
      case 'TILE_DUMP':
        this.removeBrokenTiles();
        break;
    }
  }

  addTilesForFactoryRefill(params) {
    const { factoryCode, factoryIndex } = params;
    let newTiles = [];
    factoryCode.split('').forEach((tileIndex, positionIndex) => {
      if (tileIndex === '5') {
        return;
      }
      const tileColor = TILE_COLORS[parseInt(tileIndex)];
      newTiles.push(new Tile(this, tileColor, 'common', 'factory', factoryIndex, positionIndex));
    });

    this.setState({ tileList: [...this.state.tileList, ...newTiles] });
  }

  updateTethersForTilePull(params) {
    const { seatIndex, factoryIndex, tileColor, targetRowIndex } = params;
    const isOpponentPull =
      _.find(this.props.gameState.players, { seatIndex }).userId !== this.props.userInfo.userId;
    const tileList = this.state.tileList;
    const brokenTiles = tileList.filter(t => t.targetLocation.startsWith(`p${seatIndex}-broken`));
    const targetRowTiles =
      targetRowIndex === -1
        ? brokenTiles
        : tileList.filter(t =>
            t.targetLocation.startsWith(`p${seatIndex}-staging-${targetRowIndex}`)
          );
    const currentRowCount = targetRowTiles.length;
    const currentBrokenTileCount = brokenTiles.length;
    let numToBrokenTiles = 0;
    let numToStagingRow = 0;
    let tileIdsToRemove = [];

    const [tilesToPlayer, tilesToTable] = _.partition(
      tileList.filter(tile => {
        if (factoryIndex === -1) {
          return tile.groupName === 'table' && (tile.color === tileColor || tile.isStartingPlayer);
        } else {
          return tile.groupName === 'factory' && tile.groupIndex === factoryIndex;
        }
      }),
      tile => tile.color === tileColor || tile.isStartingPlayer
    );

    tilesToPlayer.forEach(tile => {
      tile.stopSpinning();
      // if the target row can accept the incoming tile
      if (currentRowCount + numToStagingRow <= targetRowIndex && tile.color !== STARTING_PLAYER) {
        tile.updateLocation(
          `p${seatIndex}`,
          'staging',
          targetRowIndex,
          currentRowCount + numToStagingRow,
          isOpponentPull
        );
        numToStagingRow++;
      } else if (currentBrokenTileCount + numToBrokenTiles < DROPPED_TILE_PENALTIES.length) {
        tile.updateLocation(
          `p${seatIndex}`,
          'broken',
          0,
          currentBrokenTileCount + numToBrokenTiles,
          isOpponentPull
        );
        numToBrokenTiles++;
      } else {
        tile.destroy();
        tileIdsToRemove.push(tile.id);
      }
    });

    _.sortBy(tileList.filter(t => t.groupName === 'table'), 'tileIndex')
      .concat(tilesToTable)
      .forEach((tile, index) => {
        tile.stopSpinning();
        tile.updateLocation('common', 'table', 0, index);
      });

    this.setState({ tileList: _.reject(tileList, t => tileIdsToRemove.includes(t.id)) });
  }

  transferTilesToFinalRow(params) {
    const { seatIndex, rowIndex, columnIndex, tileColor } = params;
    const tileList = this.state.tileList;
    const isOpponentTransfer =
      _.find(this.props.gameState.players, { seatIndex }).userId !== this.props.userInfo.userId;
    const tileToTransfer = _.find(tileList, {
      targetLocation: `p${seatIndex}-staging-${rowIndex}-0`,
      color: tileColor,
    });
    tileToTransfer.updateLocation(
      `p${seatIndex}`,
      'final',
      rowIndex,
      columnIndex,
      isOpponentTransfer
    );
    tileList.forEach(t => {
      if (t.targetLocation.startsWith(`p${seatIndex}-staging-${rowIndex}`)) {
        t.destroy();
      }
    });

    this.setState({
      tileList: _.reject(tileList, t =>
        t.targetLocation.startsWith(`p${seatIndex}-staging-${rowIndex}`)
      ),
    });
  }

  removeBrokenTiles() {
    const tileList = this.state.tileList;
    _.find(tileList, { color: STARTING_PLAYER }).updateLocation('common', 'table', 0, 0, false);
    tileList.forEach(t => {
      if (t.groupName === 'broken') {
        t.destroy();
      }
    });
    this.setState({ tileList: _.reject(tileList, t => t.groupName === 'broken') });
  }

  selectTile(tile) {
    if (!tile.isCommunalTile) {
      return;
    }
    if (tile.isSelected) {
      this.state.tileList.forEach(t => t.unselect());
      this.setState({ tileList: this.state.tileList });
    } else {
      this.selectTiles(tile.groupName, tile.groupIndex, tile.color);
    }
  }

  selectTiles(groupName, groupIndex, color) {
    this.state.tileList.forEach(tile => {
      if (tile.isSelected) {
        tile.unselect();
      }
      if (
        groupName === tile.groupName &&
        groupIndex === tile.groupIndex &&
        [color, STARTING_PLAYER].includes(tile.color)
      ) {
        tile.select();
      }
    });
    this.setState({ tileList: this.state.tileList });
  }

  pullAndStageTiles(args) {
    const { currentRoundNumber, currentTurnNumber, activeSeatIndex } = this.props.gameState;
    const { factoryIndex, tileColor, targetRowIndex } = args;

    const gameAction = {
      type: TILE_PULL,
      roundNumber: currentRoundNumber,
      turnNumber: currentTurnNumber,
      params: {
        seatIndex: activeSeatIndex,
        factoryIndex,
        tileColor,
        targetRowIndex,
      },
    };
    // Update local state:
    this.props.pullAndStageTiles(gameAction);
    // Update server state:
    this.props.socket.emit('pullAndStageTiles', gameAction);
    // Update tile positions:
    this.updateTethers(gameAction);
  }

  transferTiles(args) {
    const { seatIndex, rowIndex, columnIndex, tileColor } = args;
    const { currentRoundNumber } = this.props.gameState;

    const gameAction = {
      type: TILE_TRANSFER,
      roundNumber: currentRoundNumber,
      params: {
        rowIndex,
        columnIndex,
        tileColor,
        seatIndex,
      },
    };

    // Update local state:
    this.props.transferTiles(gameAction);
    // Update server state:
    this.props.socket.emit('transferTiles', gameAction);
    // Update tile positions:
    this.updateTethers(gameAction);
  }

  getSelectedTiles() {
    return this.state.tileList.filter(t => t.isSelected);
  }

  render() {
    if (!this.props.gameState) {
      return <div>Loading...</div>;
    }
    return (
      <Azul
        {...this.props.gameState}
        selectedTiles={this.getSelectedTiles()}
        userInfo={this.props.userInfo}
        selectTiles={this.selectTiles.bind(this)}
        pullAndStageTiles={this.pullAndStageTiles.bind(this)}
        transferTiles={this.transferTiles.bind(this)}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const userInfo = state.userInfo;
  const socket = state.currentGame.socket;
  const gameState = state.currentGame.gameState;
  const gameId = ownProps.match.params.gameId;
  return { userInfo, socket, gameState, gameId };
};

export default connect(
  mapStateToProps,
  {
    receiveGameState,
    connectedToGame,
    refillFactories,
    pullAndStageTiles,
    transferTiles,
    receiveGameActions,
  }
)(AzulContainer);
