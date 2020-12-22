import React, { useState } from "react"
import { Alert, Button, IconButton, Card, Heading, Menu, Pane, Paragraph, Popover, Position, SideSheet, Strong, toaster, Pill, Badge } from "evergreen-ui"
import { FolderCloseIcon, DocumentIcon, CogIcon, EyeOnIcon, EyeOffIcon } from "evergreen-ui"
import { useTranslation } from "react-i18next"
import { saveAs } from "file-saver"
import axios from "axios"

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

type DownloadStatus = {
  isDownloading: boolean
  loaded: number
  total: number
  filename: string
  path: string
}

type DownloadEvent = {
  onDownloadStart: (path: string, filename: string) => void
  onDownloadProgress: (loaded: number, total: number, path: string, filename: string) => void
  onDownloadFinish: (path: string, filename: string) => void
}

interface DownloadingFileProps {
  status: DownloadStatus
  file: FileItem
}

const DownloadingFile = ({ status, file }: DownloadingFileProps) => {
  const { t } = useTranslation(['files'])
  let dataSize = '0';
  let dataUnit = 'B';
  if (status.loaded < 1024) {
    dataSize = status.loaded + ''
  } else if (status.loaded < 1024 * 1024) {
    dataUnit = "KB"
    dataSize = (status.loaded / 1024).toFixed(2)
  } else if (status.loaded < 1024 * 1024 * 1024) {
    dataUnit = "MB"
    dataSize = (status.loaded / 1024 / 1024).toFixed(2)
  } else {
    dataUnit = "GB"
    dataSize = (status.loaded / 1024 / 1024 / 1024).toFixed(2)
  }
  return (<a className="overview-item item-dl-container" title={file.name} >
    <a className="dl-file-cover">
      <Badge color="blue" marginBottom="0.2rem">{t('files:dl_text_preparing')}</Badge>
      <Pill color="blue" isSolid>{dataSize} {' '} {dataUnit}</Pill>
    </a>
    <a className="dl-file-item">
      <DocumentIcon size={32} className="item-icon" />
      <Strong size={300} className="item-title"> {file.name} </Strong>
    </a>
  </a>)
}

interface GridFileViewProps {
  sftpConnId: string,
  fileList: Array<FileItem>
  currentPath: CurrentPath,
  onPathChanged: (item: FileItem[], path: string, is_abs_path: boolean) => void
  uploadEvent: UploadEvent
  uploadStatus: UploadStatus
  dlStatus: DownloadStatus
  dlEvent: DownloadEvent
}

const GridFileView = ({ sftpConnId, fileList, currentPath, onPathChanged,
  uploadEvent, uploadStatus, dlEvent, dlStatus }: GridFileViewProps) => {
  const { t } = useTranslation(['console', 'files'])
  const strSettings = window.localStorage.getItem("show-hidden-files")
  const [showHiddenFile, setShowHiddenFiles] = useState<boolean>(strSettings === 'on' ? true : false)

  const toggleShowHiddenFile = () => {
    window.localStorage.setItem("show-hidden-files", !showHiddenFile ? 'on' : 'off')
    setShowHiddenFiles(!showHiddenFile)
  }

  const onPath = (path: string) => {
    // when the path is changed // todo add cache
    if (path && path === currentPath.current_path) {
      return // if it is the same path.
    }
    if (uploadStatus.isUploading) {
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

  // eslint-disable-next-line
  const getFileBlob = (url: string, onDlProgress: (progressEvent: any) => void) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      axios({
        method: 'get',
        url,
        responseType: 'arraybuffer',
        onDownloadProgress: onDlProgress,
      }).then(data => {
        resolve(data.data)
      }).catch(error => {
        reject(error.toString())
      })
    })
  }

  const onGridItemClicked = (fileItem: FileItem) => {
    if (!fileItem.is_dir) {
      const path = fileItem.path;
      const _t = sessionStorage.getItem(Config.jwt.tokenName);
      if (_t) {
        const dlUrl = Utils.loadUrl(
          apiRouters.router.sftp_dl,
          stringFormat.format(apiRouters.params.sftp_dl, _t, sftpConnId, path)
        )
        dlEvent.onDownloadStart(currentPath.current_path, fileItem.name)
        // eslint-disable-next-line
        getFileBlob(dlUrl, (progressEvent: any) => {
          // on download progress event
          if (progressEvent.lengthComputable) {
            dlEvent.onDownloadProgress(progressEvent.loaded, progressEvent.total, currentPath.current_path, fileItem.name)
          } else {
            dlEvent.onDownloadProgress(progressEvent.loaded, 0, currentPath.current_path, fileItem.name)
          }
        }).then((buffer: ArrayBuffer) => {
          dlEvent.onDownloadFinish(currentPath.current_path, fileItem.name)
          const blob = new Blob([buffer], { type: 'application/octet-stream' })
          saveAs(blob, fileItem.name)
        }).catch(() => {
          // download error
          toaster.danger(t("files:dl_file_failed"))
          dlEvent.onDownloadFinish(currentPath.current_path, fileItem.name)
        })
      }
    }
  }

  return (
    <Card
      backgroundColor="white"
      elevation={0}
      minHeight="calc(100% - 32px)"
      display="flex"
      flexDirection="column"
      padding="8px"
      margin={16}
    >
      <Pane marginBottom="0.4rem" className="path-nav" display="flex" flexDirection="row">
        <div style={{ flex: 1 }}>
          <PathNav path={currentPath.current_path} onPathClick={onPath} />
        </div>
        <Popover
          position={Position.BOTTOM_LEFT}
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item icon={showHiddenFile ? EyeOffIcon : EyeOnIcon} onSelect={toggleShowHiddenFile}>
                  {/* secondaryText={<>⌘R</>} */}
                  {showHiddenFile ? t('files:hide_hidden_files_menu') : t('files:show_hidden_files_menu')}
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
          if (!showHiddenFile && f.name.startsWith('.')) {
            return null
          }

          if (f.is_dir) {
            return (
              <a className="overview-item overview-item-flex" onDoubleClick={() => { onGridFileDoubleClicked(f) }}>
                <FolderCloseIcon size={32} className="item-icon" />
                <Strong size={300} title={f.name} className="item-title"> {f.name} </Strong>
              </a>)
          } else {
            // file
            if (dlStatus.isDownloading && dlStatus.filename === f.name && dlStatus.path === currentPath.current_path) {
              return <DownloadingFile status={dlStatus} file={f} />
            }
            return (<a className="overview-item overview-item-flex" onClick={() => { onGridItemClicked(f) }}>
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
            // eslint-disable-next-line
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

  const [fileList, setFileList] = useState<Array<FileItem>>(DefaultFileList)
  const [currentPath, setCurentPath] = useState<CurrentPath>({ current_path: '', display_path: HOME })
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ isUploading: false, hasError: false, percent: 0 })
  const [dlStatus, setDlStatus] = useState<DownloadStatus>({ isDownloading: false, loaded: 0, total: 0, path: '', filename: '' })

  const { t } = useTranslation(['console'])
  // fixme: close websocket when isSftpActive changed to false

  // eslint-disable-next-line
  const ls = (item: FileItem, callback: (items: FileItem[], error: boolean) => void) => {
    lsCmd(sftpConnId, true, item, (path: string) => {
        toaster.danger(t("console:file_transfer.error_while_ls", { dir: path }))
    }, (children: FileItem[], error: boolean) => {
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
      const item = { path: currentPath + SPLIT_CHAR + filename, name: filename, is_dir: false, loading: false, children: [] }
      setUploadStatus({ isUploading: false, hasError: false, percent: 0 })
      setFileList(() => { return [...fileList, item] })
      toaster.success("Upload success!")
    },
    onUploadStart: () => {
      setUploadStatus({ isUploading: true, hasError: false, percent: 0 })
    },
    onUploadProgress: (percent: number) => {
      setUploadStatus({ isUploading: true, hasError: false, percent: percent })
      console.log(percent)
    },
    onUploadError: () => {
      setUploadStatus({ isUploading: false, hasError: true, percent: 0 })
      toaster.danger("File upload error")
    }
  }

  const handleFileDownload = {
    onDownloadStart: (path: string, filename: string) => {
      setDlStatus({ isDownloading: true, loaded: 0, total: 0, path: path, filename: filename })
    },
    onDownloadProgress: (loaded: number, total: number, path: string, filename: string) => {
      setDlStatus({ isDownloading: true, loaded: loaded, total: total, path: path, filename: filename })
    },
    onDownloadFinish: () => {
      setDlStatus({ isDownloading: false, loaded: 0, total: 0, path: '', filename: '' })
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
        {(sshStatus !== ConnStatus.ConnectionAlive || !isSftpActive) &&
        <Pane flex="1" overflowY="scroll" background="tint1" padding={16}>
            {sshStatus !== ConnStatus.ConnectionAlive &&
            <Alert
              intent="warning"
              title={t('console:file_transfer.ssh_not_active')}
              marginBottom={32}
            />
          }
          {sshStatus === ConnStatus.ConnectionAlive && !isSftpActive &&
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
        </Pane>
        }
        {sshStatus === ConnStatus.ConnectionAlive && isSftpActive &&
          // use margin(in GridFileView), instead padding due to browser compatibility on firefox.
          <Pane flex="1" overflowY="scroll" background="tint1">
            <GridFileView
              key="grid_view"
              uploadEvent={handleFileUploading}
              uploadStatus={uploadStatus}
              dlEvent={handleFileDownload}
              dlStatus={dlStatus}
              fileList={fileList}
              sftpConnId={sftpConnId}
              currentPath={currentPath}
              onPathChanged={setGridByFilePath}
            />
          </Pane>
        }
      </SideSheet>
    </>
  )
}

export default FileTrans