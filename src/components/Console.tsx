import React, { Component, useEffect, useRef, useState } from 'react';
import { Pane, Heading, Badge, Menu, Popover, Position, Avatar, IconButton, Tab, Portal, Tablist, Button, SideSheet, Paragraph, Card } from 'evergreen-ui'
import { FullCircleIcon, RefreshIcon, EditIcon, SwapVerticalIcon, FullscreenIcon, LogOutIcon, CogIcon } from 'evergreen-ui'
import { FitAddon } from 'xterm-addon-fit'
import XTerm from './term/XTerm'
import theme from './term/term_theme'

import './console.less'

interface SiderSftpState {
  selectedIndex: number
}

interface SideSftpProps {
  isShown: boolean
  hideSideSheeeet: ()=> void
}

const SiderSftp = ({isShown, hideSideSheeeet}: SideSftpProps) => {
  const [ state, setState ] = useState<SiderSftpState>({selectedIndex: 0})
  return (
    <>
      <SideSheet
        isShown={isShown}
        onCloseComplete={hideSideSheeeet}
        containerProps={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
        }}
      >
        <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
          <Pane padding={16} borderBottom="muted">
            <Heading size={600}>SFTP</Heading>
            <Paragraph size={400} color="muted">
              ssh.hpcer.dev
            </Paragraph>
          </Pane>
          <Pane display="flex" padding={8}>
            <Tablist>
              {['Traits', 'Event History', 'Identities'].map(
                (tab, index) => (
                  <Tab
                    key={tab}
                    isSelected={state.selectedIndex === index}
                    onSelect={() => setState({selectedIndex: index })}
                  >
                    {tab}
                  </Tab>
                )
              )}
            </Tablist>
          </Pane>
        </Pane>
        <Pane flex="1" overflowY="scroll" background="tint1" padding={16}>
          <Card
            backgroundColor="white"
            elevation={0}
            height={240}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Heading>Some content</Heading>
          </Card>
        </Pane>
      </SideSheet>
    </>
  )
}
const Console = () => {
  const [isSideSheetShown, setSideSheetShwon] = useState<boolean>(false)
  const terminalRef = useRef<XTerm>(null)
  const fitAddon = new FitAddon()
  // let ws: WebSocket | undefined = undefined

  useEffect(() => {
    // Once the terminal is loaded write a new line to it.
    const term = terminalRef.current!.terminal
    term.writeln('Welcome to SSH web-console!')
    fitAddon.fit()
    return () => {
    }
  }, [])

  return (
    <Pane height="100vh" display="flex" flexDirection="column" borderRadius={3}>
      <Pane display="flex" flexDirection="row" alignItems="center" background="rgba(27,33,47,0.86)">
        <Heading padding={18} color="white">SSH Web Console</Heading>
        <Pane padding={18} flex={1} alignItems="center" alignContent="center" textAlign="center">
          <FullCircleIcon verticalAlign="baseline" size={10} color="success" marginRight={8} />
          <Badge isInteractive textTransform="lowercase" color="green">
            { } ssh.hpcer.dev
        </Badge>
        </Pane>
        <Popover
          position={Position.BOTTOM_LEFT}
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item>@genshen</Menu.Item>
              </Menu.Group>
              <Menu.Divider/>
              <Menu.Group>
                <Menu.Item icon={LogOutIcon} intent="danger">
                  Exit...
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
        >
          <Avatar isSolid name="genshen" size={36} marginRight={36} cursor="pointer" />
        </Popover>
      </Pane>
      <Pane flex={1}>
        <XTerm
          className="term-container"
          options={{
            cursorBlink: true,
            bellStyle: 'sound',
            theme: theme.default_theme,
          }}
          addons={[fitAddon]}
          ref={terminalRef}
        />
      </Pane>
      <Pane>
        <SiderSftp isShown={isSideSheetShown} hideSideSheeeet={() => {
          setSideSheetShwon(false)
        }}/>
        <Button intent="success" onClick={() => setSideSheetShwon(true)}>
          SFTP
        </Button>
      </Pane>
      <Portal>
        <Pane
          className="toolbar"
          zIndex={9}
          borderRadius={4}
          display="flex"
          flexDirection="column"
          background="#2d8cf0"
          padding={0}
          position="fixed"
          top={120}
          right={64}>
          <Button appearance="minimal" marginY={8} className="toolbar-item">
            <RefreshIcon color="white" size={10} />
          </Button>
          <Button appearance="minimal" marginY={8} className="toolbar-item" onClick={() => setSideSheetShwon(true)}>
            <SwapVerticalIcon color="white" size={10} />
          </Button>
          <Button appearance="minimal" marginY={8} className="toolbar-item">
            <FullscreenIcon color="white" size={10} />
          </Button>
          <Button appearance="minimal" marginY={8} className="toolbar-item">
            <CogIcon color="white" size={10} />
          </Button>
        </Pane>
      </Portal>
    </Pane>
  );
}

export default Console
