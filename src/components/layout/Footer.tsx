import React from 'react'
import { Pane, Button, GitRepoIcon } from 'evergreen-ui'
import { useTranslation } from 'react-i18next'
import { SwitchLang } from '../../locales/i18n'
import './footer.less'
const githublink = 'https://github.com/genshen/ssh-web-console'

function Footer() {
  const { t } = useTranslation(['translation'])
  return (
    <Pane
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding={16}
      background="tint2"
      borderRadius={3}>
      <Pane>
        <Button
          is="a"
          target="_blank"
          href={githublink}
          marginRight={8}
          iconBefore={GitRepoIcon}
          appearance="minimal">
          {' '}
          Github{' '}
        </Button>
        <Button marginRight={8} onClick={SwitchLang}>
          {' '}
          {t('switch_lang')}{' '}
        </Button>
      </Pane>
    </Pane>
  )
}

export default Footer
