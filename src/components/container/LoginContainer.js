import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'

import { login } from 'redux/actions'
import Login from 'components/presentation/Login'

const mapDispatchToProps = dispatch => {
  return {
    login: payload => dispatch(login(payload))
  }
}

const LoginContainer = props => {
  const submitLogin = (username, password) => {
    axios.post('/auth/login', {
      username,
      password
    }).then(res => {
      props.login(res.data)
    }).catch(err => {
      throw new Error(err.message)
    })
  }

  return <Login login={submitLogin} />
}

export default connect(
  null,
  { login }
)(LoginContainer)
