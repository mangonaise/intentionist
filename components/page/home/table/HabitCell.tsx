import type { Habit } from '@/lib/logic/app/HabitsHandler'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'
import { ColumnsDisplayContext } from '../WeekTable'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Link from '@/components/primitives/Link'
import Dropdown from '@/components/app/Dropdown'
import NextLink from 'next/link'

const HabitCell = observer(({ habit }: { habit: Habit }) => {
  const { showHabitNames } = useContext(ColumnsDisplayContext)

  return (
    <Flex
      center
      sx={{
        minHeight: 'row',
        borderTop: 'solid 1px',
        borderColor: 'grid',
      }}
    >
      {showHabitNames
        ? <HabitCellWithName habit={habit} />
        : <HabitCellWithoutName habit={habit} />}
    </Flex>
  )
})

const HabitCellWithName = ({ habit }: { habit: Habit }) => {
  return (
    <Flex
      align="center"
      sx={{
        size: '100%',
        pl: 2,
        opacity: 0,
        animation: 'fade-in forwards 600ms',
      }}
    >
      <HabitCellIcon habitIcon={habit.icon} />
      <NextLink href={`/habits/${habit.id}?returnHome=true`}>
        <Link
          sx={{
            width: '100%',
            maxWidth: 'min(30vw, 50ch)',
            marginLeft: 3,
            paddingY: '2px',
            paddingRight: ['0.6em', 3],
            overflowWrap: 'break-word'
          }}
        >
          {habit.name}
        </Link>
      </NextLink>
    </Flex>
  )
}

const HabitCellWithoutName = ({ habit }: { habit: Habit }) => {
  const router = useRouter()

  useEffect(() => {
    router.prefetch('/habits/[id]')
  }, [])

  return (
    <Dropdown
      noGap
      title={<HabitCellIcon habitIcon={habit.icon} />}
      sx={{
        size: '100%',
        '& > button': {
          paddingY: 0,
          paddingX: 3,
          background: 'none',
          borderRadius: 0
        }
      }}>
      <Dropdown.Item
        itemAction={() => router.push(`/habits/${habit.id}?returnHome=true`)}
        sx={{ maxWidth: '100vw' }}
      >
        {habit.name}
      </Dropdown.Item>
    </Dropdown>

  )
}

const HabitCellIcon = ({ habitIcon }: { habitIcon: string }) => {
  return <SmartEmoji nativeEmoji={habitIcon} nativeFontSize="1.2rem" twemojiSize={18} />
}

export default HabitCell