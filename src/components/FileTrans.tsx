import React, { useState } from "react"
import { Card, Heading, Pane, Paragraph, SideSheet, Tab, Tablist } from "evergreen-ui"

export enum ConnStatus {
  Connecting = 1,
  ConnectionAlive,
  ConnectionLost,
}

interface SiderSftpState {
  selectedIndex: number
}

export interface NodeConfig {
  host: string
  username: string
}

interface SideSftpProps {
  isShown: boolean
  node: NodeConfig
  hideSideSheeeet: () => void
}

const FileTrans = ({ isShown, node, hideSideSheeeet }: SideSftpProps) => {
  const [state, setState] = useState<SiderSftpState>({ selectedIndex: 0 })
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
              {node.username}@{ node.host }
            </Paragraph>
          </Pane>
          <Pane display="flex" padding={8}>
            <Tablist>
              {['Traits', 'Event History', 'Identities'].map(
                (tab, index) => (
                  <Tab
                    key={tab}
                    isSelected={state.selectedIndex === index}
                    onSelect={() => setState({ selectedIndex: index })}
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
            <Heading>SFTP content</Heading>
          </Card>
        </Pane>
      </SideSheet>
    </>
  )
}

export default FileTrans