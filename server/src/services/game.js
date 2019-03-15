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
      const tileTransfers = GameController.getTileTransfers(newState)
      newState = await GameController.saveAndApplyActions(gameId, tileTransfers, newState)
      io.in(`azul:${gameId}`).emit('gameUpdate', newState)
      if (newState.seatsRequiringInput.length === 0) {
        await GameController.incrementRound(gameId)
        io.in(`azul:${gameId}`).emit('startOfRound', newState.currentRoundNumber + 1)
      }
    }
  })
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
