import HabitTracker from '@/components/page/home/HabitTracker'
import withApp from '@/components/modular/withApp'
import Box from '@/components/primitives/Box'
import Head from 'next/head'

const Home = () => {
  return (
    <Box>
      <Head><title>Home</title></Head>
      <HabitTracker />
    </Box>
  )
}

export default withApp(Home)