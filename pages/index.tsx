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
        sx={{ height: '75vh', marginX: ['1rem', '2rem', '4rem'] }}
      >
        <MainHeading />
        <Spacer mb="3rem" />
        <Slogan />
        <Spacer mb="2rem" />
        <Description />
        <Spacer mb="2rem" />
        <SignInButton />
      </Flex >
      <ScreenshotsSection />
      <GridEffect />
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
    <Text sx={{ fontSize: ['2.5rem', '3.5rem', '4rem'], fontWeight: 600 }}>
      <Text type="span" sx={{ color: 'textAccent' }}>
        Trying to build good habits?
      </Text>
      <br />
      <Text type="span">
        Don't do it alone.
      </Text>
    </Text>
  )
}

const Description = () => {
  return (
    <Text sx={{ fontWeight: 450, fontSize: 16, '& strong': { fontWeight: 650, color: 'textAccent' } }}>
      intentionist is a completely free<strong> habit tracking tool</strong>{' '}
      that lets you create <strong>linked habits with friends</strong>{' '}
      to help you stay <strong>encouraged</strong> and <strong>accountable</strong>.
    </Text>
  )
}

const ScreenshotsSection = () => {
  return (
    <Flex center column sx={{ bg: '#111', borderTop: 'solid 1px var(--color-accent)', pt: '1.5rem', pb: '3rem', px: 2, mx: '-0.25rem' }}>
      <ScreenshotWithHeader
        headerContent={<>Build <Text type="span" sx={{ color: 'textAccent' }}>streaks</Text> for any habit.</>}
        imageSrc="/images/screenshot-1-main.png"
        imageAlt="intentionist's habit-tracking interface"
        imageWidthPx={1014 * 0.5}
      />

      <ScreenshotWithHeader
        headerContent={<>Link habits <Text type="span" sx={{ color: 'textAccent' }}>with friends</Text>, in real time.</>}
        imageSrc="/images/screenshot-2-linked-habits.gif"
        imageAlt="an animation of two friends' habits linked together, updating in real time"
        imageWidthPx={580 * 0.66}
      />

      <ScreenshotWithHeader
        headerContent={<>Sync <Text type="span" sx={{ color: 'textAccent' }}>across devices</Text> for free.</>}
        imageSrc="/images/screenshot-3-mobile.png"
        imageAlt="the intentionist app on a mobile device"
        imageWidthPx={712 * 0.3}
      />

      <Heading level={3} sx={{ fontWeight: 400, fontSize: ['1.5rem', '2rem'], py: 15, textAlign: 'center' }}>
        Get started
      </Heading>
      <SignInButton />
    </Flex>
  )
}

const ScreenshotWithHeader = ({ headerContent, imageSrc, imageAlt, imageWidthPx }: {
  headerContent: React.ReactNode, imageSrc: string, imageAlt: string, imageWidthPx: number
}) => {
  return (
    <>
      <Heading level={3} sx={{ fontWeight: 400, fontSize: ['1.5rem', '2rem'], py: 15, textAlign: 'center' }}>
        {headerContent}
      </Heading>
      <img
        src={imageSrc}
        alt={imageAlt}
        sx={{ borderRadius: 8, width: imageWidthPx, maxWidth: '100%' }}
      />
      <Spacer mb={25} />
    </>
  )
}

const SignInButton = () => {
  const { signInWithGoogle } = container.resolve(AuthHandler)

  return (
    <Box sx={{ bg: 'bg' }}>
      <IconButton
        icon={GoogleIcon}
        onClick={signInWithGoogle}
        hoverEffect="none"
        sx={{ bg: 'buttonAccent' }}
      >
        Continue with Google
      </IconButton>
    </Box>
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