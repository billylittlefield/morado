import React, { useState } from 'react';

function Login(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  function handleChange(e) {
    switch (e.target.id) {
      case 'username':
        setUsername(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      case 'confirm-password':
        setConfirmPassword(e.target.value);
        break;
    }
  }

  function resetFields() {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  }

  function loginOrSignup(e) {
    e.preventDefault();
    if (isSigningUp) {
      props.signup(username, password, confirmPassword);
    } else {
      props.login(username, password);
    }
    resetFields();
  }

  function toggleVisibleForm(e) {
    e.preventDefault();
    setIsSigningUp(!isSigningUp);
  }

  function renderUsernameField() {
    return (
      <div>
        <input
          onChange={handleChange}
          id="username"
          type="text"
          value={username}
          placeholder="Username"
        />
      </div>
    );
  }

  function renderPasswordField(isConfirmPassword = false) {
    return (
      <div>
        <input
          onChange={handleChange}
          id={isConfirmPassword ? 'confirm-password' : 'password'}
          type="password"
          value={isConfirmPassword ? confirmPassword : password}
          placeholder={isConfirmPassword ? 'Confirm password' : 'Password'}
        />
      </div>
    );
  }

  function renderConfirmPasswordField() {
    return renderPasswordField(true);
  }

  function renderSignupOrLoginText() {
    return (
      <div id="change-form-container">
        <span>{isSigningUp ? 'Already registered?' : 'New user?'}</span>
        <a id="change-form-button" onClick={toggleVisibleForm}>
          {isSigningUp ? 'Login' : 'Sign up'}
        </a>
      </div>
    );
  }

  function renderSubmitButton() {
    return (
      <div>
        <button
          id="login-button"
          className="mdc-button mdc-button--unelevated"
          onClick={loginOrSignup}>
          {isSigningUp ? 'Create' : 'Login'}
        </button>
      </div>
    );
  }

  return (
    <section className="login-page-container">
      <h1 className="page-title">AZUL Online</h1>
      <div className="login-form-container">
        <h2>{isSigningUp ? 'Create account' : 'Login'}</h2>
        <form>
          {renderUsernameField()}
          {renderPasswordField()}
          {isSigningUp ? renderConfirmPasswordField() : null}
          {renderSignupOrLoginText()}
          {renderSubmitButton()}
        </form>
      </div>
    </section>
  );
}

export default Login;
