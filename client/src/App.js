import React from 'react';
import { connect } from 'react-redux';
import http from 'http-instance'
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import 'app.scss';
import { login } from 'redux/actions';
import Navbar from 'components/presentation/Navbar';
import LobbyContainer from 'components/container/LobbyContainer';
import LoginContainer from 'components/container/LoginContainer';
import AzulContainer from 'components/container/AzulContainer';

const mapStateToProps = state => {
  return { ...state };
};

class App extends React.Component {
  componentDidMount() {
    http
      .post('/auth')
      .then(res => {
        const userInfo = res.data;
        if (userInfo.userId && userInfo.username) {
          this.props.login(userInfo);
        }
      })
      .catch(err => {
        console.log('auth failed');
      });
  }

  render() {
    return (
      <Router>
        <>
          <Route path="/" component={Navbar} />
          <Route
            path="/"
            render={routeProps => {
              // No need to redirect if user is routing to either /login or /azul/:gameid
              let regex = /\/azul\/\d+|\/login/g;
              if (this.props.userInfo.isLoggedIn || routeProps.location.pathname.match(regex)) {
                return null;
              } else {
                return <Redirect to="/login" />;
              }
            }}
          />
          <Switch>
            <Route path="/login" component={LoginContainer} />
            <Route path="/lobby" component={LobbyContainer} />
            <Route path="/azul/:gameId" render={routeProps => <AzulContainer {...routeProps} />} />
            <Redirect to="/login" />
          </Switch>
        </>
      </Router>
    );
  }
}

export default connect(
  mapStateToProps,
  { login }
)(App);
