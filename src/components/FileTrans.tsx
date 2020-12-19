import React, { useEffect, useState } from "react"
import { Alert, Button, IconButton, Card, Heading, Menu, Pane, Paragraph, Popover, Position, SideSheet, Strong, Tab, Tablist, toaster } from "evergreen-ui"
import { FolderCloseIcon, DocumentIcon, CogIcon, EyeOnIcon, EyeOffIcon } from "evergreen-ui"
import { useTranslation } from "react-i18next"

import Config from '../config/config'
import Utils from "../libs/utils"
import apiRouters from '../config/api_routers'
import stringFormat from "../libs/string_format"
import PathNav, { SPLIT_CHAR } from "./PathNav"
import SftpUpload, { UploadEvent, UploadStatus } from "./SftpUpload"
import './file_trans.less'

const HOME = "HOME"

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
  onPathChanged: (item: FileItem[], path: string, is_abs_path: boolean) => void
  uploadEvent: UploadEvent
  uploadStatus: UploadStatus
}

const GridFileView = ({ sftpConnId, fileList, currentPath, fileUploading, onPathChanged, uploadEvent, uploadStatus }: GridFileViewProps) => {
  const { t } = useTranslation(['console', 'files'])
  const strSettings = window.localStorage.getItem("show-hidden-files")
  const [showHiddenFile, setShowHiddenFiles] = useState<boolean>(strSettings === 'on'? true: false)

  const toggleShowHiddenFile = () => {
    window.localStorage.setItem("show-hidden-files", !showHiddenFile? 'on' : 'off')
    setShowHiddenFiles(!showHiddenFile)
  }

  const onPath = (path: string) => {
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
        onPathChanged(children, path, path.startsWith(SPLIT_CHAR));
      }
    })
  }

  const onGridFileDoubleClicked = (fileItem: FileItem) => {
    if (fileItem.is_dir) {
      // todo: set loading
      onPath(fileItem.path)
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
      flexDirection="column"
      padding="8px"
    >
      <Pane marginBottom="0.4rem" className="path-nav" display="flex" flexDirection="row">
        <div style={{flex: 1}}>
          <PathNav path={ currentPath.current_path } onPathClick={onPath} />
        </div>
        <Popover
          position={Position.BOTTOM_LEFT}
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item icon={showHiddenFile? EyeOffIcon: EyeOnIcon} onSelect={toggleShowHiddenFile}>
                  {/* secondaryText={<>⌘R</>} */}
                  { showHiddenFile? t('files:hide_hidden_files_menu'): t('files:show_hidden_files_menu') }
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
        >
          <IconButton appearance="minimal" icon={CogIcon} iconSize={18} />
        </Popover>
      </Pane>
      <div className="overview-group-items">
        {fileList.sort((a, b) => {
          if (a.is_dir && !b.is_dir) {
            return -1
          }
          if (!a.is_dir && b.is_dir) {
            return 1
          }
          return a.name == b.name ? 0 : a.name > b.name ? 1 : -1
        }).map((f: FileItem) => {
          if(!showHiddenFile && f.name.startsWith('.')) {
            return null
          }
          // if (f.is_dir)
          if (f.is_dir) {
            return (
              <a className="overview-item" onDoubleClick={() => { onGridFileDoubleClicked(f) }}>
                <FolderCloseIcon size={32} className="item-icon" />
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
        <SftpUpload eventHandle={uploadEvent} uploadStatus={uploadStatus} cid={sftpConnId} current_path={currentPath.current_path} />
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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ isUploading: false, hasError: false, percent: 0 })

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

  const setGridByFilePath = (children: Array<FileItem>, path: string, is_abs_path: boolean) => {
    setFileList(() => { return [...children] }) // todo add time, data?
    if (is_abs_path) {
      setCurentPath({ current_path: path, display_path: path })
    } else {
      setCurentPath({ current_path: path, display_path: "$" + HOME + "/" + path })
    }
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

  const handleFileUploading = {
    onUploadSuccess: (filename: string) => {
      const item = {path: currentPath+SPLIT_CHAR + filename, name: filename, is_dir: false,loading: false,children: [] }
      setUploadStatus({isUploading: false, hasError: false, percent: 0})
      setFileList(() => { return [...fileList, item] })
      toaster.success("Upload success!")
    },
    onUploadStart: () => {
      setUploadStatus({isUploading: true, hasError: false,  percent: 0})
    },
    onUploadProgress: (percent: number) => {
      setUploadStatus({isUploading: true, hasError: false, percent: percent})
      console.log(percent)
    },
    onUploadError: (e: Error) => {
      setUploadStatus({isUploading: false, hasError: true, percent: 0})
      toaster.danger("File upload error")
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
              uploadEvent={handleFileUploading}
              uploadStatus={uploadStatus}
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