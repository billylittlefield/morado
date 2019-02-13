const moment = require('moment')
const db = require('../db')

function validateUser(socket) {
  const session = socket.request.session
  
  if (!session.userInfo) {
    socket.emit('sessionExpired')
    socket.disconnect()
  }
}

function findOrCreateNewGame() {
  const games = await db('games')
    .select('games.id')
    .where('games.start_time', null)
    .andWhere('games.title', 'azul')
    .join('game_plays', 'games.id', 'game_plays.game_id')
    .havingRaw('count(*) < 4')
    .groupBy('games.id')
}

function GameService(socket) {
  socket.on('queueToPlay', () => {
    validateUser(socket)
    console.log(`User is queued for a game of Azul`)
    findOrCreateNewGame()
  })
}

module.exports = GameService
