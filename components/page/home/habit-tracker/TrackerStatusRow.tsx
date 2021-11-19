import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import Flex from '@/components/primitives/Flex'
import TrackerStatus from '@/components/page/home/habit-tracker/TrackerStatus'

const shellArray = Array.from({ length: 7 })

const TrackerStatusRow = () => {
  const { isLargeScreen } = useContext(HabitContext)

  return (
    <Flex
      justify="space-around"
      align="center"
      sx={{
        position: 'relative', mx: '-0.5rem',
        width: isLargeScreen ? '110%' : 'auto', right: isLargeScreen ? '5%' : 0
      }}
    >
      {shellArray.map((_, index) => (
        <TrackerStatus weekdayIndex={index} key={index} />
      ))}
    </Flex>
  )
}

export default TrackerStatusRow