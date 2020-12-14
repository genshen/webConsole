import React from "react"
import { Button, HomeIcon, SlashIcon } from "evergreen-ui"

export const SPLIT_CHAR = '/'

interface PathNavProps {
  path: string
  onPathClick: (path: string) => void
}

const PathNav = ({ path, onPathClick }: PathNavProps) => {
  const is_abs_path = path.startsWith(SPLIT_CHAR)
  const dirs = path.replace(/^\/+|\/+$/g, '').split(SPLIT_CHAR)
  const onItemClicked = (i: number) => {
    if (i >= dirs.length) {
      return
    }
    if (i == -1) {
      if (is_abs_path) {
        onPathClick(SPLIT_CHAR) // root dir
      } else {
        onPathClick('')
      }
      return
    }
    const dirs_dp = dirs.slice()
    dirs_dp.splice(i + 1) // remove left ones
    let selected_path = dirs_dp.join(SPLIT_CHAR)
    if (is_abs_path) {
      selected_path = SPLIT_CHAR + selected_path
    }
    onPathClick(selected_path)
  }
  return (
    <>
      { is_abs_path && (
        <Button onClick={() => onItemClicked(-1)} height={24} paddingLeft="4px" paddingRight="4px" appearance="minimal" intent="none">
          <SlashIcon />
        </Button>
      )}
      { !is_abs_path && (
        <>
          <Button onClick={() => onItemClicked(-1)} height={24} paddingLeft="4px" paddingRight="4px" appearance="minimal" intent="none">
            <HomeIcon />
          </Button>
        </>
      )}
      { dirs.map((dir, i) => {
        return (
          <>
            <span style={{ fontSize: "12px" }}>{SPLIT_CHAR}</span>
            <Button onClick={() => onItemClicked(i)} height={24} paddingLeft="4px" paddingRight="4px" appearance="minimal" intent="none">
              {dir}
            </Button>
          </>)
      })
      }
    </>
  )
}

export default PathNav
