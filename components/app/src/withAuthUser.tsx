import { observer } from 'mobx-react-lite'
import { authState } from '@/lib/logic/utils/authUtilities'
import { LoadingScreen } from '..'
import useAutorun from '@/lib/hooks/useAutorun'

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