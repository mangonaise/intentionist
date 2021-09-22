import withApp from '@/lib/withApp'
import FadeIn from '@/components/primitives/FadeIn'
import WeekViewPicker from '@/components/page/home/WeekViewPicker'

const Home = withApp(() => {
  return (
    <FadeIn maxWidth="max" margin="auto">
      <WeekViewPicker />
    </FadeIn>
  )
})

export default Home