export type CurrentPath = {
  current_path: string
  display_path: string
}

export type FileItem = {
  path: string
  name: string
  is_dir: boolean
  loading: boolean
  children?: Array<FileItem>
}
