import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Heading, Pane, Paragraph, SideSheet, Strong, Tab, Tablist, toaster } from "evergreen-ui"
import { FolderCloseIcon, DocumentIcon, DocumentShareIcon, UploadIcon } from "evergreen-ui"
import { useTranslation } from "react-i18next"

import Config from '../config/config'
import Utils from "../libs/utils"
import apiRouters from '../config/api_routers'
import './file_trans.less'
import stringFormat from "../libs/string_format"

const HOME = "HOME";

export enum ConnStatus {
  Connecting = 1,
  ConnectionAlive,
  ConnectionLost,
}

interface SiderSftpState {
  selectedIndex: number
}

type FileItem = {
  path: string
  name: string
  is_dir: boolean
  loading: boolean
  children?: Array<FileItem>
}

export interface NodeConfig {
  host: string
  username: string
}

interface SideSftpProps {
  isShown: boolean
  node: NodeConfig
  sshStatus: ConnStatus
  hideSideSheeeet: () => void
}

type CurrentPath = {
  current_path: string
  display_path: string
}

const DefaultFileList: Array<FileItem> = [
  { name: HOME, path: '', is_dir: true, loading: false },
]

interface GridFileViewProps {
  sftpConnId: string,
  fileList: Array<FileItem>
  currentPath: CurrentPath,
  fileUploading: boolean, // todo:
  onPathChanged: (item: FileItem[], path: string) => void
}

const GridFileView = ({ sftpConnId, fileList, currentPath, fileUploading, onPathChanged }: GridFileViewProps) => {
  const { t } = useTranslation(['console'])

  const onPath = (path: string, dir_only: boolean) => {
    // when the path is changed // todo add cache
    if (path && path === currentPath.current_path) {
      return // if it is the same path.
    }
    if (fileUploading) { // todo: fileUploading
      // if it is uploading.
      toaster.danger(t("console:file_transfer.wait_for_unload_finish"));
      return;
    }
    const item: FileItem = { name: '', is_dir: true, path: path, loading: false }
    lsCmd(sftpConnId, false, item, (path: string) => {
      toaster.danger(t("console:file_transfer.error_while_ls", { dir: path }))
    }, (children: FileItem[], error: boolean) => {
      if (!error) {
        onPathChanged(children, path);
      }
    })
  }

  const onGridFileDoubleClicked = (fileItem: FileItem) => {
    if (fileItem.is_dir) {
      // todo: set loading
      onPath(fileItem.path, false)
    }
  }

  const onGridItemClicked = (fileItem: FileItem) => {
    if (!fileItem.is_dir) {
      const path = fileItem.path;
      const _t = sessionStorage.getItem(Config.jwt.tokenName);
      if (_t) {
        window.open(
          Utils.loadUrl(
            apiRouters.router.sftp_dl,
            stringFormat.format(apiRouters.params.sftp_dl, _t, sftpConnId, path)
          ),
          "_self",
          'false'
        );
      }
    }
  }

  return (
    <Card
      backgroundColor="white"
      elevation={0}
      minHeight="100%"
      display="flex"
      padding="8px"
    >
      <div className="overview-group-items">
        {fileList.map((f: FileItem) => {
          // if (f.is_dir)
          if (f.is_dir) {
            return (
              <a className="overview-item">
                <FolderCloseIcon
                  size={32}
                  className="item-icon"
                  onDoubleClick={() => {
                    onGridFileDoubleClicked(f)
                  }}
                />
                <Strong size={300} title={f.name} className="item-title"> {f.name} </Strong>
              </a>)
          } else {
            return (<a className="overview-item" onClick={() => { onGridItemClicked(f) }}>
              <DocumentIcon size={32} className="item-icon" />
              <Strong size={300} title={f.name} className="item-title"> {f.name} </Strong>
            </a>)
          }
        }
        )}
        <a className="overview-item">
          <UploadIcon size={32} className="item-icon" />
          <Strong size={300} className="item-title">Upload</Strong>
        </a>
      </div>
    </Card>
  )
}


// dir_only means only to show directory
const lsCmd = (sftpConnId: string, dir_only: boolean, item: FileItem, ls_error: (path: string) => void,
  callback: (items: FileItem[], error: boolean) => void) => {
  // item.is_dir === true.
  const path = item.path
  const _t = sessionStorage.getItem(Config.jwt.tokenName);
  if (_t) {
    Utils.axiosInstance
      .get(
        Utils.loadUrl(
          apiRouters.router.sftp_ls,
          stringFormat.format(
            apiRouters.params.sftp_ls,
            _t,
            sftpConnId,
            dir_only + '',
            path
          )
        ),
        {}
      )
      .then(response => {
        try {
          if (!response.data || response.data.has_error) {
            ls_error(path)
            // todo dir not shown
            const d: Array<FileItem> = [];
            callback(d, true);
          } else {
            const messages = response.data.message;
            const children: Array<FileItem> = [];
            messages.forEach((ele: any) => {
              if (dir_only && !ele.is_dir) {
                return
              }
              children.push({
                name: ele.name,
                is_dir: ele.is_dir,
                path: ele.path,
                loading: false,
                children: []
              });
            });
            callback(children, false); // only callback here todo handle error for loading.
          }
        } catch (e) {
          ls_error(path)
          const d: Array<FileItem> = [];
          callback(d, true);
        }
      });
  }
}

// Here to open sftp connection and manager its status
const FileTrans = ({ isShown, node, sshStatus, hideSideSheeeet }: SideSftpProps) => {
  const [isSftpActive, setSftpActive] = useState<boolean>(false)
  const [sftpConnLoading, setSftpConnLoading] = useState<boolean>(false)
  const [sftpConnId, setSftpConnId] = useState<string>('')

  const [fileUploading, setFileUploading] = useState<boolean>(false)
  const [fileList, setFileList] = useState<Array<FileItem>>(DefaultFileList)
  const [currentPath, setCurentPath] = useState<CurrentPath>({ current_path: '', display_path: HOME })

  const { t } = useTranslation(['console'])
  // fixme: close websocket when isSftpActive changed to false

  const ls = (item: FileItem, callback: (items: FileItem[], error: boolean) => void) => {
    lsCmd(sftpConnId, true, item, (path: string) => {
        toaster.danger(t("console:file_transfer.error_while_ls", { dir: path }))
      },(children: FileItem[], error: boolean) => {
      // todo empty-text
      if (!error && children.length === 0) {
        // remove expand icon.
        children.push({ name: "[empty]", is_dir: false, path: "", loading: false });
      }
    })
  }

  const setGridByFilePath = (children: Array<FileItem>, path: string) => {
    setFileList(() => { return [...children] }) // todo add time, data?
    setCurentPath({ current_path: path, display_path: "$" + HOME + "/" + path })
  }

  const openSftpConnection = () => {
    const _t = sessionStorage.getItem(Config.jwt.tokenName);
    if (_t === null) {
      toaster.danger(t("console:web_socket_expire"))
      return
    }

    setSftpConnLoading(true)
    const socket = new WebSocket(
      Utils.loadWebSocketUrl(
        apiRouters.router.ws_sftp,
        stringFormat.format(apiRouters.params.ws_sftp, _t)
      )
    )
    // this.sftpSocket = socket; //todo
    setSftpConnLoading(false)
    setSftpActive(true)

    socket.onmessage = event => {
      // bind webSocket message event
      const message = JSON.parse(event.data)
      switch (message.type) {
        case apiRouters.CID:
          setSftpConnId(message.data)
          break;
      }
    }

    const heartBeatTimer = setInterval(() => {
      socket.send(JSON.stringify({ type: "heartbeat", data: "" }));
    }, 20 * 1000)

    // bind webSocket close event
    socket.onclose = () => {
      setSftpActive(false)
      clearInterval(heartBeatTimer); // cancel heartbeat package sending.
    }
  }

  return (
    <>
      <SideSheet
        isShown={isShown}
        shouldCloseOnEscapePress
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
              {node.username}@{node.host}
            </Paragraph>
          </Pane>
        </Pane>
        <Pane flex="1" overflowY="scroll" background="tint1" padding={16}>
          { sshStatus !== ConnStatus.ConnectionAlive &&
          <Alert
            intent="warning"
            title={t('console:file_transfer.ssh_not_active')}
            marginBottom={32}
          />}
          { sshStatus === ConnStatus.ConnectionAlive && !isSftpActive &&
            <Pane
              backgroundColor="transparent"
              elevation={0}
              border='none'
              boxShadow='none'
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Button isLoading={sftpConnLoading} intent="success" onClick={openSftpConnection}>
                {t('console:file_transfer.connect_to_sftp_server')}
              </Button>
            </Pane>
          }
          { sshStatus === ConnStatus.ConnectionAlive && isSftpActive &&
            <GridFileView
              key="grid_view"
              fileList={fileList}
              sftpConnId={sftpConnId}
              currentPath={currentPath}
              fileUploading={fileUploading}
              onPathChanged={setGridByFilePath}
            />
          }
        </Pane>
      </SideSheet>
    </>
  )
}

export default FileTrans