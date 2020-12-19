import React, { useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { Strong, Tooltip, UploadIcon, InfoSignIcon, toaster } from "evergreen-ui"
import { useTranslation } from "react-i18next"

import Config from '../config/config'
import Utils from "../libs/utils"
import apiRouters from '../config/api_routers'
import stringFormat from "../libs/string_format"
import axios from "axios"

const activeStyle = {
  style: {
    boxShadow: '0 0 0 2px #016cd1'
  }
}

export type UploadEvent = {
  onUploadSuccess: () => void
  onUploadStart: () => void
  onUploadProgress: (percent: number) => void
  onUploadError: (e: Error) => void
}

interface UploadProps {
  cid: string
  current_path: string
  eventHandle: UploadEvent
}

const SftpUpload = ({ cid, current_path, eventHandle }: UploadProps) => {
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
          current_path
        )
      )
    } else {
      toaster.danger(t('files:error_upload_fail_target_url'))
      return
    }

    acceptedFiles.forEach((file) => {
      const formData = new FormData()
      formData.append('file', file, file.name)

      const config = {
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          eventHandle.onUploadProgress(percentCompleted)
        }
      }
      eventHandle.onUploadStart()
      axios.post(targetUrl, formData, config)
        .then((res) => {
          console.log(res)
          eventHandle.onUploadSuccess
        })
        .catch((err) => {
          eventHandle.onUploadError(err)
        })
    })
  }
  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({ onDrop })
  const style = useMemo(() => ({
    ...(isDragActive ? activeStyle : {}),
    ...(isFocused ? activeStyle : {}),
  }), [
    isDragActive
  ]);

  return (
    <a className="overview-item" {...getRootProps(style)}>
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
