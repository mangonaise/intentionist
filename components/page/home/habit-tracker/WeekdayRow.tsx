import { useContext, useMemo } from 'react'
import { HabitTrackerContext } from '@/components/page/home/HabitTracker'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import useCurrentDay from '@/hooks/useCurrentDay'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'

const shellArray = Array.from({ length: 7 })
const weekdayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekdayRow = ({ expand }: { expand: boolean }) => {
  const { weekdayId } = useCurrentDay()
  const { weekStart } = useContext(HabitTrackerContext)

  const isViewingThisWeek = useMemo(() => {
    const { year: thisYear, dayOfYear: today } = getYearAndDay(getFirstDayOfThisWeek())
    return weekStart.year === thisYear && weekStart.dayOfYear === today
  }, [weekdayId, weekStart])

  return (
    <Flex
      sx={{
        position: 'relative', justifyContent: 'space-around', mx: '-0.5rem',
        width: expand ? '950px' : 'auto', right: expand ? '43px' : 0
      }}
    >
      {shellArray.map((_, index) => (
        <Text
          type="span"
          sx={{
            width: '1.5rem', textAlign: 'center',
            ...(isViewingThisWeek && weekdayId === index ? {
              color: 'text',
              fontWeight: 'semibold'
            } : {
              color: 'textAccent',
              opacity: 0.5
            })
          }}
          key={index}
        >
          {weekdayInitials[index]}
        </Text>
      ))}
    </Flex>
  )
}

export default WeekdayRow