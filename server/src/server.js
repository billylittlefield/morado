import express from 'express'
import session from 'express-session'
import http from 'http'
import redis from 'redis'
import socketIO from 'socket.io'
import connectRedis from 'connect-redis'
import bodyParser from 'body-parser'

const app = express()
const server = http.Server(app)

/**
 * Web socket services
 */

const io = socketIO(server)
import gamesServiceCreator from 'services/games'
const gamesService = gamesServiceCreator(io)
io.on('connection', gamesService)

/**
 * JSON parsing
 */
app.use(bodyParser.json())

/**
 * Session middleware using express-session and redis
 */
const RedisStore = connectRedis(session)
const redisClient = redis.createClient()
const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient,
  }),
  secret: 'coltarian the barbarian',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60 * 60 * 1000,
  },
  name: 'session_id',
  domain: 'http://localhost:8080',
})
app.use(sessionMiddleware)
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next)
})

/**
 * Enable CORS for client requests
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Vary', 'Origin')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

/**
 * Chrome debugging issue spams requests to `/json/version`. Explicit no-op.
 */
app.use('/json', () => {})

/**
 * If the user is already logged in, or is attempting to login, continue to appropriate router.
 * Otherwise, 401 here and do not continue to route.
 */
app.use((req, res, next) => {
  if (req.url.startsWith('/auth')) {
    return next()
  }

  if (req.session.userInfo) {
    return next()
  }

  res.status(401).end()
})

/**
 * =========== ROUTES ===========
 */
import auth from 'routes/auth'
import games from 'routes/games'
import users from 'routes/users'
import gameplays from 'routes/gameplays'

app.use('/auth', auth)
app.use('/games', games)
app.use('/users', users)
app.use('/gameplays', gameplays)

server.listen(3000, () => {
  console.log('listening on port 3000')
})
