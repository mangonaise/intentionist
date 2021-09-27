import type { NextPage } from 'next'
import { observer } from 'mobx-react-lite'
import { useRouter } from 'next/dist/client/router'
import { useEffect, useState } from 'react'
import { LoadingScreen } from '@/components/app'
import { CenteredFlex, FadeIn, Icon, IconButton } from '@/components/primitives'
import { IntentionistIcon, GoogleIcon } from '@/components/icons'
import { authState, signInWithGoogle } from '@/lib/logic/utils/authUtilities'
import Head from 'next/head'

const LandingPage: NextPage = () => {
  const [hide, setHide] = useState(false)
  const router = useRouter()

  useEffect(() => {
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