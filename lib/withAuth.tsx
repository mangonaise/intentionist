import { User } from '@firebase/auth'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import authHandler from './auth'

type WrappedComponentUsingAuth = (props: { user: User }) => JSX.Element

const withAuth = (WrappedComponent: WrappedComponentUsingAuth) => observer(() => {
  const router = useRouter()

  useEffect(() => {
    if (!authHandler.cachedAuthState) {
      router.push('/')
    }
  }, [authHandler.user])

  if (!authHandler.user) return null
  return <WrappedComponent user={authHandler.user} />
})

export default withAuth