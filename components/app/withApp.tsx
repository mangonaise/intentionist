import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'
import DbHandler from '@/logic/app/DbHandler'
import ProfileHandler from '@/logic/app/ProfileHandler'
import useAutorun from '@/hooks/useAutorun'
import useWarnUnsavedChanges from '@/hooks/useWarnUnsavedChanges'
import FadeIn from '@/components/primitives/FadeIn'
import Spacer from '@/components/primitives/Spacer'
import withAuthUser from './withAuthUser'
import LoadingScreen from './LoadingScreen'
import Navbar from './Navbar'
import GradientBackground from './GradientBackground'
import theme from 'styles/theme'

const withApp = (WrappedComponent: () => JSX.Element) => withAuthUser(observer(() => {
  const router = useRouter()
  const { isWriteComplete } = container.resolve(DbHandler)
  const { hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [profileExists, setProfileExists] = useState(hasCompletedInitialFetches && !!container.resolve(ProfileHandler).profileInfo)
  const [fade] = useState(!hasCompletedInitialFetches)

  useWarnUnsavedChanges({
    unload: !isWriteComplete,
    routeChange: false
  }, 'Changes you made have not been synced yet. Are you sure you want to leave?')

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