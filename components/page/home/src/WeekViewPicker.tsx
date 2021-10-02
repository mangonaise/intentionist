import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Flex, IconButton } from '@/components/primitives'
import { CalendarIcon, JournalIcon, TimerIcon } from '@/components/icons'
import WeeksHandler, { WeekView } from '@/lib/logic/app/WeeksHandler'
import accentColor from '@/lib/logic/utils/accentColor'
import { container } from 'tsyringe'

const buttonData: Array<{ view: WeekView, text: string, icon: () => JSX.Element }> = [
  { view: 'tracker', text: 'Habit tracker', icon: CalendarIcon },
  { view: 'journal', text: 'Journal', icon: JournalIcon },
  { view: 'focus', text: 'Focused time', icon: TimerIcon }
]

const WeekViewPicker = () => {
  const { view, setView } = container.resolve(WeeksHandler) 

  useEffect(() => {
    accentColor.set(view)
  }, [view])

  return (
    <Flex>
      {buttonData.map((data, index) => (
        <IconButton
          icon={data.icon}
          onClick={() => setView(data.view)}
          flex={1}
          mr={index < 2 ? 3 : 0}
          bg={data.view === view ? data.view : ''}
          style={{ transition: 'var(--focus-transition), background-color 200ms' }}
          key={data.view}
        >
          {data.text}
        </IconButton>
      ))}
    </Flex>
  )
}

export default observer(WeekViewPicker)