import { User } from '@firebase/auth'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import authHandler from './auth'

type WrappedComponent = ({ authUser }: { authUser: User }) => JSX.Element | null

const withAuthUser = (WrappedComponent: WrappedComponent) => observer(() => {
  useEffect(() => {
    if (!authHandler.cachedAuthState) {
      window.location.assign('/')
    }
  }, [authHandler.user])

  if (!authHandler.user) return null
  return (
    <WrappedComponent authUser={authHandler.user} />
  )
})

export default withAuthUser