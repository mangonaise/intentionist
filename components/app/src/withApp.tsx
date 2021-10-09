import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import { LoadingScreen, Navbar, GradientBackground } from '..'
import { FadeIn } from '@/components/primitives'
import accentColor, { AccentColor } from '@/lib/logic/utils/accentColor'
import InitialFetchHandler from '@/lib/logic/app/InitialFetchHandler'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import useAutorun from '@/lib/hooks/useAutorun'
import withAuthUser from './withAuthUser'

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
      <FadeIn time={fade ? undefined : 0} delay={25}>
        <GradientBackground />
        <Navbar />
      </FadeIn>
      <FadeIn delay={25}>
        <WrappedComponent />
      </FadeIn>
    </>
  )
}))

export default withApp