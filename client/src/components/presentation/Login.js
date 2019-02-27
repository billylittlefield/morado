import React, { useState } from 'react'

function Login(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleChange(e) {
    switch (e.target.id) {
      case 'username':
        setUsername(e.target.value)
        break
      case 'password':
        setPassword(e.target.value)
        break
    }
  }

  function resetFields() {
    setUsername('')
    setPassword('')
  }

  function login(e) {
    e.preventDefault()
    props.login(username, password)
    resetFields()
  }

  function signUp(e) {
    e.preventDefault()
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        <div>
          <input
            onChange={handleChange}
            id="username"
            type="text"
            value={username}
            placeholder="Username"
          />
        </div>
        <div>
          <input
            onChange={handleChange}
            id="password"
            type="password"
            value={password}
            placeholder="Password"
          />
        </div>
        <div id="new-user-container">
          <span>New user?</span>
          <a id="sign-up-button" onClick={signUp}>
            Sign up
          </a>
        </div>
        <div>
          <button id="login-button" className="mdc-button mdc-button--unelevated" onClick={login}>
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login
