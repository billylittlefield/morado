# azul

The app is structured accordingly:
```
├── client
│   ├── dist
│   ├── node_modules
│   └── src
│       ├── components
│       ├── redux
│       └── styles
├── server
│   ├── dist
│   ├── node_modules
│   └── src
│       ├── controllers
│       ├── db
│       ├── routes
│       └── services
└── shared
│   ├── node_modules
    └── azul
```
Node modules are kept separate for `client`, `server`, and `shared` packages. The `shared` folder, which contains (surprise, surprise) code shared across both `client` and `server`. Both `client` and `server` have their own `webpack.config.js`. The `shared` package is aliased as `@shared` in the webpack configs for both client and server. 

Because we use webpack to transpile the node server code, we need to build before restarting the server. `npm start` has been configured in `/server/package.json` to run `webpack && server --inspect /src/server`. I think this can be avoided with `babel-node`, but the 4 minutes I spent trying to get that to work were unsuccessful and this works fine.

## Start the apps...

Call `npm start` in each folder (`/server`, `/client`).

Server runs on :3000, client on :8080. Navigate to localhost:8080 to see the app.

## Server structure

|__server/
|____dist/
|____node_modules/
|____src/
|______controllers/
|______db/
|______routes/
|______services/
|______server.js
|______db.js

`src/controllers` - interfaces between API/socket endpoint and DB
`src/routes` - HTTP API handlers
`src/services` - websocket handlers
`src/db` - seed files, migrations, and configs for knex.js, used as our js=>sql language converter

We want to be able to access the database proxy from many files, so its exported from `./db.js` and can be imported anywhere.

`server.js` is the root file that wires all routes and services to the app server.
