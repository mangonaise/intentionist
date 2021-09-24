import withApp from '@/components/app/withApp'
import Head from 'next/head'
import FadeIn from '@/components/primitives/FadeIn'
import WeekViewPicker from '@/components/page/home/WeekViewPicker'

const Home = withApp(() => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <Head><title>Home</title></Head>
      <WeekViewPicker />
    </FadeIn>
  )
})

export default Home