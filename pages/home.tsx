import withApp from '@/components/app/withApp'
import Box from '@/components/primitives/Box'
import IconButton from '@/components/primitives/IconButton'
import ActiveIcon from '@/components/icons/ActiveIcon'
import Head from 'next/head'
import NextLink from 'next/link'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <NextLink href="/habits">
        <IconButton icon={ActiveIcon}>Habits</IconButton>
      </NextLink>
    </Box>
  )
}

export default withApp(Home)