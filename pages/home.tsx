import { withApp } from '@/components/app'
import { WeekViewPicker } from '@/components/page/home'
import { Box, Link, Spacer } from '@/components/primitives'
import Head from 'next/head'
import NextLink from 'next/link'

const Home = withApp(() => {
  return (
    <Box maxWidth="max" margin="auto">
      <Head><title>Home</title></Head>
      <WeekViewPicker />
      <Spacer mb={6} />
      <NextLink href="/habits" passHref>
        <Link>
          Add or edit habits
        </Link>
      </NextLink>
    </Box>
  )
})

export default Home