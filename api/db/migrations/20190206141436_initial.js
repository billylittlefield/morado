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
      table.json('options').notNullable()
      table.boolean('isComplete').notNullable().defaultTo(false)
      table.timestamps(true, true)
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
      table.integer('seat_index').notNullable().unsigned()
    }),

    knex.schema.createTable('azul_actions', table => {
      table.increments()
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
      table.enu('action_type', ['TILE_PULL', 'TILE_TRANSFER', 'FACTORY_REFILL']).notNullable()
      table.json('action_params').notNullable()
      table.timestamps(true, true)
    }),
  ])
}

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('azul_actions'),
    knex.schema.dropTable('game_plays'),
    knex.schema.dropTable('games'),
    knex.schema.dropTable('users'),
  ])
}
