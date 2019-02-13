const environment = process.env.NODE_ENV || 'development'
const knexConfig = require('./knexfile')[environment]
const database = require('knex')(knexConfig)

module.exports = database
