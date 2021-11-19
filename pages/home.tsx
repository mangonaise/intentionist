import HabitTracker from '@/components/page/home/HabitTracker'
import withApp from '@/components/app/withApp'
import Box from '@/components/primitives/Box'
import Head from 'next/head'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <HabitTracker />
    </Box>
  )
}

export default withApp(Home)