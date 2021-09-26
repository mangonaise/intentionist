import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import { LoadingScreen, Navbar, GradientBackground } from '..'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import withAuthUser from './withAuthUser'

const withProfile = (WrappedComponent: () => JSX.Element) => withAuthUser(observer(() => {
  const router = useRouter()
  const { profileInfo, fetchUserProfile } = container.resolve(ProfileHandler)

  useEffect(() => {
    if (profileInfo === undefined) {
      fetchUserProfile()
    } else if (profileInfo === null) {
      router.push('/welcome')
    }
  }, [profileInfo])

  if (!profileInfo) return <LoadingScreen />
  return (
    <>
      <GradientBackground />
      <Navbar />
      <WrappedComponent />
    </>
  )
}))

export default withProfile