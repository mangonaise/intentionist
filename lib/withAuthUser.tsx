import { User } from '@firebase/auth'
import { observer } from 'mobx-react-lite'
import { createContext, useEffect } from 'react'
import authHandler from './auth'

export const AuthUserContext = createContext<User>(null!)

const withAuthUser = (WrappedComponent: () => JSX.Element) => observer(() => {
  useEffect(() => {
    if (!authHandler.cachedAuthState) {
      window.location.assign('/')
    }
  }, [authHandler.user])

  if (!authHandler.user) return null
  return (
    <AuthUserContext.Provider value={authHandler.user}>
      <WrappedComponent />
    </AuthUserContext.Provider>
  )
})

export default withAuthUser