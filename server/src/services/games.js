import { AZUL } from '@shared/azul/game-invariants'
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
  socket.on('pullAndStageTiles', async gameAction => {
    let newState
    try {
      newState = await GameController.applyAction(gameId, gameAction)
    } catch (err) {
      throw err
    }
    io.in(`azul:${gameId}`).emit('gameUpdate', gameId, AZUL, newState)
  })
  socket.emit('gameUpdate', gameId, AZUL, gameState)
  io.in(`azul:${gameId}`).emit('userJoined', userInfo)
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
