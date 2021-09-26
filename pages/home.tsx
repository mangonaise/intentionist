import { withApp } from '@/components/app'
import { WeekViewPicker } from '@/components/page/home'
import { FadeIn } from '@/components/primitives'
import Head from 'next/head'

const Home = withApp(() => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <Head><title>Home</title></Head>
      <WeekViewPicker />
    </FadeIn>
  )
})

export default Home