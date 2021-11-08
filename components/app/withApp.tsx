import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import accentColor, { AccentColor } from '@/logic/utils/accentColor'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'
import ProfileHandler from '@/logic/app/ProfileHandler'
import FriendsHandler from '@/logic/app/FriendsHandler'
import useAutorun from '@/hooks/useAutorun'
import FadeIn from '@/components/primitives/FadeIn'
import Spacer from '@/components/primitives/Spacer'
import withAuthUser from './withAuthUser'
import LoadingScreen from './LoadingScreen'
import Navbar from './Navbar'
import GradientBackground from './GradientBackground'
import theme from 'styles/theme'

const withApp = (WrappedComponent: () => JSX.Element, accent?: AccentColor) => withAuthUser(observer(() => {
  const router = useRouter()
  const { hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [profileExists, setProfileExists] = useState(hasCompletedInitialFetches && !!container.resolve(ProfileHandler).profileInfo)
  const [fade] = useState(!hasCompletedInitialFetches)

  useEffect(() => {
    if (accent) {
      accentColor.set(accent)
    }
  }, [])

  useAutorun(() => {
    if (hasCompletedInitialFetches) {
      if (container.resolve(ProfileHandler).profileInfo === null) {
        router.push('/welcome')
      } else {
        setProfileExists(true)
        container.resolve(FriendsHandler).listenToFriendsDoc()
      }
    }
  })

  if (!hasCompletedInitialFetches || !profileExists) return <LoadingScreen />
  return (
    <>
      <FadeIn time={fade ? 500 : 0} delay={100} sx={{ zIndex: 100 }}>
        <Navbar />
        <Spacer mb={theme.navbarHeights} />
        <GradientBackground />
        <FadeIn time={300}>
          <WrappedComponent />
        </FadeIn>
      </FadeIn>
    </>
  )
}))

export default withApp