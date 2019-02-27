import React from 'react'
import { connect } from 'react-redux'

import ProfileContainer from 'components/container/ProfileContainer'

class Nav extends React.Component {
  render() {
    const componentToRender = this.props.user.isLoggedIn ? (
      <ProfileContainer user={this.props.user} />
    ) : null

    return (
      <nav>
        <span className="page-title">AZUL Online</span>
        {componentToRender}
      </nav>
    )
  }
}

export default connect(null)(Nav)
