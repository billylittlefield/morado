import React from 'react'
import { connect } from 'react-redux'
import io from 'socket.io-client'

import { logout } from 'redux/actions'

let socket

function Lobby(props) {

  function joinGame() {
    socket = io.connect('localhost:3000')
    socket.on('sessionExpired', props.logout)
    socket.emit('queueToPlay')
  }

  return (
    <section className="lobby">
      <button onClick={joinGame} >Join Game</button>
    </section>
  )
}

export default connect(null, { logout })(Lobby)
