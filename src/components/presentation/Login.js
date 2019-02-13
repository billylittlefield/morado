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

  function login() {
    props.login(username, password)
    resetFields()
  }

  return (
    <div className="login-container">
      <input
        onChange={handleChange}
        id="username"
        type="text"
        value={username}
        placeholder="Username"
      />
      <input
        onChange={handleChange}
        id="password"
        type="password"
        value={password}
        placeholder="Password"
      />
      <button onClick={login}>Submit</button>
    </div>
  )
}

export default Login
