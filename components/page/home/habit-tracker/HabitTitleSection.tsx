import { useContext } from 'react'
import { HabitContext } from '@/components/page/home/habit-tracker/HabitWrapper'
import { HabitTrackerScreenContext } from '@/components/page/home/HabitTracker'
import SmartEmoji from '@/components/app/SmartEmoji'
import Link from '@/components/primitives/Link'
import Text from '@/components/primitives/Text'
import NextLink from 'next/link'

const HabitTitleSection = () => {
  const { isSmallScreen } = useContext(HabitTrackerScreenContext)
  const { habit } = useContext(HabitContext)

  return (
    <NextLink href={{ pathname: 'habit', query: { id: habit.id } }}>
      <Link
        tabIndex={habit.friendUid ? -1 : 0}
        sx={{
          display: 'flex', alignItems: 'center', width: 'fit-content', px: 1,
          fontSize: ['1.2rem', '1.5rem'], fontWeight: 'medium', borderRadius: 'default',
          pointerEvents: habit.friendUid ? 'none' : 'auto'
        }}
      >
        <SmartEmoji nativeEmoji={habit.icon} rem={isSmallScreen ? 1.2 : 1.5} />
        <Text
          type="span"
          sx={{
            // todo: adjust maxWidth based on whether screen has excess width
            ml: [2, 3], maxWidth: 'min(700px, calc(100vw - 3.25rem))',
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
          }}
        >
          {habit.name}
        </Text>
      </Link>
    </NextLink>
  )
}

export default HabitTitleSection