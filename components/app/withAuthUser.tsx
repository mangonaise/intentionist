import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import AuthHandler from '@/logic/app/AuthHandler'
import useAutorun from '@/hooks/useAutorun'
import LoadingScreen from './LoadingScreen'

const withAuthUser = (WrappedComponent: () => JSX.Element | null) => observer(() => {
  const { isAuthenticated, getCachedAuthState} = container.resolve(AuthHandler)

  useAutorun(() => {
    if (!getCachedAuthState() && !isAuthenticated) {
      window.location.assign('/')
    }
  })

  if (!isAuthenticated) return <LoadingScreen />
  return (
    <WrappedComponent />
  )
})

export default withAuthUser