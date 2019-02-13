exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments()
      table.string('username').notNullable()
      table.string('password')
    }),

    knex.schema.createTable('games', table => {
      table.increments()
      table.enu('title', ['azul']).notNullable()
      table.timestamp('start_time').nullable()
      table.timestamps(false, true)
    }),

    knex.schema.createTable('game_plays', table => {
      table.increments()
      table
        .integer('game_id')
        .notNullable()
        .unsigned()
      table.foreign('game_id').references('games.id')
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
      table.foreign('user_id').references('users.id')
    }),

    knex.schema.createTable('azul_actions', table => {
      table.increments()
      table
        .integer('action_id')
        .notNullable()
        .unsigned()
      table
        .integer('game_id')
        .notNullable()
        .unsigned()
      table.foreign('game_id').references('games.id')
      table
        .integer('round_number')
        .notNullable()
        .unsigned()
      table
        .integer('turn_number')
        .notNullable()
        .unsigned()
      table.enu('action_type', ['tile_pull', 'tile_transfer', 'factory_refill']).notNullable()
      table
        .integer('tile_pull_id')
        .nullable()
        .unsigned()
      table.foreign('tile_pull_id').references('azul_tile_pulls.id')
      table
        .integer('tile_transfer_id')
        .nullable()
        .unsigned()
      table.foreign('tile_transfer_id').references('azul_tile_transfers.id')
      table
        .integer('azul_factory_refill')
        .nullable()
        .unsigned()
      table.foreign('azul_factory_refill').references('azul_factory_refills.id')
    }),

    knex.schema.createTable('azul_tile_pulls', table => {
      table.increments()
      table
        .integer('player_id')
        .notNullable()
        .unsigned()
      table.foreign('player_id').references('users.id')
      table
        .integer('factory_id')
        .notNullable()
        .unsigned()
      table
        .integer('target_row_index')
        .notNullable()
        .unsigned()
      table.enu('tile_type', ['blue', 'yellow', 'red', 'black', 'snowflake']).notNullable()
    }),

    knex.schema.createTable('azul_tile_transfers', table => {
      table.increments()
      table
        .integer('player_id')
        .notNullable()
        .unsigned()
      table.foreign('player_id').references('users.id')
      table
        .integer('row_index')
        .notNullable()
        .unsigned()
      table
        .integer('column_index')
        .notNullable()
        .unsigned()
      table.enu('tile_type', ['blue', 'yellow', 'red', 'black', 'snowflake']).notNullable()
    }),

    knex.schema.createTable('azul_factory_refills', table => {
      table.increments()
      table
        .integer('factory_id')
        .notNullable()
        .unsigned()
      table.string('factory_code', 6).notNullable()
    }),

    knex.schema.createTable('sessions', table => {
      table.string('session_id').primary()
      table.json('session').notNullable()
      table.timestamp('expires').notNullable()
    })
  ])
}

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('azul_actions'),
    knex.schema.dropTable('azul_factory_refills'),
    knex.schema.dropTable('azul_tile_transfers'),
    knex.schema.dropTable('azul_tile_pulls'),
    knex.schema.dropTable('game_plays'),
    knex.schema.dropTable('games'),
    knex.schema.dropTable('users'),
    knex.schema.dropTable('sessions'),
  ])
}
