import { FC, useCallback, useContext, useMemo, useState } from 'react'
import { HabitTrackerContext } from '@/components/page/home/HabitTracker'
import { getFirstDayOfLastWeek, getFirstDayOfThisWeek } from '@/logic/utils/dateUtilities'
import { startOfMonth, format, isSameMonth, addMonths, endOfMonth, eachWeekOfInterval, isFuture, isSameWeek, isSameDay, setDayOfYear, addWeeks } from 'date-fns'
import getYearAndDay from '@/logic/utils/getYearAndDay'
import useCurrentDay from '@/hooks/useCurrentDay'
import Dropdown from '@/components/app/Dropdown'
import Flex from '@/components/primitives/Flex'
import Divider from '@/components/primitives/Divider'
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon'
import Text from '@/components/primitives/Text'
import ChevronRightIcon from '@/components/icons/ChevronRightIcon'
import Icon from '@/components/primitives/Icon'
import CheckIcon from '@/components/icons/CheckIcon'
import Box from '@/components/primitives/Box'
import ArrowRightIcon from '@/components/icons/ArrowRightIcon'
import IconButton from '@/components/primitives/IconButton'

const WeekSelector = () => {
  const { weekStart, setWeekStart } = useContext(HabitTrackerContext)
  const { weekdayId } = useCurrentDay()

  const selectedDate = useMemo(() => {
    const date = new Date(`${weekStart.year}`)
    return setDayOfYear(date, weekStart.dayOfYear)
  }, [weekStart])

  const title = useMemo(() => {
    const selectedDateValue = selectedDate.valueOf()
    if (selectedDateValue === getFirstDayOfThisWeek().valueOf()) {
      return 'This week'
    }
    if (selectedDateValue === getFirstDayOfLastWeek().valueOf()) {
      return 'Last week'
    }
    return `Week of ${format(selectedDate, 'd MMM yyyy')}`
  }, [selectedDate, weekdayId])

  const disableNextWeekButton = useMemo(() => {
    return selectedDate >= getFirstDayOfThisWeek()
  }, [selectedDate, weekdayId])

  const changeWeek = useCallback((delta: -1 | 1) => {
    const newDate = addWeeks(selectedDate, delta)
    setWeekStart(getYearAndDay(newDate))
  }, [selectedDate])

  return (
    <Flex sx={{ '& > button': { bg: 'transparent' } }}>
      <IconButton icon={ChevronLeftIcon} onClick={() => changeWeek(-1)} />
      <Dropdown
        title={title}
        noArrow
        sx={{
          minWidth: '11.5rem',
          '& > button': { display: 'flex', justifyContent: 'center', px: 0, bg: 'transparent' }
        }}
      >
        <MenuContent selectedDate={selectedDate} />
      </Dropdown>
      <IconButton icon={ChevronRightIcon} onClick={() => changeWeek(1)} disabled={disableNextWeekButton} />
    </Flex>
  )
}

const MenuContent = ({ selectedDate }: { selectedDate: Date }) => {
  const { setWeekStart } = useContext(HabitTrackerContext)
  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(selectedDate))
  const [displayedWeeks, setDisplayedWeeks] = useState(getWeeksInMonth(displayedMonth))
  const [isDisplayingCurrentMonth, setIsDisplayingCurrentMonth] = useState(isSameMonth(displayedMonth, new Date()))

  function handleSelectWeek(startDate: Date) {
    setWeekStart(getYearAndDay(startDate))
  }

  function changeDisplayedMonth(delta: 1 | -1) {
    if (delta === 1 && isDisplayingCurrentMonth) return
    const newMonth = addMonths(displayedMonth, delta)
    setDisplayedMonth(newMonth)
    setDisplayedWeeks(getWeeksInMonth(newMonth))
    setIsDisplayingCurrentMonth(isSameMonth(newMonth, new Date()))
  }

  function getWeeksInMonth(monthStart: Date) {
    const monthEnd = endOfMonth(monthStart)
    return eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 })
      .filter((weekStart) => isSameMonth(weekStart, monthStart))
      .filter((weekStart) => !isFuture(weekStart))
  }

  return (
    <Flex column>
      {!isSameWeek(selectedDate, new Date(), { weekStartsOn: 1 }) && (
        <>
          <ViewThisWeekButton onClick={() => handleSelectWeek(getFirstDayOfThisWeek())} />
          <Divider />
        </>
      )}
      <Flex center>
        <ChangeMonthButton
          icon={ChevronLeftIcon}
          onClick={() => changeDisplayedMonth(-1)}
        />
        <Flex center sx={{ width: '14ch' }}>
          <Text type="span" sx={{ fontWeight: 'semibold' }}>
            {format(displayedMonth, 'MMMM yyyy')}
          </Text>
        </Flex>
        <ChangeMonthButton
          icon={ChevronRightIcon}
          onClick={() => changeDisplayedMonth(1)}
          disable={isDisplayingCurrentMonth}
        />
      </Flex>
      <Flex center sx={{ py: 2, bg: 'whiteAlpha.5' }}>
        <Text sx={{ fontSize: '0.8rem', opacity: 0.75 }}>
          View week beginning on
        </Text>
      </Flex>
      {displayedWeeks.map((weekStart, index) => (
        <WeekButton
          weekStart={weekStart}
          selectedDate={selectedDate}
          onSelectWeek={handleSelectWeek}
          key={index}
        />
      ))}
    </Flex>
  )
}

interface WeekButtonProps {
  weekStart: Date,
  selectedDate: Date,
  onSelectWeek: (startDate: Date) => void
}

const WeekButton = ({ weekStart, selectedDate, onSelectWeek }: WeekButtonProps) => {
  const isSelectedDate = isSameDay(weekStart, selectedDate)

  return (
    <Dropdown.Item
      itemAction={() => onSelectWeek(weekStart)}
      sx={{ ':first-of-type': { borderTopLeftRadius: 0, borderTopRightRadius: 0 } }}
    >
      <Flex align="center" sx={{ width: '100%' }}>
        <Text type="span">
          Mon {format(weekStart, 'do')}
        </Text>
        {isSelectedDate && (
          <Icon icon={CheckIcon} sx={{ ml: 3 }} />
        )}
      </Flex>
    </Dropdown.Item>
  )
}

const ViewThisWeekButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Box sx={{ p: 2, pb: 'calc(0.5rem + 1px)', textAlign: 'center', }}>
      <Dropdown.Item
        sx={{
          bg: 'accent',
          width: '100%',
          margin: '0',
          paddingY: '0.7rem',
          borderRadius: 'default',
          minHeight: '2.5rem'
        }}
        hoverEffect="opacity"
        itemAction={onClick}
      >
        <Flex center>
          View this week
          <Icon icon={ArrowRightIcon} sx={{ ml: 2 }} />
        </Flex>
      </Dropdown.Item>
    </Box>
  )
}

const ChangeMonthButton: FC<{ icon: () => JSX.Element, onClick: () => void, disable?: boolean }> = ({ icon, onClick, disable, children }) => (
  <IconButton
    icon={icon}
    onClick={onClick}
    sx={{
      position: 'relative',
      paddingX: 4,
      paddingY: 4,
      backgroundColor: 'transparent !important',
      opacity: disable ? 0.5 : 1,
      cursor: disable ? 'default' : undefined,
      '&:hover::after': {
        content: '""',
        position: 'absolute',
        inset: '4px',
        borderRadius: 'default',
        backgroundColor: disable ? '' : 'buttonHighlight'
      }
    }}
  >
    {children}
  </IconButton>
)

export default WeekSelector