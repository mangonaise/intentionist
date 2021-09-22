import type { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import authHandler from '@/lib/auth'
import Head from 'next/head'
import Icon from '@/components/primitives/Icon'
import IconButton from '@/components/primitives/IconButton'
import IntentionistIcon from '@/components/icons/IntentionistIcon'
import GoogleIcon from '@/components/icons/GoogleIcon'
import CenteredFlex from '@/components/primitives/CenteredFlex'
import LoadingScreen from '@/components/LoadingScreen'
import FadeIn from '@/components/primitives/FadeIn'

const LandingPage: NextPage = () => {
  const [hide, setHide] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (authHandler.cachedAuthState) {
      setHide(true)
      router.push('/home')
    }
  }, [authHandler.user])

  if (hide) return <LoadingScreen />
  return (
    <FadeIn>
      <Head><title>Intentionist | Social habit tracker and journal</title></Head>
      <CenteredFlex height="90vh" flexDirection="column">
        <Icon icon={IntentionistIcon} fontSize="4rem" mb={8} />
        <IconButton icon={GoogleIcon} onClick={authHandler.signInWithGoogle}>
          Continue with Google
        </IconButton>
      </CenteredFlex >
    </FadeIn>
  )
}

export default observer(LandingPage)