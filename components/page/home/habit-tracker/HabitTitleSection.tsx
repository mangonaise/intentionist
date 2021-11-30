import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import SmartEmoji from '@/components/app/SmartEmoji'
import Link from '@/components/primitives/Link'
import Text from '@/components/primitives/Text'
import NextLink from 'next/link'
import Flex from '@/components/primitives/Flex'

const HabitTitleSection = () => {
  const { habit } = useContext(HabitContext)

  return (
    <NextLink href={{ pathname: 'habit', query: { id: habit.id } }} passHref>
      <Link
        tabIndex={habit.friendUid ? -1 : 0}
        sx={{
          width: 'fit-content', px: 1,
          fontSize: ['1.2rem', '1.5rem'], fontWeight: 'medium', borderRadius: 'default',
          pointerEvents: habit.friendUid ? 'none' : 'auto'
        }}
      >
        <Flex asSpan align="center">
          <SmartEmoji nativeEmoji={habit.icon} rem={1.2} />
          <Text
            type="span"
            sx={{
              ml: [2, 3], maxWidth: 'calc(100vw - 3.25rem)',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
            }}
          >
            {habit.name}
          </Text>
        </Flex>
      </Link>
    </NextLink>
  )
}

export default HabitTitleSection