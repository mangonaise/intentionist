import { autorun } from 'mobx'
import { useEffect } from 'react'

function useAutorun(callback: () => void) {
  return (
    useEffect(() => autorun(callback))
  )
}

export default useAutorun