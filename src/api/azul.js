import openSocket from 'socket.io-client'

// const socket = openSocket('http://localhost:3000')

export function subscribeToGame(cb) {
  socket.on('gameUpdate', gameState => cb(null, gameState))
  socket.emit('subscribeToGame')
}

export function pullTiles(cb) {
  socket.emit('pullTiles', { color: 'red', playerId: '1234' })
}
