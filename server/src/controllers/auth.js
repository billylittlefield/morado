import bcrypt from 'bcryptjs';
import db from 'db';

export default {
  async authenticate(username, password) {
    const [user] = await db('users').where('username', username);

    if (!user) {
      return Promise.reject(new Error('Username not found'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Promise.reject(new Error('Incorrect password'));
    }

    return Promise.resolve({ username: user.username, userId: user.id });
  },

  async createAccount(username, password) {
    const [existingUser] = await db('users').where('username', username);
    if (existingUser) {
      return Promise.reject(new Error('Username already taken'));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userId] = await db('users').insert({ username, password: hashedPassword });
    return Promise.resolve({ username, userId });
  },
};
