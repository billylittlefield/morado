import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import { login } from 'redux/actions'
import Login from 'components/presentation/Login'

function LoginContainer(props) {
  function submitLogin(username, password) {
    axios
      .post('/auth/login', {
        username,
        password,
      })
      .then(res => {
        props.login(res.data)
      })
      .catch(err => {
        throw new Error(err.message)
      })
  }

  function submitSignup(username, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match")
    }
    axios.post('/auth/signup', {
      username,
      password
    }).then(res => {
      props.login(res.data)
    }).catch(err => {
      throw new Error(err.message)
    })
  }

  return <Login login={submitLogin} signup={submitSignup} />
}

export default connect(
  null,
  { login }
)(LoginContainer)
