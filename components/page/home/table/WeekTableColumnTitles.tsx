import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useLayoutEffect, useRef } from 'react'
import { isSameDay } from 'date-fns'
import { ColumnsDisplayContext } from '../WeekTable'
import { weekdayNames } from '@/logic/utils/_consts'
import WeekInView, { WeekViewMode, WeekdayId } from '@/logic/app/WeekInView'
import NewWeekPromptHandler from '@/logic/app/NewWeekPromptHandler'
import useMediaQuery from '@/hooks/useMediaQuery'
import useCurrentDay from '@/hooks/useCurrentDay'
import useElementWidth from '@/hooks/useElementWidth'
import getCurrentWeekdayId from '@/logic/utils/getCurrentWeekdayId'
import Dropdown from '@/components/app/Dropdown'
import Flex from '@/components/primitives/Flex'

const weekdaysShort = weekdayNames.map((day) => day.slice(0, 3))
const weekdayInitials = weekdayNames.map((day) => day.slice(0, 1))

const WeekTableColumnTitles = () => {
  const { viewMode } = container.resolve(WeekInView)

  const map: { [viewMode in WeekViewMode]: JSX.Element } = {
    'tracker': <TrackerTitleRow />,
    'notes': <NotesTitleRow />,
    'focus': <FocusTitleRow />
  }

  return map[viewMode]
}

const TrackerTitleRow = () => {
  return (
    <Flex>
      <WeekdayLabels />
    </Flex>
  )
}

const NotesTitleRow = observer(() => {
  const { getNotesCount, isLoadingWeek } = container.resolve(WeekInView)

  const notesCount = isLoadingWeek ? 0 : getNotesCount()

  return (
    <Flex center sx={{ height: 'row' }}>
      {isLoadingWeek ? '...' : `${notesCount} note${notesCount === 1 ? '' : 's'}`}
    </Flex>
  )
})

const FocusTitleRow = observer(() => {
  const { friendUid } = container.resolve(WeekInView)
  const { collapseColumns, setCollapseColumns } = useContext(ColumnsDisplayContext)
  const rowWrapperRef = useRef<HTMLDivElement>(null!)
  const width = useElementWidth(rowWrapperRef)

  useLayoutEffect(() => {
    setCollapseColumns(width < 680)
  }, [width])

  return (
    <Flex sx={{ height: 'row' }} ref={rowWrapperRef}>
      {collapseColumns
        ? <FocusWeekdayDropdown />
        : <WeekdayLabels />
      }
      <Flex
        center
        sx={{
          flex: 1,
          marginRight: friendUid ? 0 : '2.25rem',
          height: 'row',
          color: 'focus',
          fontWeight: 'semibold',
          textAlign: 'center',
          filter: 'brightness(1.2)'
        }}>
        Week total
      </Flex>
    </Flex>
  )
})

const FocusWeekdayDropdown = observer(() => {
  const { weekdayId, setWeekdayId } = useContext(ColumnsDisplayContext)
  const dayNames = useMediaQuery<string[]>('(max-width: 500px)', weekdaysShort, weekdayNames)

  useLayoutEffect(() => {
    setWeekdayId(getCurrentWeekdayId())
  }, [])

  return (
    <Dropdown
      noGap
      title={dayNames[weekdayId]}
      sx={{
        zIndex: 0,
        flex: 1,
        '& button': {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }
      }}
    >
      {Array.from({ length: 7 }).map((_, weekdayId) => (
        <Dropdown.Item
          itemAction={() => setWeekdayId(weekdayId as WeekdayId)}
          key={weekdayId}
        >
          {dayNames[weekdayId]}
        </Dropdown.Item>
      ))}
    </Dropdown>
  )
})

const WeekdayLabels = observer(() => {
  const { viewMode, weekData, isLoadingWeek } = container.resolve(WeekInView)
  const { thisWeekStartDate } = container.resolve(NewWeekPromptHandler)
  const { weekdayId } = useCurrentDay()
  const weekInViewStartDate = new Date(weekData.startDate)
  const isViewingCurrentWeek = isSameDay(weekInViewStartDate, thisWeekStartDate)
  const dayNames = useMediaQuery<string[]>('(max-width: 600px)', weekdayInitials, weekdaysShort)

  return (
    <>
      {dayNames.map((day, index) => (
        <Flex
          center
          sx={{
            position: 'relative',
            height: 'row',
            flex: 1,
            '&::before': {
              zIndex: -1,
              position: 'absolute',
              inset: 0,
              left: '1px',
              content: '""',
              backgroundColor: (!isLoadingWeek && isViewingCurrentWeek && index === weekdayId) ? viewMode : 'transparent',
              borderTopLeftRadius: 'default',
              borderTopRightRadius: 'default',
            }
          }}
          key={index}
        >
          {day}
        </Flex>
      ))}
    </>
  )
})

export default observer(WeekTableColumnTitles)