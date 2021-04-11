import React, { useEffect, useRef, useState } from 'react'
import {
  Pane,
  Text,
  Heading,
  Badge,
  Menu,
  Popover,
  Position,
  Avatar,
  Portal,
  Button,
  toaster,
  CornerDialog,
} from 'evergreen-ui'
import {
  FullCircleIcon,
  UngroupObjectsIcon,
  RefreshIcon,
  SwapVerticalIcon,
  FullscreenIcon,
  MinimizeIcon,
  LogOutIcon,
  CogIcon,
  ErrorIcon,
  DisableIcon,
} from 'evergreen-ui'
import { RouteComponentProps } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

import XTerm from './term/XTerm'
import theme from './term/term_theme'
import FileTrans, { NodeConfig, ConnStatus } from './FileTrans'
import sshWebSocket from '../libs/sshwebsocket'
import terminalResize from '../libs/terminal-resize'
import Util from '../libs/utils'
import apiRouters from '../config/api_routers'
import Config from '../config/config'
import stringFormat from '../libs/string_format'

import './console.less'

type ConnStatusProps = {
  host: string
  status: ConnStatus
}

const ConnectionStatus = (props: ConnStatusProps) => {
  if (props.status === ConnStatus.Connecting) {
    return (
      <>
        <UngroupObjectsIcon
          verticalAlign="baseline"
          size={10}
          color="info"
          marginRight={8}
        />
        <Badge isInteractive textTransform="lowercase" color="blue">
          waiting connection
        </Badge>
      </>
    )
  } else if (props.status === ConnStatus.ConnectionLost) {
    return (
      <>
        <DisableIcon
          verticalAlign="baseline"
          size={10}
          color="#FAE2E2"
          marginRight={8}
        />
        <Badge isInteractive color="red">
          connection lost
        </Badge>
      </>
    )
  } else {
    return (
      <>
        <FullCircleIcon
          verticalAlign="baseline"
          size={10}
          color="success"
          marginRight={8}
        />
        <Badge isInteractive textTransform="lowercase" color="green">
          {props.host}
        </Badge>
      </>
    )
  }
}

const Console = (props: RouteComponentProps) => {
  const [isSideSheetShown, setSideSheetShwon] = useState<boolean>(false)
  const terminalRef = useRef<XTerm>(null)
  const { t } = useTranslation(['translation', 'console'])
  const [fitAddon] = useState<FitAddon>(new FitAddon())
  const [webLinksAddon] = useState<WebLinksAddon>(new WebLinksAddon())
  const [fullscreen, setFullscreen] = useState<boolean>(false)
  const [connecting, setConnecting] = useState<ConnStatus>(
    ConnStatus.Connecting,
  )
  const [nodeConfig, setNodeConfig] = useState<NodeConfig>({
    host: 'waiting connection',
    username: 'Loading',
  })
  const [showCornerDialog, setShowCornerDialog] = useState<boolean>(false)

  let ws: WebSocket | null = null

  useEffect(() => {
    const lhost = window.localStorage.getItem('user.host')
    const luname = window.localStorage.getItem('user.username')
    if (lhost === null) {
      return
    }
    if (luname === null) {
      return
    }
    setNodeConfig({ host: lhost, username: luname })
  }, [])

  useEffect(() => {
    // Once the terminal is loaded write a new line to it.
    const term = terminalRef.current!.terminal
    fitAddon.fit()
    term.writeln('Welcome to SSH web-console!')

    const _t = sessionStorage.getItem(Config.jwt.tokenName)
    if (_t === null) {
      toaster.danger(t('console:web_socket_expire'))
      // setConnecting(ConnStatus.ConnectionLost)
      props.history.push('/signin')
      return
    }

    ws = new WebSocket(
      Util.loadWebSocketUrl(
        apiRouters.router.ws_ssh,
        stringFormat.format(
          apiRouters.params.ws_ssh,
          term.cols + '',
          term.rows + '',
          _t,
        ),
      ),
    )
    ws.binaryType = 'arraybuffer'
    ws.onopen = () => {
      setConnecting(ConnStatus.ConnectionAlive)
    }

    ws.onclose = () => {
      term.setOption('cursorBlink', false)
      sessionStorage.removeItem(Config.jwt.tokenName)
      setConnecting(ConnStatus.ConnectionLost)
      setShowCornerDialog(true)
    }

    sshWebSocket.bindTerminal(term, ws!, true, -1)
    terminalResize.bindTerminalResize(term, ws!)
    return () => {
      if (ws !== null) {
        ws.close()
      }
    }
  }, [])

  useEffect(() => {
    fitAddon.fit()
  }, [fullscreen])

  const onWindowResize = () => {
    fitAddon.fit()
  }
  const closeWindowListener = (ev: BeforeUnloadEvent) => {
    ev.preventDefault()
    ev.returnValue = t('console:make_sure_to_leave')
  }

  useEffect(() => {
    window.addEventListener('resize', onWindowResize)
    window.addEventListener('beforeunload', closeWindowListener)
    return () => {
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('beforeunload', closeWindowListener)
    }
  }, [])

  return (
    <Pane height="100vh" display="flex" flexDirection="column" borderRadius={3}>
      <Pane
        display="flex"
        flexDirection="row"
        alignItems="center"
        background="rgba(27,33,47,0.86)">
        <Heading padding={18} color="white">
          {' '}
          {t('title')}
        </Heading>
        <Pane
          padding={18}
          flex={1}
          alignItems="center"
          alignContent="center"
          textAlign="center">
          <ConnectionStatus status={connecting} host={nodeConfig.host} />
        </Pane>
        <Popover
          position={Position.BOTTOM_LEFT}
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item>
                  {'@'} {nodeConfig.username}{' '}
                </Menu.Item>
              </Menu.Group>
              <Menu.Divider />
              <Menu.Group>
                <Menu.Item
                  icon={LogOutIcon}
                  intent="danger"
                  onSelect={() => {
                    toaster.notify('under develop!', { id: 'dev' })
                  }}>
                  {t('console:nav_user_exit')}
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }>
          <Avatar
            isSolid
            name={nodeConfig.username}
            size={36}
            marginRight={36}
            cursor="pointer"
          />
        </Popover>
      </Pane>
      <Pane flex={1} overflowY="hidden">
        <XTerm
          className={
            fullscreen ? 'term-container fullscreen' : 'term-container'
          }
          options={{
            cursorBlink: true,
            bellStyle: 'sound',
            theme: theme.default_theme,
          }}
          addons={[fitAddon, webLinksAddon]}
          ref={terminalRef}
        />
      </Pane>
      <Pane display="flex" alignItems="center">
        <FileTrans
          isShown={isSideSheetShown}
          node={{ host: nodeConfig.host, username: nodeConfig.username }}
          sshStatus={connecting}
          hideSideSheeeet={() => {
            setSideSheetShwon(false)
          }}
        />
        <Button intent="success" onClick={() => setSideSheetShwon(true)}>
          SFTP
        </Button>
        <Button
          intent="none"
          marginLeft="0.05rem"
          onClick={() => {
            toaster.notify('under develop!', { id: 'dev' })
          }}>
          Paste
        </Button>
        <Pane flex="1"></Pane>
        <Text marginRight="0.4rem">active time: 0:00:00</Text>
      </Pane>
      <CornerDialog
        title={
          <Text size={500} color="danger" alignItems="center" display="flex">
            <ErrorIcon marginRight="0.2rem" />{' '}
            {t('console:ssh_disconn_dialog_title')}
          </Text>
        }
        isShown={showCornerDialog}
        hasClose={false}
        cancelLabel={t('console:ssh_disconn_dialog_cancel_btn')}
        confirmLabel={t('console:ssh_disconn_dialog_confirm_btn')}
        onConfirm={() => {
          props.history.push('/signin')
        }}
        containerProps={{ zIndex: 20 }}
        onCloseComplete={() => setShowCornerDialog(false)}>
        {t('console:ssh_disconn_dialog_text')}
      </CornerDialog>
      <Portal>
        <Pane
          className="toolbar"
          zIndex={10}
          borderRadius={4}
          display="flex"
          flexDirection="column"
          background="#2d8cf0"
          padding={0}
          position="fixed"
          top={120}
          right={64}>
          <Button
            appearance="minimal"
            marginY={8}
            className="toolbar-item"
            onClick={() => {
              toaster.notify('under develop!', { id: 'dev' })
            }}>
            <RefreshIcon color="white" size={10} />
          </Button>
          <Button
            appearance="minimal"
            marginY={8}
            className="toolbar-item"
            onClick={() => setSideSheetShwon(true)}>
            <SwapVerticalIcon color="white" size={10} />
          </Button>
          <Button
            appearance="minimal"
            marginY={8}
            className="toolbar-item"
            onClick={() => {
              setFullscreen(!fullscreen)
            }}>
            {!fullscreen && <FullscreenIcon color="white" size={10} />}
            {fullscreen && <MinimizeIcon color="white" size={10} />}
          </Button>
          <Button
            appearance="minimal"
            marginY={8}
            className="toolbar-item"
            onClick={() => {
              toaster.notify('under develop!', { id: 'dev' })
            }}>
            <CogIcon color="white" size={10} />
          </Button>
        </Pane>
      </Portal>
    </Pane>
  )
}

export default Console
