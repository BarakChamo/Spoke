import { useCallback } from 'react'

export default function useSetPropertySelected(editor, propName, target = null) {
  return useCallback(value => editor.setPropertySelected(propName, value, true, true, target), [
    editor,
    propName,
    target
  ])
}
