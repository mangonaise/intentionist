import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import WeekHandler, { WeekViewMode } from '@/logic/app/WeekHandler'
import accentColor from '@/logic/utils/accentColor'
import useMediaQuery from '@/hooks/useMediaQuery'
import SlidingTabPicker from '@/components/app/SlidingTabPicker'
import CalendarIcon from '@/components/icons/CalendarIcon'
import TimerIcon from '@/components/icons/TimerIcon'
import NotebookIcon from '@/components/icons/NotebookIcon'

const tabData: Array<{ view: WeekViewMode, text: string, icon: () => JSX.Element }> = [
  { view: 'tracker', text: 'Habit tracker', icon: CalendarIcon },
  { view: 'notes', text: 'Notes', icon: NotebookIcon },
  { view: 'focus', text: 'Focused time', icon: TimerIcon }
]

const WeekViewModePicker = () => {
  const { viewMode, setViewMode } = container.resolve(WeekHandler)

  const isSmallScreen = useMediaQuery('(max-width: 500px)', true, false)

  useEffect(() => {
    accentColor.set(viewMode)
  }, [viewMode])

  return (
    <SlidingTabPicker
      data={tabData.map((data) => ({
        text: data.text,
        color: data.view,
        icon: data.icon,
        onClick: () => setViewMode(data.view)
      }))}
      hideText={isSmallScreen}
      activeIndex={tabData.indexOf(tabData.find((data) => data.view === viewMode)!)}
    />
  )
}

export default observer(WeekViewModePicker)