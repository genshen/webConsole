import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Pane, Heading, TextInputField, GeolocationIcon, FormField, toaster } from 'evergreen-ui';
import { useTranslation } from 'react-i18next'

interface FieldState {
  isInvalid: boolean
  validationMessage: string | undefined
  value: string
}


const Signin = (props: RouteComponentProps) => {
  const { t } = useTranslation(['signin'])

  const defaultFieldState = {
    isInvalid: false,
    validationMessage: undefined,
    value: ''
  }
  const [hostField, setHostField] = useState<FieldState>(defaultFieldState)
  const [unameField, setUnameField] = useState<FieldState>(defaultFieldState)

  const onHostChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const host = event!.target!.value.trim()
    if (!host || host === '') {
      // set required error
      setHostField({ isInvalid: true, validationMessage: t('signin:form_fullhost_required'), value: host })
      return false
    }
    const list = host.split(":")
    if (list.length === 1) {
      setHostField({ isInvalid: false, validationMessage: undefined, value: host })
      return true
    } else if (list.length === 2 && list[1].length !== 0 && !isNaN(Number(list[1]))) {
      setHostField({ isInvalid: false, validationMessage: undefined, value: host })
      return true
    } else {
      setHostField({ isInvalid: true, validationMessage: t('signin:form_fullhost_error'), value: host })
      return false
    }
  }

  const onUsernameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event!.target!.value.trim()
    if (!username || username === '') {
      setUnameField({ isInvalid: true, validationMessage: t('signin:form_username_required'), value: username })
      return false
    }
    setUnameField({ isInvalid: false, validationMessage: undefined, value: username })
    return true
  }

  const doSignin = () => {
    if(hostField.isInvalid || unameField.isInvalid ) {
      toaster.warning(
        t('signin:form_has_error'),
        {
          id: 'forbidden-action'
        }
      )
      return
    } else {
      toaster.closeAll()
    }
    // post to login
    props.history.push('/console');
  }

  return (
    <Pane alignItems="center" justifyContent="center" display="flex" flexDirection="column">
      <div style={{ minHeight: "360px", marginTop: "10rem", textAlign: 'center' }}>
        <Heading marginBottom="0.6rem" marginTop="0.6rem" size={700}>
          {t('signin:form_title')}
        </Heading>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          doSignin()
          return false
        }}>
          <Pane textAlign="left">
            <TextInputField
              isInvalid={hostField.isInvalid}
              validationMessage={hostField.validationMessage}
              label={t('signin:form_fullhost_label')}
              onChange={onHostChanged}
              onBlur={onHostChanged}
              placeholder={t('signin:form_fullhost_ph')}
              marginBottom="8px"
            />
            <TextInputField
              isInvalid={unameField.isInvalid}
              label={t('signin:form_username_label')}
              onChange={onUsernameChanged}
              onBlur={onUsernameChanged}
              placeholder={t('signin:form_username_ph')}
              validationMessage={unameField.validationMessage}
              marginBottom="8px"
            />
            <TextInputField
              label={t('signin:form_passwd_label')}
              type="password"
              placeholder={t('signin:form_passwd_ph')}
              marginBottom="24px"
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
                // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
                if (event.key === 'Enter') {
                  event.preventDefault()
                  event.stopPropagation()
                  doSignin()
                }
              }}
            />
          </Pane>
          <FormField>
            <Button type="submit" width="100%" appearance="primary" intent="success" iconBefore={GeolocationIcon}>
              {t('signin:form_submit_btn')}
            </Button>
          </FormField>
        </form>
      </div>
    </Pane>)
}

export default Signin
