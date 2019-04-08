import React from 'react';

import ProfileContainer from 'components/container/ProfileContainer';

function Navbar(props) {
  if (props.location.pathname === '/login') {
    return null;
  }

  return (
    <nav>
      <span className="page-title">AZUL Online</span>
      <ProfileContainer />
    </nav>
  );
}

export default Navbar;
