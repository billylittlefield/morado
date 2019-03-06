import knex from 'knex'

import knexConfig from 'db/knexfile'

const environment = process.env.NODE_ENV || 'development'

// Singleton DB instance
export default knex(knexConfig[environment])
