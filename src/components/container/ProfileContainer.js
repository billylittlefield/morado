import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import { logout } from 'redux/actions'

function Profile(props) {
  const user = props.user

  function submitLogout() {
    axios.post('/auth/logout', {
      userId: user.userId,
    }).finally(() => {
      props.logout()
    })
  }

  return (
    <>
      <div>Hello, {user.username}</div>
      <button onClick={submitLogout}>Logout</button>
    </>
  )
}

export default connect(
  null,
  { logout }
)(Profile)
