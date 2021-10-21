import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { isSameDay } from 'date-fns'
import { Flex } from '@/components/primitives'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import WeekHandler, { WeekViewMode } from '@/lib/logic/app/WeekHandler'
import NewWeekPromptHandler from '@/lib/logic/app/NewWeekPromptHandler'
import useCurrentDay from '@/lib/hooks/useCurrentDay'

const weekdaysLong = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekdaysShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const WeekTableTitleRow = () => {
  const { viewMode } = container.resolve(WeekHandler)

  const map: { [viewMode in WeekViewMode]: JSX.Element } = {
    'tracker': <TrackerTitleRow />,
    'journal': <JournalTitleRow />,
    'focus': <FocusTitleRow />
  }

  return map[viewMode]
}

const TrackerTitleRow = () => {
  return <WeekdayLabels />
}

const JournalTitleRow = () => {
  return (
    <Flex center sx={{ height: 'row' }}>
      Entries
    </Flex>
  )
}

const FocusTitleRow = () => {
  return (
    <Flex sx={{ height: 'row' }}>
      <WeekdayLabels />
      <Flex
        center
        sx={{
          height: 'row',
          flex: 1,
          color: 'focus',
          fontWeight: 'medium',
          marginRight: '2.25rem'
        }}>
        Week total
      </Flex>
    </Flex>
  )
}

const WeekdayLabels = observer(() => {
  const { viewMode, weekInView, isLoadingWeek } = container.resolve(WeekHandler)
  const { thisWeekStartDate } = container.resolve(NewWeekPromptHandler)
  const { weekdayId } = useCurrentDay()
  const weekInViewStartDate = new Date(weekInView.startDate)
  const isViewingCurrentWeek = isSameDay(weekInViewStartDate, thisWeekStartDate)
  const weekdayNames = useMediaQuery<string[]>('(max-width: 600px)', weekdaysShort, weekdaysLong)

  return (
    <>
      {weekdayNames.map((day, index) => (
        <Flex
          center
          sx={{
            height: 'row',
            marginLeft: '1px',
            flex: 1,
            backgroundColor: (!isLoadingWeek && isViewingCurrentWeek && index === weekdayId) ? viewMode : 'transparent',
            borderTopLeftRadius: 'default',
            borderTopRightRadius: 'default'
          }}
          key={index}
        >
          {day}
        </Flex>
      ))}
    </>
  )
})

export default observer(WeekTableTitleRow)