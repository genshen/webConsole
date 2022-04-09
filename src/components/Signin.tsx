import React, { useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {
  Button,
  Pane,
  Heading,
  TextInputField,
  GeolocationIcon,
  FormField,
  toaster,
} from 'evergreen-ui'
import { useTranslation } from 'react-i18next'

import Config from '../config/config'
import Utils from '../libs/utils'
import apiRouters from '../config/api_routers'

interface FieldState {
  isInvalid: boolean
  validationMessage: string | undefined
  value: string
}

const checkHostFormat = (host: string) => {
  if (!host || host === '') {
    return [false, '', 0]
  }
  const index = host.lastIndexOf(':')
  const hostList = host.split(':')
  if (index == -1) {
    // ipv4 or domain without port inside address
    return [true, host, 22]
  } else if (hostList.length == 8 || hostList.length == 1) {
    // ipv6 without port inside address
    return [true, host, 22]
  }

  if (
    hostList.length === 9 &&
    hostList[8].length !== 0 &&
    !isNaN(Number(hostList[8]))
  ) {
    // ipv6 with port inside address
    return [true, host.slice(0, index), parseInt(hostList[8])]
  } else if (
    hostList.length === 2 &&
    hostList[1].length !== 0 &&
    !isNaN(Number(hostList[1]))
  ) {
    // ipv4 or domain with port inside address
    return [true, hostList[0], parseInt(hostList[1])]
  }
  return [false, host, 22]
}

const Signin = (props: RouteComponentProps) => {
  const { t } = useTranslation(['signin'])

  const lhost = window.localStorage.getItem('user.host')
  const luname = window.localStorage.getItem('user.username')

  const [hostField, setHostField] = useState<FieldState>({
    isInvalid: false,
    validationMessage: undefined,
    value: lhost ? lhost : '',
  })
  const [unameField, setUnameField] = useState<FieldState>({
    isInvalid: false,
    validationMessage: undefined,
    value: luname ? luname : '',
  })
  const [passwdField, setPasswdField] = useState<string>('')
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const onHostChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const host = event!.target!.value.trim()
    if (!host || host === '') {
      // set required error
      setHostField({
        isInvalid: true,
        validationMessage: t('signin:form_fullhost_required'),
        value: host,
      })
      return false
    }
    const [ok] = checkHostFormat(host)
    if (ok) {
      setHostField({
        isInvalid: false,
        validationMessage: undefined,
        value: host,
      })
      return true
    } else {
      setHostField({
        isInvalid: true,
        validationMessage: t('signin:form_fullhost_error'),
        value: host,
      })
      return false
    }
  }

  const onUsernameChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event!.target!.value.trim()
    if (!username || username === '') {
      setUnameField({
        isInvalid: true,
        validationMessage: t('signin:form_username_required'),
        value: username,
      })
      return false
    }
    setUnameField({
      isInvalid: false,
      validationMessage: undefined,
      value: username,
    })
    return true
  }

  const onPasswdChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event!.target!.value.trim()
    setPasswdField(password)
  }

  const doSignin = () => {
    // still check form when submitting.
    // (e.g. We don't edit input box, leaving it blank,
    // which makes host and username empty, but `isInvalid` is still false).
    let hasError = false
    if (hostField.isInvalid || unameField.isInvalid) {
      hasError = true
      // we dont need show error message and invalid statue here, because it is alreay in invalid status.
    }
    if (!hostField.value || hostField.value === '') {
      hasError = true
      setHostField({
        isInvalid: true,
        validationMessage: t('signin:form_fullhost_required'),
        value: hostField.value,
      })
    }
    if (!unameField.value || unameField.value === '') {
      hasError = true
      setUnameField({
        isInvalid: true,
        validationMessage: t('signin:form_username_required'),
        value: unameField.value,
      })
    }
    // prepare data for login
    const [ok, host, port] = checkHostFormat(hostField.value)
    if (!ok) {
      hasError = true
      setHostField({
        isInvalid: true,
        validationMessage: t('signin:form_fullhost_error'),
        value: hostField.value,
      })
    }
    if (hasError) {
      toaster.warning(t('signin:form_has_error'), { id: 'forbidden-action' })
      return
    } else {
      toaster.closeAll()
    }

    // this.$Loading.start();
    setSubmitLoading(true)
    // post to login
    Utils.axiosInstance
      .post(Utils.loadUrl(apiRouters.router.sign_in, null), {
        // _xsrf: Utils.base64Decode(xsrf.split("|")[0]), // todo
        host: host,
        port: port,
        username: unameField.value,
        passwd: passwdField,
      })
      .then((response) => {
        try {
          if (!response.data || response.data.has_error) {
            // self.$Loading.error();
            switch (response.data.message) {
              case 0:
                toaster.danger(t('signin:form_has_error'))
                break
              case 1:
                toaster.danger(t('signin:form_error_passport'))
                break
              case 2:
                toaster.danger(t('signin:form_error_ssh_login'))
                break
            }
          } else {
            if (!response.data.addition) {
              // self.$Loading.error();
              toaster.danger(t('signin:form_error_remote_server'))
            } else {
              // self.$Loading.finish();
              toaster.success(t('signin:signin_success'))
              localStorage.setItem('user.host', hostField.value)
              localStorage.setItem('user.username', unameField.value)
              sessionStorage.setItem(
                Config.jwt.tokenName,
                response.data.addition,
              )

              props.history.push('/console')
            }
          }
        } catch (e) {
          // self.$Loading.error();
          toaster.danger(t('signin:form_error_ssh_login'))
        }
        setSubmitLoading(false)
      })
      .catch((e: Error) => {
        // self.$Loading.error();
        toaster.danger(t('signin:form_error_ssh_login') + ': ' + e.message)
        setSubmitLoading(false)
      })
    // } else {
    //   toaster.danger(this.$t('global.error_occurs_try_refresh'))
    // }
  }

  return (
    <Pane
      alignItems="center"
      justifyContent="center"
      display="flex"
      flexDirection="column">
      <div
        style={{ minHeight: '360px', marginTop: '10rem', textAlign: 'center' }}>
        <Heading marginBottom="0.6rem" marginTop="0.6rem" size={700}>
          {t('signin:form_title')}
        </Heading>
        <form
          onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            doSignin()
            return false
          }}>
          <Pane textAlign="left">
            <TextInputField
              value={hostField.value}
              isInvalid={hostField.isInvalid}
              validationMessage={hostField.validationMessage}
              label={t('signin:form_fullhost_label')}
              onChange={onHostChanged}
              onBlur={onHostChanged}
              placeholder={t('signin:form_fullhost_ph')}
              marginBottom="8px"
            />
            <TextInputField
              value={unameField.value}
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
              onChange={onPasswdChanged}
              onBlur={onPasswdChanged}
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
            <Button
              isLoading={submitLoading}
              type="submit"
              width="100%"
              appearance="primary"
              justifyContent="center"
              intent="success"
              iconBefore={GeolocationIcon}>
              {t('signin:form_submit_btn')}
            </Button>
          </FormField>
        </form>
      </div>
    </Pane>
  )
}

export default Signin
