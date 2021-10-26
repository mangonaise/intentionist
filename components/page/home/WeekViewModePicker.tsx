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

const borderOffsets = {
  'tracker': '0',
  'journal': 'calc(100% / 3)',
  'focus': 'calc(100% / 3 * 2)'
}

const WeekViewModePicker = () => {
  const { viewMode, setViewMode } = container.resolve(WeekHandler)

  const isSmallScreen = useMediaQuery('(max-width: 500px)', true, false)

  useEffect(() => {
    accentColor.set(viewMode)
  }, [viewMode])

  return (
    <Flex
      sx={{
        position: 'relative',
        borderBottom: 'solid 2px transparent',
        '&::after': {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          left: borderOffsets[viewMode],
          width: 'calc(100% / 3)',
          bottom: '-2px',
          content: '""',
          borderBottom: 'solid 2px',
          borderBottomColor: viewMode,
          transition: 'border-color 300ms, left 300ms cubic-bezier(0, 0, 0.15, 1.0)'
        }
      }}
    >
      {buttonData.map((data) => {
        const isSelected = data.view === viewMode
        return (
          <IconButton
            icon={data.icon}
            onClick={() => setViewMode(data.view)}
            hoverEffect="none"
            sx={{
              flex: 1,
              position: 'relative',
              paddingBottom: 4,
              paddingTop: 2,
              color: isSelected ? data.view : 'text',
              filter: 'brightness(1.5)',
              backgroundColor: 'transparent',
              borderBottom: 'solid 2px transparent',
              borderRadius: 0,
              fontWeight: 'medium',
              transition: `color 350ms`,
              '&::after': {
                position: 'absolute',
                inset: 0,
                content: '""',
                bottom: '-4px',
                borderBottom: 'solid 2px',
                borderColor: isSelected ? 'whiteAlpha.25' : 'whiteAlpha.10',
                transition: 'border-color 150ms'
              },
              '&:hover::after': {
                borderColor: isSelected ? null : 'whiteAlpha.25'
              }
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