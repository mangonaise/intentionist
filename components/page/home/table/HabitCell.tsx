import type { Habit } from '@/logic/app/HabitsHandler'
import { container } from 'tsyringe'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { ColumnsDisplayContext } from '../WeekTable'
import accentColor from '@/logic/utils/accentColor'
import FriendsHandler from '@/logic/app/FriendsHandler'
import SmartEmoji from '@/components/app/SmartEmoji'
import Dropdown from '@/components/app/Dropdown'
import Flex from '@/components/primitives/Flex'
import Button from '@/components/primitives/Button'
import Text from '@/components/primitives/Text'
import NextLink from 'next/link'

const HabitCell = observer(({ habit }: { habit: Habit }) => {
  const { showHabitNames } = useContext(ColumnsDisplayContext)
  const readonly = !!habit.friendUid

  return (
    <Flex
      center
      sx={{
        position: 'relative',
        borderTop: 'solid 1px',
        borderColor: 'grid',
        '& button:disabled': { opacity: 1 },
        '&::before': readonly ? {
          zIndex: -1,
          position: 'absolute',
          inset: 0,
          content: '""',
          backgroundColor: accentColor.current,
          opacity: 0.085
        } : {}
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
    <NextLink href={{ pathname: 'habit', query: { id: habit.id, returnHome: true } }}>
      <Button
        disabled={!!habit.friendUid}
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
            height: '100%'
          }}
        >
          <EmojiSection habit={habit} />
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
  const readonly = !!habit.friendUid

  return (
    <Dropdown
      title={<EmojiSection habit={habit} />}
      noGap
      noArrow={readonly}
      disabled={readonly}
      sx={{
        size: '100%',
        '& > button': {
          paddingY: 0,
          paddingX: 2,
          background: 'none',
          borderRadius: 0
        }
      }}>
      <Dropdown.Item
        href={{ pathname: 'habit', query: { id: habit.id, returnHome: true } }}
        sx={{ maxWidth: '100vw' }}
      >
        {habit.name}
      </Dropdown.Item>
    </Dropdown>

  )
}

const EmojiSection = ({ habit }: { habit: Habit }) => {
  const friend = getFriendByUid(habit.friendUid)

  return (
    <>
      {!!friend && <Avatar emoji={friend.avatar} />}
      <HabitCellIcon icon={habit.icon} />
    </>
  )
}

const Avatar = ({ emoji }: { emoji: string }) => {
  return (
    <Flex
      center
      sx={{ mr: 2, pr: 2, minHeight: '100%', borderRight: 'solid 1px', borderColor: 'grid' }}
    >
      <HabitCellIcon icon={emoji} />
    </Flex>
  )
}

const HabitCellIcon = ({ icon }: { icon: string }) => {
  return <SmartEmoji nativeEmoji={icon} rem={1.2} />
}

function getFriendByUid(uid?: string) {
  return uid ? container.resolve(FriendsHandler).friends.find((friend) => friend.uid === uid) : undefined
}

export default HabitCell