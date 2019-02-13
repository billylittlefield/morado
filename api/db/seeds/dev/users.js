const bcrypt = require('bcryptjs')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, username: 'colt', password: bcrypt.hashSync('suchakitty', 10)},
        {id: 2, username: 'hannskarl', password: bcrypt.hashSync('l33tpro', 10)},
        {id: 3, username: 'plumbob', password: bcrypt.hashSync('simsSIMSsims', 10)}
      ]);
    });
};
