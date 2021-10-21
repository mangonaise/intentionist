import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext, useLayoutEffect, useRef } from 'react'
import { isSameDay } from 'date-fns'
import { ColumnsDisplayContext as ColumnsDisplayHandlerContext } from '../../WeekTable'
import { Dropdown } from '@/components/app'
import { Flex } from '@/components/primitives'
import { weekdayNames } from '@/lib/logic/utils/_consts'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import WeekHandler, { WeekdayId, WeekViewMode } from '@/lib/logic/app/WeekHandler'
import NewWeekPromptHandler from '@/lib/logic/app/NewWeekPromptHandler'
import useCurrentDay from '@/lib/hooks/useCurrentDay'
import useElementWidth from '@/lib/hooks/useElementWidth'
import getCurrentWeekdayId from '@/lib/logic/utils/getCurrentWeekdayId'

const weekdaysShort = weekdayNames.map((day) => day.slice(0, 3))
const weekdayInitials = weekdayNames.map((day) => day.slice(0, 1))

const WeekTableColumnTitles = () => {
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

const FocusTitleRow = observer(() => {
  const { collapseColumns, setCollapseColumns: setIsCondensed } = useContext(ColumnsDisplayHandlerContext)
  const rowWrapperRef = useRef<HTMLDivElement>(null!)
  const width = useElementWidth(rowWrapperRef)

  useLayoutEffect(() => {
    setIsCondensed(width < 680)
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
          marginRight: '2.25rem',
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
  const { weekdayId, setWeekdayId } = useContext(ColumnsDisplayHandlerContext)
  const dayNames = useMediaQuery<string[]>('(max-width: 500px)', weekdaysShort, weekdayNames)

  useLayoutEffect(() => {
    setWeekdayId(getCurrentWeekdayId())
  }, [])

  return (
    <Dropdown
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
  const { viewMode, weekInView, isLoadingWeek } = container.resolve(WeekHandler)
  const { thisWeekStartDate } = container.resolve(NewWeekPromptHandler)
  const { weekdayId } = useCurrentDay()
  const weekInViewStartDate = new Date(weekInView.startDate)
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