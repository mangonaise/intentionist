import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import WeekHandler, { WeekViewMode } from '@/lib/logic/app/WeekHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import useMediaQuery from '@/lib/hooks/useMediaQuery'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'
import CalendarIcon from '@/components/icons/CalendarIcon'
import JournalIcon from '@/components/icons/JournalIcon'
import TimerIcon from '@/components/icons/TimerIcon'

const buttonData: Array<{ view: WeekViewMode, text: string, icon: () => JSX.Element }> = [
  { view: 'tracker', text: 'Habit tracker', icon: CalendarIcon },
  { view: 'journal', text: 'Journal', icon: JournalIcon },
  { view: 'focus', text: 'Focused time', icon: TimerIcon }
]

const WeekViewModePicker = () => {
  const { viewMode, setViewMode } = container.resolve(WeekHandler)

  const isSmallScreen = useMediaQuery('(max-width: 500px)', true, false)

  useEffect(() => {
    accentColor.set(viewMode)
  }, [viewMode])

  return (
    <Flex>
      {buttonData.map((data, index) => {
        const isSelected = data.view === viewMode
        return (
          <IconButton
            icon={data.icon}
            onClick={() => setViewMode(data.view)}
            hoverEffect={isSelected ? 'none' : 'default'}
            sx={{
              flex: 1,
              mr: index < 2 ? 2 : 0,
              bg: isSelected ? data.view : null,
              transition: `background-color ${isSelected ? 250 : 150}ms ease-out !important`,
            }}
            key={data.view}
          >
            {!isSmallScreen && data.text}
          </IconButton>
        )
      })}
    </Flex>
  )
}

export default observer(WeekViewModePicker)