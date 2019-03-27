import GameController from 'controllers/game'

function validateUser(socket) {
  const session = socket.request.session

  if (!session.userInfo) {
    socket.emit('sessionExpired')
    socket.disconnect()
  }
}

async function joinGame(io, socket, gameId, userInfo) {
  let gameState

  try {
    gameState = await GameController.getGameState(gameId)
  } catch (err) {
    throw err
  }

  socket.join(`azul:${gameId}`)
  io.in(`azul:${gameId}`).emit('userJoined', userInfo)
  io.in(`azul:${gameId}`).emit('gameUpdate', gameState)

  socket.on('pullAndStageTiles', async gameAction => {
    let newState
    try {
      newState = await GameController.saveAndApplyActions(gameId, [gameAction])
    } catch (err) {
      throw err
    }
    io.in(`azul:${gameId}`).emit('gameUpdate', newState)

    if (GameController.isRoundOver(newState)) {
      io.in(`azul:${gameId}`).emit('endOfRound', newState.currentRoundNumber)
      const tileDump = GameController.generateTileDump(newState)
      const tileTransfers = GameController.generateTileTransfers(newState)
      newState = await GameController.saveAndApplyActions(gameId, [tileDump, ...tileTransfers], newState)
      io.in(`azul:${gameId}`).emit('gameUpdate', newState)
      startRoundIfReady(gameId, newState, newState.currentRoundNumber + 1)
    }
  })

  socket.on('transferTiles', async gameAction => {
    let newState
    try {
      newState = await GameController.saveAndApplyActions(gameId, [gameAction])
    } catch (err) {
      throw err
    }

    io.in(`azul:${gameId}`).emit('gameUpdate', newState)
    startRoundIfReady(gameId, newState, newState.currentRoundNumber + 1)
  })

  async function startRoundIfReady(gameId, state, newRoundNumber) {
    if (Object.keys(state.seatsRequiringInput).length === 0) {
      let newState = await GameController.incrementRound(gameId)
      io.in(`azul:${gameId}`).emit('startOfRound', newRoundNumber)
      const factoryRefills = GameController.generateFactoryRefills(state)
      newState = await GameController.saveAndApplyActions(gameId, factoryRefills, state)
      io.in(`azul:${gameId}`).emit('gameUpdate', newState)
    }
  }
}

export default function(io) {
  return function GameService(socket) {
    socket.on('joinGame', gameId => {
      const userInfo = socket.request.session.userInfo
      validateUser(socket)
      joinGame(io, socket, gameId, userInfo)
    })
  }
}
