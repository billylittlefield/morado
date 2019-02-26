const db = require('../db')
const _ = require('lodash')

const GameController = require('../controllers/game')

const userRouter = require('express').Router()

userRouter.route('/:userId/games').get(async (req, res) => {
  
  const games = await GameController.fetchGamesByUserId(req.params.userId)

  res.status(200).json({ games })
})

module.exports = userRouter
