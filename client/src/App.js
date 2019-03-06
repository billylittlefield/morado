import React from 'react'
import { connect } from 'react-redux'
import axios from 'axios'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom'

import 'app.scss'
import { login } from 'redux/actions'
import LobbyRoute from 'components/routes/LobbyRoute'
import LoginRoute from 'components/routes/LoginRoute'
import NavbarContainer from 'components/container/NavbarContainer'
import AzulContainer from 'components/container/AzulContainer'

const mapStateToProps = state => {
  return { ...state }
}

class App extends React.Component {
  componentDidMount() {
    axios
      .post('/auth')
      .then(res => {
        const userInfo = res.data
        if (userInfo.userId && userInfo.username) {
          this.props.login(userInfo)
        }
      })
      .catch(err => {
        console.log('auth failed')
      })
  }

  render() {
    return (
      <Router>
        <>
          <NavbarContainer userInfo={this.props.userInfo} />
          <Switch>
            <Route exact path="/" render={props => <Redirect to="/login" />} />
            <Route path="/login" render={props => <LoginRoute userInfo={this.props.userInfo} />} />
            <Route path="/lobby" component={LobbyRoute} />
            <Route path="/azul/:gameId" render={routeProps => <AzulContainer {...routeProps} />} />
            <Redirect to="/lobby" />
          </Switch>
        </>
      </Router>
    )
  }
}

export default connect(
  mapStateToProps,
  { login }
)(App)
