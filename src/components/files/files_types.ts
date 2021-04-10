export type CurrentPath = {
  current_path: string
  display_path: string
}

export type FileItem = {
  path: string
  name: string
  mode: number
  loading: boolean
  children?: Array<FileItem>
}
export const FileModeEmpty = 0
export const FileModeIsDir = 1 << (32 - 1)
export const FileModeSymbolLink = 1 << (32 - 5)
export const FileModeNormalFile = 2

export const IsDir = (file: FileItem) => {
  return (file.mode & FileModeIsDir) !== 0
}

export const IsSymbolLink = (file: FileItem) => {
  return (file.mode & FileModeSymbolLink) !== 0
}
