const userRouter = require('express').Router()

userRouter.route('/').get((req, res) => {
  db.select()
    .table('users')
    .then(users => {
      res.status(200).json(users)
    })
})

module.exports = userRouter
