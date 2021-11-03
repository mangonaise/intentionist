import type { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { autorun } from 'mobx'
import { useRouter } from 'next/dist/client/router'
import { useLayoutEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { authState, signInWithGoogle } from '@/lib/logic/utils/authUtilities'
import LoadingScreen from '@/components/app/LoadingScreen'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import IconButton from '@/components/primitives/IconButton'
import IntentionistIcon from '@/components/icons/IntentionistIcon'
import GoogleIcon from '@/components/icons/GoogleIcon'
import Head from 'next/head'

const LandingPage: NextPage = () => {
  const [hide, setHide] = useState(false)
  const router = useRouter()

  useLayoutEffect(() => autorun(() => {
    if (authState.getCachedState() || authState.current === true) {
      setHide(true)
      if (auth.currentUser?.metadata.creationTime === auth.currentUser?.metadata.lastSignInTime) {
        router.push('/welcome')
      } else {
        router.push('/home')
      }
    }
  }))

  if (hide) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Intentionist | Social habit tracker and journal</title></Head>
      <Flex column center sx={{ height: '90vh' }}>
        <Icon icon={IntentionistIcon} sx={{ fontSize: '3rem', mb: 8 }} />
        <IconButton icon={GoogleIcon} onClick={signInWithGoogle}>
          Continue with Google
        </IconButton>
      </Flex >
    </FadeIn>
  )
}

export default observer(LandingPage)