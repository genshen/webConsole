import React from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, DocumentIcon, Pill, Strong } from 'evergreen-ui'

import { DownloadStatus } from './GridFileItem'
import { FileItem } from './files_types'

interface DownloadingFileProps {
  status: DownloadStatus
  file: FileItem
}

const DownloadingFile = ({ status, file }: DownloadingFileProps) => {
  const { t } = useTranslation(['files'])
  let dataSize = '0'
  let dataUnit = 'B'
  if (status.loaded < 1024) {
    dataSize = status.loaded + ''
  } else if (status.loaded < 1024 * 1024) {
    dataUnit = 'KB'
    dataSize = (status.loaded / 1024).toFixed(2)
  } else if (status.loaded < 1024 * 1024 * 1024) {
    dataUnit = 'MB'
    dataSize = (status.loaded / 1024 / 1024).toFixed(2)
  } else {
    dataUnit = 'GB'
    dataSize = (status.loaded / 1024 / 1024 / 1024).toFixed(2)
  }
  return (
    <a className="overview-item item-dl-container" title={file.name}>
      <a className="dl-file-cover">
        <Badge color="blue" marginBottom="0.2rem">
          {t('files:dl_text_preparing')}
        </Badge>
        <Pill color="blue" isSolid>
          {dataSize} {dataUnit}
        </Pill>
      </a>
      <a className="dl-file-item">
        <DocumentIcon size={32} className="item-icon" />
        <Strong size={300} className="item-title">
          {' '}
          {file.name}{' '}
        </Strong>
      </a>
    </a>
  )
}

export default DownloadingFile
