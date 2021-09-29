import { withApp } from '@/components/app'
import { WeekViewPicker } from '@/components/page/home'
import { FadeIn, Link, Spacer } from '@/components/primitives'
import Head from 'next/head'
import NextLink from 'next/link'

const Home = withApp(() => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <Head><title>Home</title></Head>
      <WeekViewPicker />
      <Spacer mb={6} />
      <NextLink href="/habits" passHref>
        <Link>
          Add or edit habits
        </Link>
      </NextLink>
    </FadeIn>
  )
})

export default Home