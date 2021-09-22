import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { setAccentColor } from 'styles/theme'
import weeksHandler, { WeekView } from '@/lib/app/weeksHandler'
import CalendarIcon from '@/components/icons/CalendarIcon'
import JournalIcon from '@/components/icons/JournalIcon'
import TimerIcon from '@/components/icons/TimerIcon'
import Flex from '@/components/primitives/Flex'
import IconButton from '@/components/primitives/IconButton'

const buttonData: Array<{ view: WeekView, text: string, icon: () => JSX.Element }> = [
  { view: 'tracker', text: 'Habit tracker', icon: CalendarIcon },
  { view: 'journal', text: 'Journal', icon: JournalIcon },
  { view: 'focus', text: 'Focused time', icon: TimerIcon}
]

const WeekViewPicker = () => {
  const { view, setView } = weeksHandler()

  useEffect(() => {
    setAccentColor(view)
  }, [view])

  return (
    <Flex>
      {buttonData.map((data, index) => (
        <IconButton
          icon={data.icon}
          onClick={() => setView(data.view)}
          flex={1}
          mr={index < 2 ? 3 : 0}
          bg={data.view === view ? 'var(--accent-color)' : ''}
          key={data.view}
        >
          {data.text}
        </IconButton>
      ))}
    </Flex>
  )
}

export default observer(WeekViewPicker)