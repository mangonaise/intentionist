import { SmartEmoji } from '@/components/app'
import { Flex, Link } from '@/components/primitives'
import { Habit } from '@/lib/logic/app/HabitsHandler'
import NextLink from 'next/link'

const HabitCell = ({ habit }: { habit: Habit }) => {
  return (
    <Flex center justify="flex-start"
      sx={{
        minHeight: 'row',
        pl: 2,
        borderTop: 'solid 1px',
        borderColor: 'grid',
        opacity: 0,
        animation: 'fade-in forwards 600ms'
      }}
    >
      <SmartEmoji nativeEmoji={habit.icon} nativeFontSize="1.25rem" twemojiSize={18} />
      <NextLink href={`/habits/${habit.id}?returnHome=true`} >
        <Link
          sx={{
            width: '100%',
            maxWidth: 'min(30vw, 50ch)',
            marginLeft: 2,
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

export default HabitCell