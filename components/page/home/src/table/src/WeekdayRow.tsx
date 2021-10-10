import { Flex } from '@/components/primitives'
import useMediaQuery from '@/lib/hooks/useMediaQuery'

const weekdaysLong = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekdayRow = () => {
  const weekdayNames = useMediaQuery<string[]>('(max-width: 600px)', weekdaysShort, weekdaysLong)

  return (
    <>
      {weekdayNames.map((day, index) => (
        <Flex
          center
          sx={{ height: 'row' }}
          key={index}
        >
          {day}
        </Flex>
      ))}
    </>
  )
}

export default WeekdayRow