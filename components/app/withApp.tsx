import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useState } from 'react'
import useAutorun from '@/hooks/useAutorun'
import InitialFetchHandler from '@/logic/app/InitialFetchHandler'
import DbHandler from '@/logic/app/DbHandler'
import ProfileHandler from '@/logic/app/ProfileHandler'
import useWarnUnsavedChanges from '@/hooks/useWarnUnsavedChanges'
import FadeIn from '@/components/primitives/FadeIn'
import Spacer from '@/components/primitives/Spacer'
import withAuthUser from './withAuthUser'
import LoadingScreen from './LoadingScreen'
import Navbar from './Navbar'
import GradientBackground from './GradientBackground'
import theme from 'styles/theme'

const getProfileHandler = () => container.resolve(ProfileHandler)
let disableFading = false

const withApp = (WrappedComponent: () => JSX.Element) => withAuthUser(observer(() => {
  const router = useRouter()
  const { isWriteComplete } = container.resolve(DbHandler)
  const { hasCompletedInitialFetches } = container.resolve(InitialFetchHandler)
  const [profileExists, setProfileExists] = useState(hasCompletedInitialFetches && !!getProfileHandler().profileInfo)
  const [fade] = useState(!disableFading)

  useWarnUnsavedChanges({
    unload: !isWriteComplete,
    routeChange: false
  }, 'Changes you made have not been synced yet. Are you sure you want to leave?')

  useAutorun(() => {
    if (hasCompletedInitialFetches) {
      if (getProfileHandler().profileInfo === null) {
        router.push('/welcome')
      } else {
        disableFading = true
        setProfileExists(true)
      }
    }
  })

  if (!hasCompletedInitialFetches || !profileExists) return <LoadingScreen />
  return (
    <FadeIn time={fade ? 500 : 0} delay={100} sx={{ zIndex: 100 }}>
      <Navbar />
      <Spacer mb={theme.navbarHeights} />
      <GradientBackground />
      <FadeIn time={300}>
        <WrappedComponent />
      </FadeIn>
    </FadeIn>
  )
}))

export default withApp