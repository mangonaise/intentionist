import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, Dropdown } from '@/components/app'
import { CenteredFlex, Flex, Icon, IconButton, Text } from '@/components/primitives'
import { ArrowRightIcon, CheckIcon } from '@/components/icons'
import { addMonths, eachWeekOfInterval, endOfMonth, format, isFuture, isSameDay, isSameMonth, isSameWeek, startOfMonth, subWeeks } from 'date-fns'
import { formatYYYYMMDD, getFirstDayOfThisWeek } from '@/lib/logic/utils/dateUtilities'
import WeekHandler from '@/lib/logic/app/WeekHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import styled from '@emotion/styled'
import css from '@styled-system/css'

const WeekDropdown = observer(() => {
  const { startDate } = container.resolve(WeekHandler).weekInView
  const thisWeekStartDate = getFirstDayOfThisWeek()

  let title: string
  if (startDate === formatYYYYMMDD(thisWeekStartDate)) {
    title = 'This week'
  } else if (startDate === formatYYYYMMDD(subWeeks(thisWeekStartDate, 1))) {
    title = 'Last week'
  } else {
    title = `Week of ${format(new Date(startDate), 'd MMM yyyy')}`
  }

  return (
    <Dropdown title={title} width="fit-content">
      <WeekSelectMenu />
    </Dropdown>
  )
})

const WeekSelectMenu = () => {
  const weekHandler = container.resolve(WeekHandler)
  const [selectedDate] = useState(new Date(weekHandler.weekInView.startDate))
  const [displayedMonth, setDisplayedMonth] = useState(startOfMonth(selectedDate))
  const [displayedWeeks, setDisplayedWeeks] = useState(getWeeksInMonth(displayedMonth))
  const [isDisplayingCurrentMonth, setIsDisplayingCurrentMonth] = useState(isSameMonth(displayedMonth, new Date()))

  function handleSelectWeek(startDate: Date) {
    weekHandler.viewWeek(formatYYYYMMDD(startDate))
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
    <Flex flexDirection="column">
      {!isSameWeek(selectedDate, new Date()) && (
        <ThisWeekButtonWrapper>
          <Dropdown.Item
            bg={accentColor.current} reduceHoverOpacity
            action={() => handleSelectWeek(getFirstDayOfThisWeek())}
          >
            <CenteredFlex>
              View this week
              <Icon icon={ArrowRightIcon} fontSize="1.2rem" ml={2} />
            </CenteredFlex>
          </Dropdown.Item>
        </ThisWeekButtonWrapper>
      )}
      <CenteredFlex borderBottom="solid 1px" borderColor="whiteAlpha.10">
        <ChangeMonthButton
          icon={ChevronLeftIcon}
          onClick={() => changeDisplayedMonth(-1)}
        />
        <CenteredFlex width="14ch">
          <Text as="span" fontWeight="semibold">
            {format(displayedMonth, 'MMMM yyyy')}
          </Text>
        </CenteredFlex>
        <ChangeMonthButton
          icon={ChevronRightIcon}
          onClick={() => changeDisplayedMonth(1)}
          disable={isDisplayingCurrentMonth}
        />
      </CenteredFlex>
      <CenteredFlex py={2} bg="whiteAlpha.5">
        <Text fontSize="0.8rem" opacity={0.75} pl={2}>View week beginning on</Text>
      </CenteredFlex>
      <WeekButtonsWrapper pt="1px" borderTop="solid 1px" borderColor="whiteAlpha.10">
        {displayedWeeks.map((weekStart, index) => (
          <Dropdown.Item action={() => handleSelectWeek(weekStart)} key={index}>
            <Flex alignItems="center">
              Mon {format(weekStart, 'do')}
              {isSameDay(weekStart, selectedDate) && (
                <Icon ml="auto" fontSize="1.2rem" icon={CheckIcon} />
              )}
            </Flex>
          </Dropdown.Item>
        ))}
      </WeekButtonsWrapper>
    </Flex>
  )
}

const ThisWeekButtonWrapper = styled.div(css({
  borderBottom: 'solid 1px',
  borderColor: 'divider',
  p: 2,
  pb: 'calc(0.5rem + 1px)',
  textAlign: 'center',
  '& button': {
    width: '100%',
    margin: '0 !important',
    paddingY: '0.7rem !important'
  }
}))

const ChangeMonthButton = styled(IconButton)<{ disable?: boolean }>(({ disable }: { disable?: boolean }) => css({
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
}))

const WeekButtonsWrapper = styled(Flex)(css({
  flexDirection: 'column',
  '& button:first-of-type:not(:last-child)': {
    borderRadius: 0
  }
}))

export default WeekDropdown