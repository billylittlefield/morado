import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import { logout } from 'redux/actions'

function Profile(props) {
  const user = props.user

  function submitLogout() {
    axios
      .post('/auth/logout', {
        userId: user.userId,
      })
      .finally(() => {
        props.logout()
      })
  }

  return (
    <div className="profile-container">
      <div className="user-greeting">{user.username}</div>
      <button className="mdc-button mdc-button--unelevated" onClick={submitLogout}>
        <span className="mdc-button__label">Logout</span>
      </button>
    </div>
  )
}

export default connect(
  null,
  { logout }
)(Profile)
