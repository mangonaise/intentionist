import { observer } from 'mobx-react-lite'
import { authState } from '@/lib/logic/utils/authUtilities'
import useAutorun from '@/lib/hooks/useAutorun'
import LoadingScreen from './LoadingScreen'

const withAuthUser = (WrappedComponent: () => JSX.Element | null) => observer(() => {
  useAutorun(() => {
    if (!authState.getCachedState() && !authState.current) {
      window.location.assign('/')
    }
  })

  if (!authState.current) return <LoadingScreen />
  return (
    <WrappedComponent />
  )
})

export default withAuthUser