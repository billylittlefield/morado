import GameController from 'controllers/game';

function validateUser(socket) {
  const session = socket.request.session;

  if (!session.userInfo) {
    socket.emit('sessionExpired');
    socket.disconnect();
  }
}

async function joinGame(io, socket, gameId, userInfo) {
  let gameState;

  try {
    gameState = await GameController.getGameState(gameId);
  } catch (err) {
    throw err;
  }

  socket.join(`azul:${gameId}`);
  io.in(`azul:${gameId}`).emit('userJoined', userInfo);
  io.in(`azul:${gameId}`).emit('gameUpdate', gameState);

  socket.on('pullAndStageTiles', async gameAction => {
    // Update the other clients in the room
    socket.to(`azul:${gameId}`).emit('pullAndStageTiles', gameAction);

    let updatedState;
    try {
      updatedState = await GameController.saveAndApplyActions(gameId, [gameAction]);
    } catch (err) {
      throw err;
    }
    io.in(`azul:${gameId}`).emit('gameUpdate', updatedState);

    if (GameController.isRoundOver(updatedState)) {
      io.in(`azul:${gameId}`).emit('endOfRound', updatedState.currentRoundNumber);
      const tileDump = GameController.generateTileDump(updatedState);
      const tileTransfers = GameController.generateTileTransfers(updatedState);
      const newActions = [tileDump, ...tileTransfers];
      io.in(`azul:${gameId}`).emit('gameActions', newActions);
      updatedState = await GameController.saveAndApplyActions(gameId, newActions, updatedState);
      io.in(`azul:${gameId}`).emit('gameUpdate', updatedState);
      startRoundIfReady(gameId, updatedState, updatedState.currentRoundNumber + 1);
    }
  });

  socket.on('transferTiles', async gameAction => {
    // Update the other clients in the room
    socket.to(`azul:${gameId}`).emit('transferTiles', gameAction);

    let updatedState;
    try {
      updatedState = await GameController.saveAndApplyActions(gameId, [gameAction]);
    } catch (err) {
      throw err;
    }
    io.in(`azul:${gameId}`).emit('gameUpdate', updatedState);

    startRoundIfReady(gameId, updatedState, updatedState.currentRoundNumber + 1);
  });

  async function startRoundIfReady(gameId, state, newRoundNumber) {
    if (GameController.isGameOver(state)) {
      io.in(`azul:${gameId}`).emit('endOfGame');
      GameController.endGame(gameId, state);
    } else {
      if (Object.keys(state.seatsRequiringInput).length === 0) {
        await GameController.incrementRound(gameId);
        io.in(`azul:${gameId}`).emit('startOfRound', newRoundNumber);
        const factoryRefills = GameController.generateFactoryRefills(state);
        io.in(`azul:${gameId}`).emit('gameActions', factoryRefills);
        let updatedState = await GameController.saveAndApplyActions(gameId, factoryRefills, state);
        io.in(`azul:${gameId}`).emit('gameUpdate', updatedState);
      }
    }
  }
}

export default function(io) {
  return function GameService(socket) {
    socket.on('joinGame', gameId => {
      const userInfo = socket.request.session.userInfo;
      validateUser(socket);
      joinGame(io, socket, gameId, userInfo);
    });

    socket.on('leaveGame', gameId => {
      socket.leave(`azul:${gameId}`);
    });
  };
}
