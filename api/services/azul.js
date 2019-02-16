const {
  TILE_COLORS,
  NUM_TILES_OF_COLOR,
  DROPPED_TILE_PENALTIES,
  REQUIRED_ORDER,
} = require('../util/game-invariants')

function getInitialGameState() {
  const initialState = {
    playerBoards: [createNewPlayerBoard(0, true), createNewPlayerBoard(1, true)],
    freshTiles: Array(TILE_COLORS.length * NUM_TILES_OF_COLOR)
      .fill()
      .map((_, index) => {
        return TILE_COLORS[index % TILE_COLORS.length]
      }),
    factories: Array(5)
      .fill()
      .map(() => []),
    discardTiles: [],
    tableTiles: [],
    round: 0,
    turn: 0,
    firstPlayerNextRound: null,
    turnHistory: [],
    historyIndex: 0,
    activePlayerIndex: 0,
  }
}

function createNewPlayerBoard(playerId, useRequiredOrder) {
  return {
    playerId,
    stagingRows: Array(5)
      .fill()
      .map((_, index) => {
        return { tiles: Array(index + 1).fill(null), rowSize: index + 1 }
      }),
    finalRows: Array(5)
      .fill()
      .map((_, index) => {
        const requiredOrder = useRequiredOrder ? REQUIRED_ORDER[index] : null
        return { tiles: Array(5).fill(null), rowSize: 5, requiredOrder }
      }),
    brokenTiles: Array(DROPPED_TILE_PENALTIES.length).fill(null),
  }
}

module.exports = client => {
  console.log('user connected')

  client.on('disconnect', () => {
    console.log('user disconnected')
  })

  client.on('subscribeToGame', params => {
    console.log('user subscribed to game')
    const initialGameState = getInitialGameState()
    client.emit('gameUpdate', { fizz: 'buzz' })

    client.on('pullTiles', () => {
      console.log('user pulled tiles')
    })
  })
}
