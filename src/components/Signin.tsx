import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Pane, Heading, TextInputField, GeolocationIcon, FormField, toaster } from 'evergreen-ui';

interface FieldState {
  isInvalid: boolean
  validationMessage: string | undefined
  value: string
}


const Signin = (props: RouteComponentProps) => {
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
      setHostField({isInvalid: true, validationMessage: "@Host is required", value: host})
      return false
    }
    const list = host.split(":")
    if (list.length === 1) {
      setHostField({isInvalid: false, validationMessage: undefined, value: host})
      return true
    } else if (list.length === 2 && list[1].length !== 0 && !isNaN(Number(list[1]))) {
      setHostField({isInvalid: false, validationMessage: undefined, value: host})
      return true
    } else {
      setHostField({isInvalid: true, validationMessage: "@host is wrong format", value: host})
      return false
    }
  }

  const onUsernameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event!.target!.value.trim()
    if (!username || username === '') {
      setUnameField({isInvalid: true, validationMessage: "@Username can not be empty", value: username})
      return false
    }
    setUnameField({isInvalid: false, validationMessage: undefined, value: username})
    return true
  }

  const doSignin = () => {
    if(hostField.isInvalid || unameField.isInvalid ) {
      toaster.warning(
        '@signin.form_has_error',
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
        <Heading marginBottom="0.6rem" marginTop="0.6rem" size={700}>@Signin SSH Web Console!</Heading>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          doSignin()
          return false
        }}>
          <Pane textAlign="left">
            <TextInputField
              isInvalid={hostField.isInvalid}
              validationMessage={hostField.validationMessage}
              label="@Host"
              onChange={onHostChanged}
              onBlur={onHostChanged}
              placeholder="ip:port, e.g: ssh.hpcer.dev:22"
              marginBottom="8px"
            />
            <TextInputField
              isInvalid={unameField.isInvalid}
              label="@User"
              onChange={onUsernameChanged}
              onBlur={onUsernameChanged}
              placeholder="username"
              validationMessage={unameField.validationMessage}
              marginBottom="8px"
            />
            <TextInputField
              label="@Password"
              type="password"
              placeholder="Password"
              onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
                // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
                if (event.key === 'Enter') {
                  event.preventDefault()
                  event.stopPropagation()
                  doSignin()
                }
              }}
              marginBottom="24px"
            />
          </Pane>
          <FormField>
            <Button type="submit" width="100%" appearance="primary" intent="success" iconBefore={GeolocationIcon}>
              @Signin
              {/* <Spinner size={16} /> */}
            </Button>
          </FormField>
        </form>
      </div>
    </Pane>)
}

export default Signin
