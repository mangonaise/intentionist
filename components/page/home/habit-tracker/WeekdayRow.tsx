import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useMemo } from 'react'
import { getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import { CurrentDateContext } from '@/components/app/withApp'
import HomeViewHandler from '@/logic/app/HomeViewHandler'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import Flex from '@/components/primitives/Flex'
import Text from '@/components/primitives/Text'

const shellArray = Array.from({ length: 7 })
const weekdayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekdayRow = observer(() => {
  const { weekdayId } = useContext(CurrentDateContext)
  const { selectedWeekStartDate } = container.resolve(HomeViewHandler)

  const isViewingThisWeek = useMemo(() => {
    const { year: thisYear, dayOfYear: today } = getYearAndDay(getFirstDayOfThisWeek())
    return selectedWeekStartDate.year === thisYear && selectedWeekStartDate.dayOfYear === today
  }, [weekdayId, selectedWeekStartDate])

  return (
    <Flex sx={{ mx: ['-0.5rem', 'auto'], justifyContent: 'space-around', userSelect: 'none' }}>
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
})

export default WeekdayRow