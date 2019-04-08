import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import http from 'http-instance'

import { login } from 'redux/actions';
import Login from 'components/presentation/Login';

function LoginContainer(props) {
  function submitLogin(username, password) {
    http
      .post('/auth/login', {
        username,
        password,
      })
      .then(res => {
        props.login(res.data);
      })
      .catch(err => {
        throw new Error(err.message);
      });
  }

  function submitSignup(username, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error("Passwords don't match");
    }
    http
      .post('/auth/signup', {
        username,
        password,
      })
      .then(res => {
        props.login(res.data);
      })
      .catch(err => {
        throw new Error(err.message);
      });
  }

  if (props.shouldRedirectToLobby) {
    return <Redirect to="/lobby" />;
  }
  return <Login login={submitLogin} signup={submitSignup} />;
}

export default connect(
  state => ({ shouldRedirectToLobby: state.userInfo.isLoggedIn }),
  { login }
)(LoginContainer);
