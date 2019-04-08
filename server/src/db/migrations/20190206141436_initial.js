exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', table => {
      table.increments()
      table.string('username').notNullable()
      table.string('password')
    }),

    knex.schema.createTable('games', table => {
      table.increments()
      table.timestamp('start_time').nullable()
      table.json('options').notNullable()
      table
        .boolean('is_complete')
        .notNullable()
        .defaultTo(false)
      table
        .integer('current_round_number')
        .notNullable()
        .defaultTo(0)
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
      table
        .integer('seat_index')
        .notNullable()
        .unsigned()
      table.integer('final_score').unsigned()
      table.integer('final_place').unsigned()
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
      table.integer('turn_number').unsigned()
      table.enu('type', ['TILE_PULL', 'TILE_TRANSFER', 'FACTORY_REFILL', 'TILE_DUMP']).notNullable()
      table.json('params')
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
