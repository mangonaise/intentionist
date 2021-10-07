import type { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { useLayoutEffect, useState } from 'react'
import { authState, signInWithGoogle } from '@/lib/logic/utils/authUtilities'
import LoadingScreen from '@/components/app/src/LoadingScreen'
import CenteredFlex from '@/components/primitives/src/CenteredFlex'
import FadeIn from '@/components/primitives/src/FadeIn'
import Icon from '@/components/primitives/src/Icon'
import IconButton from '@/components/primitives/src/IconButton'
import IntentionistIcon from '@/components/icons/src/IntentionistIcon'
import GoogleIcon from '@/components/icons/src/GoogleIcon'
import Head from 'next/head'

const LandingPage: NextPage = () => {
  const [hide, setHide] = useState(false)
  const router = useRouter()

  useLayoutEffect(() => {
    if (authState.getCachedState()) {
      setHide(true)
      router.push('/home')
    }
  }, [authState.current])

  if (hide) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Intentionist | Social habit tracker and journal</title></Head>
      <CenteredFlex height="90vh" flexDirection="column">
        <Icon icon={IntentionistIcon} fontSize="4rem" mb={8} />
        <IconButton icon={GoogleIcon} onClick={signInWithGoogle}>
          Continue with Google
        </IconButton>
      </CenteredFlex >
    </FadeIn>
  )
}

export default observer(LandingPage)