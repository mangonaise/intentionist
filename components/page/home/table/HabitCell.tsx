import type { Habit } from '@/logic/app/HabitsHandler'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { ColumnsDisplayContext } from '../WeekTable'
import SmartEmoji from '@/components/app/SmartEmoji'
import Flex from '@/components/primitives/Flex'
import Dropdown from '@/components/app/Dropdown'
import NextLink from 'next/link'
import Button from '@/components/primitives/Button'
import Text from '@/components/primitives/Text'

const HabitCell = observer(({ habit }: { habit: Habit }) => {
  const { showHabitNames } = useContext(ColumnsDisplayContext)

  return (
    <Flex
      center
      sx={{
        borderTop: 'solid 1px',
        borderColor: 'grid'
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
    <NextLink href={`/habits/${habit.id}?returnHome=true`}>
      <Button
        sx={{
          size: '100%',
          padding: 0,
          background: 'none',
          borderRadius: 0
        }}
      >
        <Flex
          align="center"
          sx={{
            paddingLeft: 2,
            opacity: 0,
            animation: 'fade-in forwards 600ms',
          }}
        >
          <HabitCellIcon habitIcon={habit.icon} />
          <Text
            type="span"
            sx={{
              width: '100%',
              maxWidth: 'min(30vw, 50ch)',
              marginLeft: 3,
              paddingY: '2px',
              paddingRight: ['0.6em', 3],
              overflowWrap: 'break-word',
              textAlign: 'left'
            }}
          >
            {habit.name}
          </Text>
        </Flex>
      </Button>
    </NextLink>
  )
}

const HabitCellWithoutName = ({ habit }: { habit: Habit }) => {
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
        href={`/habits/${habit.id}?returnHome=true`}
        sx={{ maxWidth: '100vw' }}
      >
        {habit.name}
      </Dropdown.Item>
    </Dropdown>

  )
}

const HabitCellIcon = ({ habitIcon }: { habitIcon: string }) => {
  return <SmartEmoji nativeEmoji={habitIcon} rem={1.2} />
}

export default HabitCell