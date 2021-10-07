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
      {buttonData.map((data, index) => (
        <IconButton
          icon={data.icon}
          onClick={() => setViewMode(data.view)}
          flex={1}
          mr={index < 2 ? 3 : 0}
          bg={data.view === viewMode ? data.view : ''}
          style={{ transition: 'var(--focus-transition), background-color 200ms' }}
          key={data.view}
        >
          {data.text}
        </IconButton>
      ))}
    </Flex>
  )
}

export default observer(WeekViewModePicker)