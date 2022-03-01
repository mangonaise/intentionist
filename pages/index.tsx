import type { NextPage } from 'next'
import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { autorun } from 'mobx'
import { useRouter } from 'next/dist/client/router'
import { useLayoutEffect, useState } from 'react'
import AuthHandler from '@/logic/app/AuthHandler'
import LoadingScreen from '@/components/modular/LoadingScreen'
import FadeIn from '@/components/primitives/FadeIn'
import Flex from '@/components/primitives/Flex'
import Icon from '@/components/primitives/Icon'
import IconButton from '@/components/primitives/IconButton'
import Heading from '@/components/primitives/Heading'
import Text from '@/components/primitives/Text'
import Spacer from '@/components/primitives/Spacer'
import Box from '@/components/primitives/Box'
import IntentionistIcon from '@/components/icons/IntentionistIcon'
import GoogleIcon from '@/components/icons/GoogleIcon'
import Head from 'next/head'

const LandingPage: NextPage = () => {
  const { getCachedAuthState, isAuthenticated, auth } = container.resolve(AuthHandler)
  const [hide, setHide] = useState(false)
  const router = useRouter()

  useLayoutEffect(() => autorun(() => {
    if (getCachedAuthState() || isAuthenticated) {
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
      <Head><title>Intentionist | Social habit tracker</title></Head>
      <Flex
        column align="flex-start" justify="center"
        sx={{ height: '90vh', marginX: ['1rem', '2rem', '4rem'] }}
      >
        <GridEffect />
        <MainHeading />
        <Spacer mb="3rem" />
        <Slogan />
        <Spacer mb="2rem" />
        <Description />
        <Spacer mb="2rem" />
        <SignInButton />
      </Flex >
    </FadeIn>
  )
}

const MainHeading = () => {
  return (
    <Flex align="center" sx={{ ml: 3, fontSize: ['2rem', '2.5rem'] }}>
      <Icon
        icon={IntentionistIcon}
        sx={{ mr: 6, color: 'accent' }}
      />
      <Heading level={1} sx={{ fontSize: 'inherit' }}>
        intentionist
      </Heading>
    </Flex>
  )
}

const Slogan = () => {
  return (
    <Heading level={2} sx={{ fontSize: ['2.5rem', '3.5rem', '4rem'] }}>
      <Text type="span" sx={{ color: 'textAccent' }}>
        Trying to build good habits?
      </Text>
      <br />
      <Text type="span">
        Don't do it alone.
      </Text>
    </Heading>
  )
}

const Description = () => {
  return (
    <Text sx={{ fontWeight: 450, '& strong': { fontWeight: 'inherit', color: 'textAccent' } }}>
      intentionist is a <strong>free habit tracking tool</strong>{' '}
      that lets you create <strong>linked habits with friends</strong>{' '}
      to help you stay <strong>encouraged</strong> and <strong>accountable</strong>.
    </Text>
  )
}

const SignInButton = () => {
  const { signInWithGoogle } = container.resolve(AuthHandler)

  return (
    <IconButton
      icon={GoogleIcon}
      onClick={signInWithGoogle}
      sx={{
        position: 'relative',
        '&::before': {
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          content: '""',
          bg: 'bg',
          borderRadius: 'inherit'
        }
      }}
    >
      Continue with Google
    </IconButton>
  )
}

const GridEffect = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: 'radial-gradient(var(--color-text) 1px, var(--color-bg) 1px)',
        backgroundSize: ['25px 25px', '35px 35px', '50px 50px'],
        opacity: [0.16, 0.2]
      }}
    />
  )
}

export default observer(LandingPage)