const express = require('express')
const app = express()
const session = require('express-session')
const server = require('http').Server(app)
const redisClient = require('redis').createClient()
const RedisStore = require('connect-redis')(session);

const auth = require('./routes/auth')
const games = require('./routes/games')
const users = require('./routes/users')

/**
 * Web socket services
 */
const io = require('socket.io')(server)
const gamesService = require('./services/games')
io.on('connection', gamesService)

/**
 * JSON parsing
 */
const bodyParser = require('body-parser')
app.use(bodyParser.json())

/**
 * Session middleware using express-session and redis
 */
const sessionMiddleware = session({
  store: new RedisStore({
    client: redisClient
  }),
  secret: 'coltarian the barbarian',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 5 * 1000,
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
redisClient.on('error', function (err) {
  console.log('could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function (err) {
  console.log('connected to redis successfully');
});
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

app.use('/auth', auth)
app.use('/games', games)
app.use('/users', users)

server.listen(3000, () => {
  console.log('listening on port 3000')
})
