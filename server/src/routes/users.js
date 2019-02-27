import _ from 'lodash'
import express from 'express'

import GameController from 'controllers/game'

const userRouter = express.Router()

userRouter.route('/:userId/games').get(async (req, res) => {
  const games = await GameController.fetchGamesByUserId(req.params.userId)

  res.status(200).json({ games })
})

export default userRouter
