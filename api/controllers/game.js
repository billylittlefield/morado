const db = require('../db')

module.exports = {
  async createGame(userInfo) {
    const [gameId] = await db('games').insert({ title: 'azul' })

    await db('game_plays').insert({
      game_id: gameId,
      user_id: 1,
    })

    return gameId
  },
}
