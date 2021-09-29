import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { authState } from '@/lib/logic/utils/authUtilities'
import { LoadingScreen } from '..'

const withAuthUser = (WrappedComponent: () => JSX.Element | null) => observer(() => {
  useEffect(() => {
    if (!authState.getCachedState()) {
      window.location.assign('/')
    }
  }, [authState.current])

  if (!authState.current) return <LoadingScreen />
  return (
    <WrappedComponent />
  )
})

export default withAuthUser