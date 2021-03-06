import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Strong,
  Tooltip,
  UploadIcon,
  InfoSignIcon,
  toaster,
  DoubleChevronUpIcon,
} from 'evergreen-ui'
import { useTranslation } from 'react-i18next'
import axios from 'axios'

import Config from '../config/config'
import Utils from '../libs/utils'
import apiRouters from '../config/api_routers'
import stringFormat from '../libs/string_format'
import './sftp_upload.less'
import './file_trans.less'

const activeStyle = {
  style: {
    boxShadow: '0 0 0 2px #016cd1',
  },
}

export type UploadEvent = {
  onUploadSuccess: (filename: string) => void
  onUploadStart: () => void
  onUploadProgress: (percent: number) => void
  onUploadError: (e: Error) => void
}

export type UploadStatus = {
  isUploading: boolean
  percent: number
  hasError: boolean
}

interface UploadProps {
  cid: string
  current_path: string
  uploadStatus: UploadStatus
  eventHandle: UploadEvent
}

const SftpUpload = ({
  cid,
  current_path,
  eventHandle,
  uploadStatus,
}: UploadProps) => {
  const { t } = useTranslation(['files'])

  const onDrop = (acceptedFiles: File[]) => {
    const _t = sessionStorage.getItem(Config.jwt.tokenName)
    if (!cid || cid === '') {
      toaster.danger(t('files:error_upload_fail_no_conneton'))
      return
    }
    let targetUrl = ''
    if (_t) {
      targetUrl = Utils.loadUrl(
        apiRouters.router.sftp_upload,
        stringFormat.format(
          apiRouters.params.sftp_upload,
          _t,
          cid,
          current_path,
        ),
      )
    } else {
      toaster.danger(t('files:error_upload_fail_target_url'))
      return
    }

    acceptedFiles.forEach((file) => {
      const formData = new FormData()
      formData.append('file', file, file.name)

      const config = {
        // eslint-disable-next-line
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            )
            eventHandle.onUploadProgress(percentCompleted)
          }
        },
      }
      eventHandle.onUploadStart()
      axios
        .post(targetUrl, formData, config)
        .then(() => {
          eventHandle.onUploadSuccess(file.name)
        })
        .catch((err) => {
          eventHandle.onUploadError(err)
        })
    })
  }

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
  })
  const style = useMemo(
    () => ({
      ...(isDragActive ? activeStyle : {}),
      ...(isFocused ? activeStyle : {}),
    }),
    [isDragActive],
  )

  if (uploadStatus.isUploading) {
    // uploading status
    return (
      <a
        className="overview-item overview-item-flex upload-diabled"
        title={t('files:uploading') + ':' + uploadStatus.percent + '%'}>
        <DoubleChevronUpIcon size={32} className="item-icon" />
        {uploadStatus.percent < 100 && (
          <Strong size={300} className="item-title">
            {t('files:uploading')} {':'} {uploadStatus.percent}
            {'%'}
          </Strong>
        )}
        {uploadStatus.percent >= 100 && (
          <Strong size={300} className="item-title">
            {t('files:upload_completed')}
          </Strong>
        )}
      </a>
    )
  }

  return (
    <a className="overview-item overview-item-flex" {...getRootProps(style)}>
      <input {...getInputProps()} />
      <UploadIcon size={32} className="item-icon" />
      <Tooltip content={t('files:upload_tooltip')}>
        <Strong size={300} className="item-title">
          {t('files:upload_btn')}
          <InfoSignIcon size={14} marginLeft="6px" verticalAlign="middle" />
        </Strong>
      </Tooltip>
    </a>
  )
}

export default SftpUpload
