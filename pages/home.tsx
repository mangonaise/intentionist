import withApp from '@/components/app/withApp'
import Box from '@/components/primitives/Box'
import Spacer from '@/components/primitives/Spacer'
import Head from 'next/head'

const Home = () => {
  return (
    <Box sx={{ maxWidth: 'max', margin: 'auto' }}>
      <Head><title>Home</title></Head>
      <Spacer />
      <div>Here we go again</div>
    </Box>
  )
}

export default withApp(Home)