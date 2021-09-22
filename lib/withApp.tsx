import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import profileHandler from './app/profileHandler'
import withAuthUser from './withAuthUser'

const withApp = (WrappedComponent: () => JSX.Element) => withAuthUser(observer(() => {
  const router = useRouter()
  const { profileInfo } = profileHandler()

  useEffect(() => {
    if (profileInfo === null) {
      router.push('/welcome')
    }
  }, [profileInfo])

  if (!profileInfo) return null
  return <WrappedComponent />
}))

export default withApp