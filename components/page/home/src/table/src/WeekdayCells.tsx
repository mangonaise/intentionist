import { CenteredFlex } from '@/components/primitives'
import useMediaQuery from '@/lib/hooks/useMediaQuery'

const weekdaysLong = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekdayCells = () => {
  const weekdayNames = useMediaQuery<string[]>('(max-width: 600px)', weekdaysShort, weekdaysLong)

  return (
    <>
      {weekdayNames.map((day, index) => (
        <CenteredFlex
          height="row"
          borderBottom="solid 1px"
          borderColor="grid"
          key={index}
        >
          {day}
        </CenteredFlex>
      ))}
    </>
  )
}

export default WeekdayCells