const bcrypt = require('bcryptjs')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries. Promise ordering is for foreign key constraints
  return Promise.all([
    knex('azul_actions').del(),
    knex('game_plays').del(),
  ]).then(() => {
    return Promise.all([
      knex('games').del(),
      knex('users').del()
    ])
  }).then(() => {
    // Add seed data. Promise ordering is for foreign key constraints
    return Promise.all([
      knex('users').insert([
        {id: 1, username: 'colt', password: bcrypt.hashSync('suchakitty', 10)},
        {id: 2, username: 'hannskarl', password: bcrypt.hashSync('leetpro', 10)},
        {id: 3, username: 'a', password: bcrypt.hashSync('b', 10)}
      ]),
      knex('games').insert([
        {id: 1, options: JSON.stringify({ numPlayers: 2, useColorTemplate: true, name: 'Game number one' }), start_time: new Date(), current_round_number: 1 },
        {id: 2, options: JSON.stringify({ numPlayers: 2, useColorTemplate: true, name: 'Game number two' }), start_time: new Date(), current_round_number: 1 },
        {id: 3, options: JSON.stringify({ numPlayers: 4, useColorTemplate: true, name: 'Game number three' }), current_round_number: 0 },
      ]),
    ]).then(() => {
      return Promise.all([
        knex('game_plays').insert([
          {id: 1, user_id: 1, game_id: 1, seat_index: 0},
          {id: 2, user_id: 2, game_id: 1, seat_index: 1},
          {id: 3, user_id: 1, game_id: 2, seat_index: 0},
          {id: 4, user_id: 2, game_id: 2, seat_index: 1},
        ]),
        knex('azul_actions').insert([
          {id: 1, game_id: 1, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 0, factoryCode: '0121'})},
          {id: 2, game_id: 1, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 1, factoryCode: '3410'})},
          {id: 3, game_id: 1, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 2, factoryCode: '2113'})},
          {id: 4, game_id: 1, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 3, factoryCode: '4410'})},
          {id: 5, game_id: 1, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 4, factoryCode: '0023'})},
          {id: 6, game_id: 1, round_number: 1, turn_number: 1, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 0, targetRowIndex: 3, factoryIndex: 1, tileColor: 'snowflake'})},
          {id: 7, game_id: 1, round_number: 1, turn_number: 2, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 1, targetRowIndex: 3, factoryIndex: 2, tileColor: 'blue'})},
          {id: 8, game_id: 1, round_number: 1, turn_number: 3, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 0, targetRowIndex: 4, factoryIndex: 3, tileColor: 'blue'})},
          {id: 9, game_id: 2, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 0, factoryCode: '0000'})},
          {id: 10, game_id: 2, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 1, factoryCode: '1111'})},
          {id: 11, game_id: 2, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 2, factoryCode: '2222'})},
          {id: 12, game_id: 2, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 3, factoryCode: '3333'})},
          {id: 13, game_id: 2, round_number: 1, turn_number: 0, type: 'FACTORY_REFILL', params: JSON.stringify({factoryIndex: 4, factoryCode: '4444'})},
          {id: 14, game_id: 2, round_number: 1, turn_number: 1, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 0, targetRowIndex: 0, factoryIndex: 0, tileColor: 'black'})},
          {id: 15, game_id: 2, round_number: 1, turn_number: 2, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 1, targetRowIndex: 0, factoryIndex: 1, tileColor: 'blue'})},
          {id: 16, game_id: 2, round_number: 1, turn_number: 3, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 0, targetRowIndex: 1, factoryIndex: 2, tileColor: 'red'})},
          {id: 17, game_id: 2, round_number: 1, turn_number: 4, type: 'TILE_PULL', params: JSON.stringify({seatIndex: 1, targetRowIndex: 1, factoryIndex: 3, tileColor: 'snowflake'})},
        ]),
      ])
    })
  })
}
