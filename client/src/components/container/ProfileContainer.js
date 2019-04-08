import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import http from 'http-instance'

import { logout } from 'redux/actions';

function Profile(props) {
  const { userId, username, isLoggedIn } = props.userInfo;

  function submitLogout() {
    http
      .post('/auth/logout', {
        userId,
      })
      .finally(() => {
        props.logout();
      });
  }

  function redirectToLogin() {
    props.history.push('/login');
  }

  const logoutButton = (
    <>
      <div className="user-greeting">{username}</div>
      <button className="mdc-button mdc-button--unelevated" onClick={submitLogout}>
        <span className="mdc-button__label">Logout</span>
      </button>
    </>
  );

  const loginButton = (
    <>
      <button className="mdc-button mdc-button--unelevated" onClick={redirectToLogin}>
        <span className="mdc-button__label">Login</span>
      </button>
    </>
  );

  return <div className="profile-container">{isLoggedIn ? logoutButton : loginButton}</div>;
}

export default connect(
  state => ({ userInfo: state.userInfo }),
  { logout }
)(withRouter(Profile));
