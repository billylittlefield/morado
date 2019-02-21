const { AZUL } = require('../../shared/azul/game-invariants')

module.exports = io => {
  const GameController = require('../controllers/game')

  function validateUser(socket) {
    const session = socket.request.session
    
    if (!session.userInfo) {
      socket.emit('sessionExpired')
      socket.disconnect()
    }
  }
  
  async function joinGame(socket, gameId, userInfo) {
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

  function GameService(socket) {
    socket.on('queueToPlay', async () => {
      const userInfo = socket.request.session.userInfo
      validateUser(socket)

      let gameId
      try {
        gameId = await GameController.joinAvailableGame(userInfo)
      } catch (err) {
        throw err
      }      
      joinGame(socket, gameId, userInfo)
    })

    socket.on('joinGame', gameId => {
      const userInfo = socket.request.session.userInfo
      validateUser(socket)
      joinGame(socket, gameId, userInfo)
    })
  }

  return GameService
}
