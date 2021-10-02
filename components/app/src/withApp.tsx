import { observer } from 'mobx-react-lite'
import { container } from 'tsyringe'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import { LoadingScreen, Navbar, GradientBackground } from '..'
import { FadeIn } from '@/components/primitives'
import accentColor, { AccentColor } from '@/lib/logic/utils/accentColor'
import ProfileHandler from '@/lib/logic/app/ProfileHandler'
import HabitsHandler from '@/lib/logic/app/HabitsHandler'
import withAuthUser from './withAuthUser'

const withApp = (WrappedComponent: () => JSX.Element, accent?: AccentColor) => withAuthUser(observer(() => {
  const router = useRouter()
  const { profileInfo, fetchUserProfile } = container.resolve(ProfileHandler)
  const { fetchHabits, hasFetchedHabits } = container.resolve(HabitsHandler)
  const [fade] = useState(!profileInfo)

  useEffect(() => {
    // Repeated fetches will not call the database
    fetchUserProfile()
    fetchHabits()

    if (accent) {
      accentColor.set(accent)
    }
  }, [])

  useEffect(() => {
    if (profileInfo === null) {
      router.push('/welcome')
    }
  }, [profileInfo])

  if (!profileInfo || !hasFetchedHabits) return <LoadingScreen />
  return (
    <>
      <FadeIn time={fade ? undefined : 0}>
        <GradientBackground />
        <Navbar />
      </FadeIn>
      <FadeIn opacity={.99999}>
        <WrappedComponent />
      </FadeIn>
    </>
  )
}))

export default withApp