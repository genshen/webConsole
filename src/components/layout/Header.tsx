import React from 'react';
import { Pane, Heading } from 'evergreen-ui'
import { Link } from 'react-router-dom';

import "./header.less"

const Header = () => {
  return (
    <Pane display="flex" padding={16} background="tint2" border={false} className="header-pane">
      <Pane flex={1} alignItems="center" display="flex">
        <Heading size={600}>
        <Link to="/" className="focus-ring-link">
          SSH Web Console
        </Link>
        </Heading>
      </Pane>
    </Pane>
  )
}

export default Header
