// Update with your config settings.

export default {
  development: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      database: 'azul',
      user: 'root',
      password: 'c0ltistheb3st!',
      charset: 'utf8',
    },
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/dev',
    },
    useNullAsDefault: true,
  },
}
