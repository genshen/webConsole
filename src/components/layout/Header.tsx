import React from 'react';
import { Pane, Heading } from 'evergreen-ui'
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'

import "./header.less"

const Header = () => {
  const { t } = useTranslation(['translation'])
  return (
    <Pane display="flex" padding={16} background="tint2" border={false} className="header-pane">
      <Pane flex={1} alignItems="center" display="flex">
        <Heading size={600}>
        <Link to="/" className="focus-ring-link">
          { t('title') }
        </Link>
        </Heading>
      </Pane>
    </Pane>
  )
}

export default Header
