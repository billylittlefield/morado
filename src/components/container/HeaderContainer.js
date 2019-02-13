import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'

import LoginContainer from 'components/container/LoginContainer'
import ProfileContainer from 'components/container/ProfileContainer'
import { login } from 'redux/actions'

class Header extends React.Component {
  componentDidMount() {
    axios.post('/auth').then(res => {
      const userInfo = res.data
      if (userInfo.userId && userInfo.username) {
        this.props.login(userInfo)
      }
    })
  }

  render() {
    const componentToRender =
      this.props.user.isLoggedIn ?
      <ProfileContainer user={this.props.user} /> :
      <LoginContainer />
  
    return (
      <header>
        {componentToRender}
      </header>
    )
  }
}

export default connect(
  null,
  { login }
)(Header)
