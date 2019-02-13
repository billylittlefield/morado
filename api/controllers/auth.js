const bcrypt = require('bcryptjs')
const db = require('../db')

module.exports = {
  async authenticate(username, password) {
    const [user] = await db('users').where('username', username)
    
    if (!user) { 
      return Promise.reject(new Error('Username not found')) 
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return Promise.reject(new Error('Incorrect password'))
    }

    return Promise.resolve({ username: user.username, userId: user.id })
  }
}
