const AuthController = require('./../controllers/auth')
const moment = require('moment')

const authRouter = require('express').Router()

authRouter.route('/').post((req, res) => {
  let savedUserInfo = {}

  if (req.session.userInfo) {
    if (moment.utc() < req.session.cookie.expires) {
      savedUserInfo = req.session.userInfo
    }
    req.session.regenerate(err => {
      req.session.userInfo = savedUserInfo
      res.status(200).json({ ...savedUserInfo })
    })
  } else {
    res.status(200).end()
  }
})

authRouter.route('/login').post((req, res) => {
  const { username, password } = req.body

  AuthController.authenticate(username, password)
    .then(userInfo => {
      req.session.regenerate(err => {
        req.session.userInfo = userInfo
        res.status(200).json(userInfo)
      })
    })
    .catch(err => {
      res.status(401).send(err.message)
    })
  }
)

authRouter.route('/logout').post((req, res) => {
  req.session.destroy(() => {
    res.status(204).end()
  })
})

module.exports = authRouter
