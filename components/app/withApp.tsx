import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import accentColor, { AccentColor } from '@/lib/logic/utils/accentColor'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import useAutorun from '@/lib/hooks/useAutorun'
import withAuthUser from './withAuthUser'
import LoadingScreen from './LoadingScreen'
import Navbar from './Navbar'
import GradientBackground from './GradientBackground'
import FadeIn from '@/components/primitives/FadeIn'

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
      }
    }
  })

  if (!hasCompletedInitialFetches || !profileExists) return <LoadingScreen />
  return (
    <>
      <FadeIn time={fade ? 500 : 0} delay={100}>
        <GradientBackground />
        <Navbar />
      </FadeIn>
      <FadeIn time={300} delay={25}>
        <WrappedComponent />
      </FadeIn>
    </>
  )
}))

export default withApp