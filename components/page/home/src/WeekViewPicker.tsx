import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Flex, IconButton } from '@/components/primitives'
import { CalendarIcon, JournalIcon, TimerIcon } from '@/components/icons'
import WeekHandler, { WeekViewMode } from '@/lib/logic/app/WeekHandler'
import accentColor from '@/lib/logic/utils/accentColor'

const buttonData: Array<{ view: WeekViewMode, text: string, icon: () => JSX.Element }> = [
  { view: 'tracker', text: 'Habit tracker', icon: CalendarIcon },
  { view: 'journal', text: 'Journal', icon: JournalIcon },
  { view: 'focus', text: 'Focused time', icon: TimerIcon }
]

const WeekViewModePicker = () => {
  const { viewMode, setViewMode } = container.resolve(WeekHandler)

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
              mr: index < 2 ? 3 : 0,
              bg: isSelected ? data.view : undefined,
              transition: `background-color ${isSelected ? 250 : 150}ms ease-out !important`,
            }}
            key={data.view}
          >
            {data.text}
          </IconButton>
        )
      })}
    </Flex>
  )
}

export default observer(WeekViewModePicker)