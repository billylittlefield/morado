import moment from 'moment'
import express from 'express'

import AuthController from 'controllers/auth'

const authRouter = express.Router()

function regenerateSession(req, res, userInfo) {
  req.session.regenerate(err => {
    req.session.userInfo = userInfo
    res.status(200).json({ ...userInfo })
  })
}

authRouter.route('/').post((req, res) => {
  if (req.session.userInfo && moment.utc() < req.session.cookie.expires) {
    regenerateSession(req, res, req.session.userInfo)
  } else {
    res.status(401).end()
  }
})

authRouter.route('/login').post((req, res) => {
  const { username, password } = req.body

  AuthController.authenticate(username, password)
    .then(userInfo => {
      regenerateSession(req, res, userInfo)
    }).catch(err => {
      res.status(401).send(err.message)
    })
})

authRouter.route('/logout').post((req, res) => {
  req.session.destroy(() => {
    res.status(204).end()
  })
})

authRouter.route('/signup').post((req, res) => {
  const { username, password } = req.body

  AuthController.createAccount(username, password)
    .then(userInfo => {
      regenerateSession(req, res, userInfo)
    }).catch(err => {
      res.status(400).send(err.message)
    })
})

export default authRouter
