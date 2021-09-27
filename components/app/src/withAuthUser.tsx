import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { authState } from '@/lib/logic/utils/authUtilities'
import { LoadingScreen } from '..'

type WrappedComponent = () => JSX.Element | null

const withAuthUser = (WrappedComponent: WrappedComponent) => observer(() => {
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