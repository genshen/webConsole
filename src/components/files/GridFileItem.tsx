import React from 'react'
import { DocumentIcon, FolderCloseIcon, Strong, toaster } from 'evergreen-ui'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import axios from 'axios'

import Config from '../../config/config'
import Utils from '../../libs/utils'
import apiRouters from '../../config/api_routers'
import stringFormat from '../../libs/string_format'
import { CurrentPath, FileItem } from './files_types'
import DownloadingFile from './DownloadingFile'

export type DownloadStatus = {
  isDownloading: boolean
  loaded: number
  total: number
  filename: string
  path: string
}

export type DownloadEvent = {
  onDownloadStart: (path: string, filename: string) => void
  onDownloadProgress: (
    loaded: number,
    total: number,
    path: string,
    filename: string,
  ) => void
  onDownloadFinish: (path: string, filename: string) => void
}

interface GridFileItemProps {
  f: FileItem
  sftpConnId: string
  currentPath: CurrentPath
  onPathChange: (path: string) => void
  dlStatus: DownloadStatus
  dlEvent: DownloadEvent
}

// GridFileItem display a file item in grid view of files.
// the file item can be directory, or normal file, or symbolic link.
const GridFileItem = ({
  f,
  sftpConnId,
  currentPath,
  onPathChange,
  dlStatus,
  dlEvent,
}: GridFileItemProps) => {
  const { t } = useTranslation(['console', 'files'])

  const onGridFileDoubleClicked = (fileItem: FileItem) => {
    if (fileItem.is_dir) {
      // todo: set loading
      onPathChange(fileItem.path)
    }
  }

  const getFileBlob = (
    url: string,
    // eslint-disable-next-line
    onDlProgress: (progressEvent: any) => void,
  ) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      axios({
        method: 'get',
        url,
        responseType: 'arraybuffer',
        onDownloadProgress: onDlProgress,
      })
        .then((data) => {
          resolve(data.data)
        })
        .catch((error) => {
          reject(error.toString())
        })
    })
  }

  const onGridItemClicked = (fileItem: FileItem) => {
    if (!fileItem.is_dir) {
      const path = fileItem.path
      const _t = sessionStorage.getItem(Config.jwt.tokenName)
      if (_t) {
        const dlUrl = Utils.loadUrl(
          apiRouters.router.sftp_dl,
          stringFormat.format(apiRouters.params.sftp_dl, _t, sftpConnId, path),
        )
        dlEvent.onDownloadStart(currentPath.current_path, fileItem.name)
        // eslint-disable-next-line
        getFileBlob(dlUrl, (progressEvent: any) => {
          // on download progress event
          if (progressEvent.lengthComputable) {
            dlEvent.onDownloadProgress(
              progressEvent.loaded,
              progressEvent.total,
              currentPath.current_path,
              fileItem.name,
            )
          } else {
            dlEvent.onDownloadProgress(
              progressEvent.loaded,
              0,
              currentPath.current_path,
              fileItem.name,
            )
          }
        })
          .then((buffer: ArrayBuffer) => {
            dlEvent.onDownloadFinish(currentPath.current_path, fileItem.name)
            const blob = new Blob([buffer], {
              type: 'application/octet-stream',
            })
            saveAs(blob, fileItem.name)
          })
          .catch(() => {
            // download error
            toaster.danger(t('files:dl_file_failed'))
            dlEvent.onDownloadFinish(currentPath.current_path, fileItem.name)
          })
      }
    }
  }

  if (f.is_dir) {
    return (
      <a
        className="overview-item overview-item-flex"
        onDoubleClick={() => {
          onGridFileDoubleClicked(f)
        }}>
        <FolderCloseIcon size={32} className="item-icon" />
        <Strong size={300} title={f.name} className="item-title">
          {' '}
          {f.name}{' '}
        </Strong>
      </a>
    )
  } else {
    // file
    if (
      dlStatus.isDownloading &&
      dlStatus.filename === f.name &&
      dlStatus.path === currentPath.current_path
    ) {
      return <DownloadingFile status={dlStatus} file={f} />
    }
    return (
      <a
        className="overview-item overview-item-flex"
        onClick={() => {
          onGridItemClicked(f)
        }}>
        <DocumentIcon size={32} className="item-icon" />
        <Strong size={300} title={f.name} className="item-title">
          {' '}
          {f.name}{' '}
        </Strong>
      </a>
    )
  }
}

export default GridFileItem
